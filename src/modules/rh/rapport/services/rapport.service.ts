// src/modules/rapport/services/rapport.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { RapportType, ExportFormat, AuditModule, LogLevel, RhModule } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';
import { promises as fsPromises } from 'fs';
import { PrismaService } from 'src/prisma/prisma.service';
import { PdfGeneratorService } from 'src/modules/admin/pdf-generator/services/pdf-generator.service';
import { ExcelGeneratorService } from 'src/modules/admin/excel-generator/services/excel-generator.service';
import { FilterRapportDto } from '../dto/filter-rapport.dto';
import { CreateRapportDto } from '../dto/create-rapport.dto';
import { JourAbsence, JourRetard } from 'src/modules/rh/salaire/paie.types';
import { EntrepriseService } from 'src/modules/commerce/entreprise/services/entreprise.service';
import { RhLogService } from '../../log/rh-log.service';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';



interface LigneRetard {
  employe: string;
  email: string;
  mois: number;
  annee: number;
  date: string;
  estJustifie: boolean;
  statut: string;
  heureArrivee?: string; // ← nouveau champ
}

@Injectable()
export class RapportService {
  private readonly OUTPUT_DIR = path.join(process.cwd(), 'storage', 'rapports');

  constructor(
    private readonly prisma: PrismaService,
    private readonly pdfGen: PdfGeneratorService,
    private readonly excelGen: ExcelGeneratorService,
    private readonly entrepriseService: EntrepriseService,
    private readonly rhLog: RhLogService,
    private readonly realtimeGateway: StockRealtimeGateway,

  ) {
    if (!fs.existsSync(this.OUTPUT_DIR)) {
      fs.mkdirSync(this.OUTPUT_DIR, { recursive: true });
    }
  }

  // 1. CONFIGURATION EXTÉRIEURE (Allouée une seule fois au démarrage de l'application)
  private readonly MIME_TYPES: Record<ExportFormat, string> = {
    [ExportFormat.PDF]: 'application/pdf',
    [ExportFormat.EXCEL]: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    [ExportFormat.CSV]: 'text/csv',
  };
  private readonly DEFAULT_MIME_TYPE = 'application/octet-stream';

  // ─── GÉNÉRER ──────────────────────────────────────────────────────────────
  async generer(dto: CreateRapportDto, actorId: string) {
    // 1. PATTERN FAIL-FAST IMMÉDIAT
    if (!actorId) {
      throw new BadRequestException("L'identifiant admin est requis");
    }

    if (dto.formatExport === ExportFormat.CSV) {
      throw new BadRequestException(
        "Le format CSV n'est pas encore supporté — utilisez PDF ou EXCEL",
      );
    }

    // 2. PARALLÉLISATION DES LECTURES (I/O non bloquantes)
    const [data, actorName, entreprise] = await Promise.all([
      this.collectData(dto),
      this.rhLog.resolveActorName(actorId),
      this.entrepriseService.findFirst(), // ← add this
    ]);

    // 3. LAZY EVALUATION / CALCULS POST-LECTURE
    const periode = dto.mois && dto.annee
      ? `${String(dto.mois).padStart(2, '0')}/${dto.annee}`
      : `${dto.annee ?? 'global'}`;

    const avertissement = data && typeof data === 'object' && 'avertissement' in data
      ? (data as Record<string, any>).avertissement ?? null
      : null;

    // 4. GÉNÉRATION DU FICHIER PHYSIQUE
    const fichier = await this.genererFichier(dto, data, periode, entreprise);

    // 5. TRANSACTION D'ÉCRITURE ET D'AUDIT (ACID)
    // On utilise le gestionnaire transactionnel `tx` pour lier les deux opérations
    const result = await this.prisma.$transaction(async (tx) => {
      // Écriture 1 : Création du rapport
      const rapport = await tx.rapport.create({
        data: {
          userId: dto.userId ?? null,
          type: dto.type,
          periode,
          mois: dto.mois ?? null,
          annee: dto.annee ?? null,
          formatExport: dto.formatExport,
          fichier,
        },
      });

      // Écriture 2 : Enregistrement de l'audit (on passe `tx` en second paramètre si ton service d'audit le supporte)
      await this.rhLog.info({
        actorId,
        actorName,
        module: RhModule.RAPPORT,
        action: 'GENERER_RAPPORT',
        entityId: rapport.id,
        entityName: `Rapport ${dto.type} — ${periode}`,
        apres: {
          type: dto.type, periode, formatExport: dto.formatExport,
          userId: dto.userId ?? 'global', fichier, avertissement: avertissement ?? 'aucun'
        },
        message: `Rapport ${dto.type} généré (${dto.formatExport}) pour ${periode}${avertissement ? ' — ⚠️ données partielles' : ''}`,
      }, tx);


      // Retour final standardisé une fois la transaction validée (commit)
      return { rapport, fichier, avertissement };
    });

    this.realtimeGateway.emitEntityChanged({ module: 'rapport', action: 'created', id: result.rapport.id });
    return result;
  }

  // ─── TÉLÉCHARGER ──────────────────────────────────────────────────────────

  async getStream(id: string): Promise<{
    stream: fs.ReadStream;
    filename: string;
    mimeType: string;
  }> {
    // 2. PATTERN FAIL-FAST IMMÉDIAT
    if (!id) {
      throw new BadRequestException("L'identifiant du rapport n'est pas fourni");
    }

    // NOTE : Assure-toi que ton findOne(id) utilise un select partiel si possible 
    // pour ne remonter que { fichier, formatExport } de la base de données.
    const rapport = await this.findOne(id);
    if (!rapport?.fichier) {
      throw new BadRequestException('Aucun fichier disponible pour ce rapport');
    }

    // 3. VÉRIFICATION DE L'ACCÈS PHYSIQUE SUR LE DISQUE
    try {
      await fsPromises.access(rapport.fichier, fs.constants.R_OK);
    } catch {
      throw new NotFoundException("Le fichier n'existe plus ou n'est pas lisible sur le serveur");
    }

    // 4. LAZY EVALUATION & ENVOI DU FLUX DU FICHIER
    return {
      stream: fs.createReadStream(rapport.fichier),
      filename: path.basename(rapport.fichier), // Calculé uniquement si le fichier est accessible
      mimeType: this.MIME_TYPES[rapport.formatExport] ?? this.DEFAULT_MIME_TYPE,
    };
  }

  // ─── FIND ALL ───────────────────────────────────────────────────────────
  async findAll(filters?: FilterRapportDto) {
    // 1. CALCUL DES VARIABLES DE PAGINATION VIA LES VALEURS PAR DÉFAUT DU DTO
    // On évite les conversions répétées avec Number() si le ValidationPipe s'en charge déjà.
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 50;
    const skip = (page - 1) * limit;

    // 2. EXTRACTION FILTRÉE & SÉCURISATION DE L'OBJET WHERE
    const where: any = {};

    // Gestion propre du booléen d'archivage (évite le piège du undefined implicite de Prisma)
    if (!filters?.includeArchived) {
      where.estArchive = false;
    }

    // Assignations directes (plus rapides à exécuter)
    if (filters?.type) where.type = filters.type;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.mois) where.mois = filters.mois;
    if (filters?.annee) where.annee = filters.annee;

    // 3. DOUBLE REQUÊTE PARALLÈLE SÉCURISÉE (Données + Total)
    const [data, total] = await Promise.all([
      this.prisma.rapport.findMany({
        where,
        include: {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        orderBy: { dateGeneration: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.rapport.count({ where }),
    ]);

    // 4. FORMAT DE RÉPONSE STANDARDISÉ
    return {
      data,
      meta: {
        total,
        page,
        limit,
        pagesTotales: Math.ceil(total / limit) || 1, // Évite de renvoyer 0 si la base est vide
      },
    };
  }

  // ─── FIND ONE ─────────────────────────────────────────────────────────────
  async findOne(id: string) {
    // 1. PATTERN FAIL-FAST IMMÉDIAT
    if (!id) {
      throw new BadRequestException("L'identifiant du rapport est requis");
    }

    // 2. REQUÊTE SQL DIRECTE
    const rapport = await this.prisma.rapport.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    // 3. GUARD CLAUSE D'EXISTENCE
    if (!rapport) {
      throw new NotFoundException(`Rapport #${id} introuvable`);
    }

    return rapport;
  }

  // ─── SOFT DELETE ────────────────────────────────────────────────
  async softDelete(id: string, actorId: string) {
    // 1. PATTERN FAIL-FAST IMMÉDIAT
    if (!id) throw new BadRequestException("L'identifiant du rapport est requis");
    if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

    // 2. PARALLÉLISATION DES LECTURES (I/O)
    const [rapport, actorName] = await Promise.all([
      this.findOne(id),
      this.rhLog.resolveActorName(actorId),
    ]);

    // Double sécurité : Si le rapport est déjà archivé, on s'arrête immédiatement
    if (rapport.estArchive) {
      throw new ConflictException("Ce rapport est déjà archivé ou supprimé");
    }

    // 3. TRANSACTION ACID (Base de données + Log d'audit)
    await this.prisma.$transaction(async (tx) => {
      // Écriture 1 : Soft delete / Archivage du rapport
      await tx.rapport.update({
        where: { id },
        data: {
          estArchive: true,
          deletedAt: new Date(),
          fichier: null // On nettoie la référence en BDD
        },
      });

      // Écriture 2 : Enregistrement de l'audit lié à la transaction
      await this.rhLog.warn({
        actorId,
        actorName,
        module: RhModule.RAPPORT,
        action: 'DELETE_RAPPORT',
        entityId: id,
        entityName: `Rapport ${rapport.type} — ${rapport.periode}`,
        avant: { type: rapport.type, periode: rapport.periode, formatExport: rapport.formatExport, fichier: rapport.fichier },
        message: `Rapport #${id} archivé — ${rapport.type} — ${rapport.periode}`,
      }, tx);
    });

    this.realtimeGateway.emitEntityChanged({ module: 'rapport', action: 'deleted', id });

    // 4. SUPPRESSION DU FICHIER SUR LE DISQUE (Post-Commit)
    // On ne lance cette opération QUE si la transaction BDD a réussi à 100%
    if (rapport.fichier) {
      try {
        // fsPromises.unlink lève lui-même une erreur si le fichier n'existe pas,
        // l'appel préalable à fsPromises.access est une opération I/O redondante et inutile.
        await fsPromises.unlink(rapport.fichier);
      } catch {
        /* Fichier physique déjà absent ou introuvable — On ignore silencieusement */
      }
    }

    return { message: 'Le rapport a été supprimé avec succès' };
  }

  // ─── RESTORE ─────────────────────────────────────────────────────────────
  async restore(id: string, actorId: string) {
    // 1. PATTERN FAIL-FAST IMMÉDIAT (Validation des arguments avant les appels réseau)
    if (!id) throw new BadRequestException("L'identifiant du rapport est requis");
    if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

    // 2. PARALLÉLISATION DES LECTURES (I/O non bloquantes)
    const [rapport, actorName] = await Promise.all([
      this.prisma.rapport.findUnique({ where: { id } }),
      this.rhLog.resolveActorName(actorId),
    ]);

    // 3. SECOND RIDEAU DE GUARD CLAUSES (Validation de l'état de la ressource)
    if (!rapport) throw new NotFoundException(`Rapport #${id} introuvable`);

    if (!rapport.estArchive) {
      throw new BadRequestException("Ce rapport est déjà actif et n'est pas archivé");
    }

    // 4. TRANSACTION ACID POUR L'ÉCRITURE ET L'AUDIT
    await this.prisma.$transaction(async (tx) => {
      // Écriture 1 : Restauration du rapport (on réactive l'état)
      await tx.rapport.update({
        where: { id },
        data: {
          estArchive: false,
          deletedAt: null
        },
      });

      // Écriture 2 : Enregistrement de l'audit lié au même contexte transactionnel
      await this.rhLog.info({
        actorId,
        actorName,
        module: RhModule.RAPPORT,
        action: 'RESTORE_RAPPORT',
        entityId: id,
        entityName: `Rapport ${rapport.type} — ${rapport.periode}`,
        apres: { type: rapport.type, periode: rapport.periode, formatExport: rapport.formatExport },
        message: `Rapport #${id} restauré — ${rapport.type} — ${rapport.periode}`,
      }, tx);
    });

    this.realtimeGateway.emitEntityChanged({ module: 'rapport', action: 'restored', id });

    // 5. RETOUR STANDARDISÉ
    return { message: 'Le rapport a été restauré avec succès' };
  }



  // ══════════════════════════════════════════════════════════════════════════
  // VÉRIFICATIONS CLÔTURE
  // ══════════════════════════════════════════════════════════════════════════

  private async verifierAvertissementMasseSalariale(
    mois: number,
    annee: number,
    userId?: string,
  ): Promise<string | null> {
    const whereBase = {
      mois,
      annee,
      ...(userId ? { userId } : {}),
    };

    const [total, clotures] = await Promise.all([
      this.prisma.salaire.count({ where: whereBase }),
      this.prisma.salaire.count({ where: { ...whereBase, estCloture: true } }),
    ]);

    if (total === 0) return `Aucun salaire initialisé pour ${String(mois).padStart(2, '0')}/${annee}`;
    if (clotures < total) {
      return `Données partielles : ${clotures}/${total} salaire(s) clôturé(s) pour ${String(mois).padStart(2, '0')}/${annee}`;
    }

    return null; // tout est clôturé, pas d'avertissement
  }


  /** ABSENCES / RETARDS — non bloquant. Avertissement si clôture incomplète. */
  private async verifierCloturePourAvertissement(
    mois?: number,
    annee?: number,
    userId?: string,
  ): Promise<string | null> {
    if (!mois || !annee) return null;

    const [usersActifs, salairesClotures] = await Promise.all([
      this.prisma.user.count({
        where: { estArchive: false, ...(userId ? { id: userId } : {}) },
      }),
      this.prisma.salaire.count({
        where: { mois, annee, estCloture: true, ...(userId ? { userId } : {}) },
      }),
    ]);

    const periode = `${String(mois).padStart(2, '0')}/${annee}`;

    if (salairesClotures === 0) {
      return `⚠️ Le mois ${periode} n'est pas encore clôturé — les données sont partielles`;
    }
    if (salairesClotures < usersActifs) {
      return (
        `⚠️ Clôture partielle pour ${periode} — ` +
        `${usersActifs - salairesClotures} employé(s) sur ${usersActifs} sans salaire clôturé`
      );
    }
    return null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // COLLECTE DES DONNÉES
  // ══════════════════════════════════════════════════════════════════════════
  private async collectData(dto: CreateRapportDto): Promise<any> {
    // Filtre mois/annee — remplace l'ancien filtre sur le champ `date`
    const moisAnneeFilter = {
      ...(dto.mois ? { mois: dto.mois } : {}),
      ...(dto.annee ? { annee: dto.annee } : {}),
    };

    const userSelect = {
      user: { select: { id: true, firstName: true, lastName: true, email: true } },
    };

    switch (dto.type) {

      // ── ABSENCES ────────────────────────────────────────────────────────
      // ── 2. Case ABSENCES dans collectData (remplacer l'existant) ─────────────────
      case RapportType.ABSENCES: {
        const moisAnneeFilter = {
          ...(dto.mois ? { mois: dto.mois } : {}),
          ...(dto.annee ? { annee: dto.annee } : {}),
        };
        const userSelect = {
          user: { select: { id: true, firstName: true, lastName: true, email: true } },
        };

        const [avertissement, absences, retards, salaires] = await Promise.all([
          this.verifierCloturePourAvertissement(dto.mois, dto.annee, dto.userId),
          this.prisma.absence.findMany({
            where: { ...moisAnneeFilter, ...(dto.userId ? { userId: dto.userId } : {}) },
            include: userSelect,
            orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
          }),
          this.prisma.retard.findMany({
            where: { ...moisAnneeFilter, ...(dto.userId ? { userId: dto.userId } : {}) },
            include: userSelect,
            orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
          }),
          // Récupération des salaires pour la section calcul
          this.prisma.salaire.findMany({
            where: {
              estCloture: true,
              ...moisAnneeFilter,
              ...(dto.userId ? { userId: dto.userId } : {}),
            },
            include: {
              user: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phoneNumber: true,
                  adresse: true,
                  dateRecrutement: true,
                  role: { select: { post: true } },
                },
              },
            },
          }),
        ]);

        const absenceLignes = absences
          .flatMap(a =>
            ((a.jours as unknown) as JourAbsence[]).map(jour => ({
              employe: `${a.user.firstName} ${a.user.lastName}`,
              email: a.user.email,
              mois: a.mois,
              annee: a.annee,
              date: jour.date,
              estJustifie: jour.estJustifie,
              statut: jour.estJustifie ? 'Justifiée' : 'Injustifiée',
            })),
          )
          .sort((a, b) => a.date.localeCompare(b.date));

        const retardLignes = retards
          .flatMap(r =>
            ((r.jours as unknown) as JourRetard[]).map(jour => ({
              employe: `${r.user.firstName} ${r.user.lastName}`,
              email: r.user.email,
              mois: r.mois,
              annee: r.annee,
              date: jour.date,
              estJustifie: jour.estJustifie,
              heureArrivee: jour.heureArrivee, // ← nouveau champ
              statut: jour.estJustifie ? 'Justifié' : 'Injustifié (journée annulée)',
            })),
          )
          .sort((a, b) => a.date.localeCompare(b.date));

        return { absenceLignes, retardLignes, salaires, avertissement };
      }

      // ── MASSE_SALARIALE ───────────────────────────────────────────────────


      case RapportType.MASSE_SALARIALE: {
        // ✅ Avertissement au lieu de blocage
        const avertissement = (dto.mois && dto.annee)
          ? await this.verifierAvertissementMasseSalariale(dto.mois, dto.annee, dto.userId)
          : null;

        const salaires = await this.prisma.salaire.findMany({
          where: {
            estCloture: true,          // ← uniquement les clôturés
            ...moisAnneeFilter,
            ...(dto.userId ? { userId: dto.userId } : {}),
          },
          include: {
            ...userSelect,
            absence: { select: { jours: true } },
            retard: { select: { jours: true } },
            ficheDePaie: {
              select: { id: true, jourDePaie: true, dateGeneration: true },
            },
          },
          orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
        });

        let totalBrut = 0, totalDeductions = 0, totalPrimes = 0, totalNet = 0, totalVerse = 0;
        for (const s of salaires) {
          totalBrut += Number(s.salaireBrut ?? 0);
          totalDeductions += Number(s.totalDeductions ?? 0);
          totalPrimes += Number(s.totalPrimes ?? 0);
          totalNet += Number(s.salaireNet ?? 0);
          totalVerse += Number(s.montantVerse ?? 0);
        }

        return {
          agregats: {
            nbEmployes: salaires.length,
            totalBrut,
            totalDeductions,
            totalPrimes,
            totalNet,
            totalVerse,
          },
          salaires,
          avertissement, // ← null ou message si données partielles
        };
      }


      // ── CONTRATS_CDD ──────────────────────────────────────────────────────
      case RapportType.CONTRATS_CDD: {
        const dateLimite = new Date();
        dateLimite.setDate(dateLimite.getDate() + 90);

        return this.prisma.contrat.findMany({
          where: {
            type: 'CDD',
            dateFin: { lte: dateLimite, gte: new Date() },
            ...(dto.userId ? { userId: dto.userId } : {}),
          },
          include: { ...userSelect, alertes: true },
          orderBy: { dateFin: 'asc' },
        });
      }

      default:
        return [];
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // GÉNÉRATION DU FICHIER selon type + format
  // ══════════════════════════════════════════════════════════════════════════
  private async genererFichier(
    dto: CreateRapportDto,
    data: any,
    periode: string,
    entreprise: any,
  ): Promise<string> {
    const isPdf = dto.formatExport === ExportFormat.PDF;
    const isExcel = dto.formatExport === ExportFormat.EXCEL;

    switch (dto.type) {

      // ── 3. Case ABSENCES dans genererFichier (remplacer l'existant) ──────────────
      case RapportType.ABSENCES: {
        const { absenceLignes, retardLignes, salaires, avertissement } = data;
        if (isPdf) {
          return this.pdfGen.genererRapportAbsencesEtRetards(
            absenceLignes,
            retardLignes,
            periode,
            this.OUTPUT_DIR,
            avertissement,
            entreprise,
            salaires,   // ← passer les salaires pour la section calcul
          );
        }

        if (isExcel) {
          return this.excelGen.genererRapportAbsencesEtRetards(
            absenceLignes, retardLignes, periode, this.OUTPUT_DIR,
            avertissement, entreprise, salaires, // ← ces 3 paramètres manquaient
          );
        }
        break;
      }

      case RapportType.MASSE_SALARIALE: {
        if (isPdf) return this.pdfGen.genererRapportMasseSalariale(data, periode, this.OUTPUT_DIR, entreprise);
        if (isExcel) return this.excelGen.genererRapportMasseSalariale(data, periode, this.OUTPUT_DIR, entreprise);
        break;
      }

      case RapportType.CONTRATS_CDD: {
        if (isPdf) return this.pdfGen.genererRapportContratsCDD(data, periode, this.OUTPUT_DIR, entreprise);
        if (isExcel) return this.excelGen.genererRapportContratsCDD(data, periode, this.OUTPUT_DIR, entreprise);
        break;
      }
    }

    throw new BadRequestException(
      `Combinaison type=${dto.type} / format=${dto.formatExport} non supportée`,
    );
  }
}
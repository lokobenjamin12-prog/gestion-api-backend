











// salaire.service.ts
import {
    BadRequestException,
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import * as fs from 'fs';
import { PdfGeneratorService } from 'src/modules/admin/pdf-generator/services/pdf-generator.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { calculerPaie, getJoursOuvrables, round2 } from '../jours-ouvrables.util';
import { AuditModule, LogLevel, Prisma, RhModule, State } from '@prisma/client';
import { InitialiserSalaireDto } from '../dto/initialiser.salaire.dto';
import { AjouterPrimeDto } from '../dto/ajouter.prime.dto';
import { JourAbsence, JourRetard, Prime } from '../paie.types';
import { SupprimerPrimeDto } from '../dto/supprimer-prime.dto';
import { VersementDto } from '../dto/versement.dto';
import { GenererFicheDto } from '../dto/generer-fiche.dto';
import { FindAllSalairesDto } from '../dto/find-all-salaires.dto';
import { GetMasseSalarialeDto } from '../dto/get-masse-salariale.dto';
import { EntrepriseService } from 'src/modules/commerce/entreprise/services/entreprise.service';
import { RhLogService } from '../../log/rh-log.service';
import { HistoriquePaiementsDto } from '../dto/historique-paiements.dto';
import { StockRealtimeGateway } from 'src/modules/commerce/realtime/stock-realtime.gateway';


@Injectable()
export class SalaireService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly entrepriseService: EntrepriseService,
        private readonly pdfGen: PdfGeneratorService,
        private readonly rhLog: RhLogService,
        private readonly realtimeGateway: StockRealtimeGateway,
    ) { }

    // ─────────────────────────────────────────────────────────────────────────
    // INITIALISER UN SALAIRE
    // Appelé manuellement par l'admin en début de mois.
    // Snapshot du salaireBase de l'employé + calcul du prix journalier.
    // ─────────────────────────────────────────────────────────────────────────
    async initialiser(dto: InitialiserSalaireDto, actorId: string) {
        if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

        // 1. SUPER-PARALLÉLISATION : On lance l'intégralité des lectures asynchrones en une seule vague d'I/O
        const [user, existant, actorName] = await Promise.all([
            this.prisma.user.findUnique({
                where: { id: dto.userId },
                select: { id: true, firstName: true, lastName: true, salaireBase: true, active: true, profilePicture: true },
            }),
            this.prisma.salaire.findUnique({
                where: { userId_mois_annee: { userId: dto.userId, mois: dto.mois, annee: dto.annee } },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);

        // 2. PATTERN FAIL-FAST : Validations immédiates sur les résultats de la promesse groupée
        if (!user) {
            throw new NotFoundException(`Employé #${dto.userId} introuvable`);
        }

        if (!user.active) {
            throw new BadRequestException(`L'employé ${user.firstName} ${user.lastName} est inactif`);
        }

        if (existant) {
            const codeMois = String(dto.mois).padStart(2, '0');
            throw new ConflictException(
                `Un salaire existe déjà pour ${user.firstName} ${user.lastName} — ${codeMois}/${dto.annee}`,
            );
        }

        // 3. CALCULS MÉTIERS : Effectués uniquement si toutes les validations précédentes passent
        const nbJoursOuvrables = getJoursOuvrables(dto.mois, dto.annee);
        const salaireBrut = round2(Number(user.salaireBase));
        const prixJournalier = round2(salaireBrut / nbJoursOuvrables);

        // 4. TRANSACTION D'ÉCRITURE ET D'AUDIT
        const salaireCree = await this.prisma.$transaction(async (tx) => {
            const salaire = await tx.salaire.create({
                data: {
                    userId: dto.userId,
                    mois: dto.mois,
                    annee: dto.annee,
                    nbJoursOuvrables,
                    prixJournalier,
                    salaireBrut,
                    salaireNet: salaireBrut, // provisoire — recalculé à la clôture
                    primes: [] as any,       // Cast "as any" pour bypasser la sécurité stricte JSON de Prisma
                },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
                },
            });

            // Évaluation paresseuse des chaînes de l'audit (Uniquement si la création réussit)
            const nomEmploye = `${user.firstName} ${user.lastName}`;
            const codeMois = String(dto.mois).padStart(2, '0');

            await this.rhLog.info({
                actorId, actorName,
                module: RhModule.SALAIRE,
                action: 'INITIALISER_SALAIRE',
                entityId: salaire.id,
                entityName: `Salaire ${codeMois}/${dto.annee} — ${nomEmploye}`,
                apres: { salaireBrut, nbJoursOuvrables, prixJournalier },
                message: `Salaire initialisé pour ${nomEmploye} — ${codeMois}/${dto.annee} ...`,
            }, tx);

            return salaire;
        });

        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'created', id: salaireCree.id });
        return salaireCree;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AJOUTER UNE PRIME
    // Possible à tout moment avant la clôture.
    // ─────────────────────────────────────────────────────────────────────────
    async ajouterPrime(salaireId: string, dto: AjouterPrimeDto, actorId: string) {
        if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

        // 1. SUPER-PARALLÉLISATION : On lance la lecture de la base et la résolution d'audit en même temps
        const [salaire, actorName] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                select: { estCloture: true, primes: true, salaireBrut: true, totalDeductions: true },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);

        // 2. PATTERN FAIL-FAST : Guard clauses immédiates
        if (!salaire) throw new NotFoundException(`Salaire #${salaireId} introuvable`);
        if (salaire.estCloture) {
            throw new BadRequestException("Impossible d'ajouter une prime : le salaire est clôturé");
        }

        // 3. IMMUABILITÉ & OPTIMISATION CALCULS : Extraction et clonage de sécurité pour le tableau JSON
        const existingPrimes = (salaire.primes as unknown) as Prime[];

        // Utilisation d'une boucle classique : beaucoup plus rapide et performante qu'un .reduce() sur de grosses itérations
        let cumulPrimes = dto.somme;
        for (let i = 0; i < existingPrimes.length; i++) {
            cumulPrimes += existingPrimes[i].somme;
        }

        const totalPrimes = round2(cumulPrimes);
        const nouvellesPrimes = [...existingPrimes, { somme: dto.somme, raison: dto.raison }];

        // Calcul mathématique sécurisé du Salaire Net
        const salaireNet = round2(
            Math.max(0, Number(salaire.salaireBrut) - Number(salaire.totalDeductions) + totalPrimes),
        );

        // 4. TRANSACTION D'ÉCRITURE ET D'AUDIT
        const updated = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.salaire.update({
                where: { id: salaireId },
                data: {
                    primes: nouvellesPrimes as any, // Cast "as any" pour valider l'écriture JSON Prisma
                    totalPrimes,
                    salaireNet
                },
            });

            await this.rhLog.info({
                actorId, actorName,
                module: RhModule.SALAIRE,
                action: 'AJOUTER_PRIME',
                entityId: salaireId,
                entityName: `Salaire #${salaireId}`,
                apres: { somme: dto.somme, raison: dto.raison },
                message: `Prime ajoutée : "${dto.raison}" — ${dto.somme.toLocaleString('fr-FR')} FCFA`,
            }, tx);

            return updated;
        });

        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return updated;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // SUPPRIMER UNE PRIME (par index dans le tableau)
    // ─────────────────────────────────────────────────────────────────────────
    async supprimerPrime(salaireId: string, dto: SupprimerPrimeDto, actorId: string) {
        if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

        // 1. SUPER-PARALLÉLISATION : Récupération simultanée des données et de l'acteur
        const [salaire, actorName] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                select: { estCloture: true, primes: true, totalPrimes: true, salaireBrut: true, totalDeductions: true },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);


        // 2. PATTERN FAIL-FAST : Guard clauses immédiates
        if (!salaire) throw new NotFoundException(`Salaire #${salaireId} introuvable`);
        if (salaire.estCloture) {
            throw new BadRequestException("Impossible de supprimer une prime : le salaire est clôturé");
        }


        // 3. VALIDATION DE L'INDEX & SÉCURISATION DU JSON
        const primes = (salaire.primes as unknown) as Prime[];
        if (dto.index < 0 || dto.index >= primes.length) {
            throw new BadRequestException(`Index de prime invalide : ${dto.index}`);
        }

        const primeSupprimee = primes[dto.index];

        // 4. OPTIMISATION ALGORITHMIQUE : O(1) au lieu de O(N) pour le calcul financier
        // On soustrait directement la valeur de la prime au total existant au lieu de refaire une boucle
        const totalPrimes = round2(Math.max(0, Number(salaire.totalPrimes ?? 0) - primeSupprimee.somme));

        // Retrait de l'élément par mutation de copie de surface (très rapide)
        const nouvellesPrimes = [...primes];
        nouvellesPrimes.splice(dto.index, 1);

        // Calcul mathématique sécurisé du Salaire Net
        const salaireNet = round2(
            Math.max(0, Number(salaire.salaireBrut) - Number(salaire.totalDeductions) + totalPrimes),
        );

        // 5. TRANSACTION D'ÉCRITURE ET D'AUDIT
        const updated = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.salaire.update({
                where: { id: salaireId },
                data: {
                    primes: nouvellesPrimes as any, // Cast pour valider l'écriture JSON Prisma
                    totalPrimes,
                    salaireNet
                },
            });

            await this.rhLog.warn({
                actorId, actorName,
                module: RhModule.SALAIRE,
                action: 'SUPPRIMER_PRIME',
                entityId: salaireId,
                entityName: `Salaire #${salaireId}`,
                avant: primeSupprimee,
                message: `Prime supprimée : "${primeSupprimee.raison}" — ${primeSupprimee.somme.toLocaleString('fr-FR')} FCFA`,
            }, tx);

            return updated;
        });

        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return updated;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CLÔTURER LE MOIS
    // Calcul définitif à partir des absences et retards enregistrés.
    // Lie les enregistrements Absence/Retard au salaire.
    // ─────────────────────────────────────────────────────────────────────────
    async cloturerMois(salaireId: string, actorId: string) {
        if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

        // 1. MAX-PARALLÉLISATION & FUSION DES LECTURES (Un seul aller-retour BDD + Audit en tâche de fond)
        const [salaire, actorName] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, profilePicture: true } },
                    // En ramenant les absences et retards directement via les relations du modèle,
                    // on évite deux findUnique séparés plus bas.
                    absence: true,
                    retard: true,
                },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);

        // 2. PATTERN FAIL-FAST : Guard clauses immédiates
        if (!salaire) throw new NotFoundException(`Salaire #${salaireId} introuvable`);
        if (salaire.estCloture) {
            throw new ConflictException('Ce salaire est déjà clôturé');
        }

        // 3. RÉCUPÉRATION DU CONTEXTE (Depuis la mémoire de la requête précédente)
        // Si les relations ne sont pas encore définies ou vides, on interroge via les clés uniques composées de manière sécurisée
        let absence = salaire.absence;
        let retard = salaire.retard;

        // Sécurité : Si les relations n'étaient pas encore formées (salaireId non lié), on les récupère en parallèle
        if (!absence || !retard) {
            const [absenceFetch, retardFetch] = await Promise.all([
                !absence ? this.prisma.absence.findUnique({
                    where: { userId_mois_annee: { userId: salaire.userId, mois: salaire.mois, annee: salaire.annee } },
                }) : null,
                !retard ? this.prisma.retard.findUnique({
                    where: { userId_mois_annee: { userId: salaire.userId, mois: salaire.mois, annee: salaire.annee } },
                }) : null,
            ]);
            if (absenceFetch) absence = absenceFetch;
            if (retardFetch) retard = retardFetch;
        }

        const joursAbsence = (absence?.jours as unknown) as JourAbsence[];
        const joursRetard = (retard?.jours as unknown) as JourRetard[];
        const primes = (salaire.primes as unknown) as Prime[];


        // 4. CALCULS MÉTIERS DEFINITIFS
        const calcul = calculerPaie({
            salaireBrut: Number(salaire.salaireBrut),
            prixJournalier: Number(salaire.prixJournalier),
            // Utilisation de l'opérateur de coalescence des nuls (??) pour garantir un tableau
            joursAbsence: joursAbsence ?? [],
            joursRetard: joursRetard ?? [],
            primes: primes ?? [],
        });

        // 5. TRANSACTION D'ÉCRITURE ET D'AUDIT
        const updatedSalaire = await this.prisma.$transaction(async (tx) => {
            // Épargne le CPU/Mémoire en cas de rollback, les chaînes sont évaluées ici
            const nomEmploye = `${salaire.user.firstName} ${salaire.user.lastName}`;
            const codeMois = String(salaire.mois).padStart(2, '0');

            // Mise à jour principale du Salaire
            const updated = await tx.salaire.update({
                where: { id: salaireId },
                data: {
                    nbAbsJust: calcul.nbAbsJust,
                    nbAbsInjust: calcul.nbAbsInjust,
                    deductionAbs: calcul.deductionAbs,
                    nbRetardsJust: calcul.nbRetardsJust,
                    nbRetardsInjust: calcul.nbRetardsInjust,
                    deductionRetards: calcul.deductionRetards,
                    totalDeductions: calcul.totalDeductions,
                    totalPrimes: calcul.totalPrimes,
                    salaireNet: calcul.salaireNet,
                    estCloture: true,
                    dateCloture: new Date(),
                },
                include: {
                    user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
                    absence: true,
                    retard: true,
                },
            });

            // Rattachements asynchrones en parallèle à l'intérieur de la transaction
            const updatePromises: Promise<any>[] = [];

            if (absence && !absence.salaireId) {
                updatePromises.push(tx.absence.update({ where: { id: absence.id }, data: { salaireId } }));
            }
            if (retard && !retard.salaireId) {
                updatePromises.push(tx.retard.update({ where: { id: retard.id }, data: { salaireId } }));
            }

            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }


            await this.rhLog.warn({
                actorId, actorName,
                module: RhModule.SALAIRE,
                action: 'CLOTURER_SALAIRE',
                entityId: salaireId,
                entityName: `Salaire ${codeMois}/${salaire.annee} — ${nomEmploye}`,
                apres: {
                    nbAbsJust: calcul.nbAbsJust, nbAbsInjust: calcul.nbAbsInjust,
                    nbRetardsJust: calcul.nbRetardsJust, nbRetardsInjust: calcul.nbRetardsInjust,
                    totalDeductions: calcul.totalDeductions, totalPrimes: calcul.totalPrimes,
                    salaireNet: calcul.salaireNet
                },
                message: `Salaire clôturé — ${nomEmploye} — ${codeMois}/${salaire.annee} — Net : ${calcul.salaireNet.toLocaleString('fr-FR')} FCFA`,
            }, tx);

            return updated;
        });

        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return updatedSalaire;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ENREGISTRER LE VERSEMENT RÉEL
    // Disponible uniquement après clôture. Calcule l'écart.
    // ─────────────────────────────────────────────────────────────────────────
    async enregistrerVersement(salaireId: string, dto: VersementDto, actorId: string) {
        if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

        // 1. SUPER-PARALLÉLISATION
        const [salaire, actorName] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                include: { user: { select: { id: true, firstName: true, lastName: true, profilePicture: true } } },
            }),
            this.rhLog.resolveActorName(actorId),
        ]);

        // 2. PATTERN FAIL-FAST
        if (!salaire) throw new NotFoundException(`Salaire #${salaireId} introuvable`);

        if (!salaire.estCloture) {
            throw new BadRequestException(
                "Le salaire doit être clôturé avant d'enregistrer un versement",
            );
        }

        if (salaire.montantVerse !== null) {
            throw new ConflictException('Un versement a déjà été enregistré pour ce salaire');
        }

        // 3. VALIDATION : le montant versé doit correspondre exactement au salaire net
        const salaireNet = round2(Number(salaire.salaireNet));

        if (round2(dto.montantVerse) !== salaireNet) {
            throw new BadRequestException(
                `Le montant versé (${dto.montantVerse.toLocaleString('fr-FR')} FCFA) ` +
                `ne correspond pas au salaire net calculé ` +
                `(${salaireNet.toLocaleString('fr-FR')} FCFA). ` +
                `Veuillez saisir exactement ${salaireNet.toLocaleString('fr-FR')} FCFA.`,
            );
        }

        // 4. Écart = 0 puisque le montant est validé
        const ecart = 0;

        // 5. TRANSACTION D'ÉCRITURE ET D'AUDIT
        const updated = await this.prisma.$transaction(async (tx) => {
            const updated = await tx.salaire.update({
                where: { id: salaireId },
                data: { montantVerse: dto.montantVerse, ecart },
            });

            const nomEmploye = `${salaire.user.firstName} ${salaire.user.lastName}`;
            const codeMois = String(salaire.mois).padStart(2, '0');

            await this.rhLog.warn({
                actorId, actorName,
                module: RhModule.SALAIRE,
                action: 'ENREGISTRER_VERSEMENT',
                entityId: salaireId,
                entityName: `Salaire ${codeMois}/${salaire.annee} — ${nomEmploye}`,
                apres: { montantVerse: dto.montantVerse, ecart },
                message: `Versement de ${dto.montantVerse.toLocaleString('fr-FR')} FCFA enregistré pour ${nomEmploye} — ${codeMois}/${salaire.annee}`,
            }, tx);
            return updated;
        });

        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return updated;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GÉNÉRER LA FICHE DE PAIE (après clôture)
    // ─────────────────────────────────────────────────────────────────────────
    async genererFicheDePaie(salaireId: string, dto: GenererFicheDto, actorId: string) {
        if (!salaireId) throw new BadRequestException("L'identifiant du salaire est requis");
        if (!actorId) throw new BadRequestException("L'identifiant admin est requis");

        // 1. PATTERN FAIL-FAST IMMÉDIAT : Validation de la date avant tout appel réseau (Évite des I/O inutiles)
        const jourDePaie = new Date(dto.jourDePaie);
        const finAujourdhui = new Date();
        finAujourdhui.setHours(23, 59, 59, 999);

        if (jourDePaie > finAujourdhui) {
            throw new BadRequestException(
                `La date de paiement (${jourDePaie.toLocaleDateString('fr-FR')}) ne peut pas être dans le futur`,
            );
        }

        // 2. PARALLÉLISATION MAXIMALE DES LECTURES (BDD, Audit et Paramètres Entreprise)
        const [salaire, actorName, entreprise] = await Promise.all([
            this.prisma.salaire.findUnique({
                where: { id: salaireId },
                include: {
                    user: {
                        select: {
                            id: true, firstName: true, lastName: true,
                            email: true, dateRecrutement: true,
                            phoneNumber: true, adresse: true, profilePicture: true,
                            role: { select: { post: true } },
                        },
                    },
                    ficheDePaie: true,
                    absence: true,
                    retard: true,
                },
            }),
            this.rhLog.resolveActorName(actorId),
            this.entrepriseService.findFirst(),
        ]);

        // 3. SECONDE VAGUE DE GUARD CLAUSES
        if (!salaire) throw new NotFoundException(`Salaire #${salaireId} introuvable`);
        if (!salaire.estCloture) {
            throw new BadRequestException('Le salaire doit être clôturé avant de générer la fiche de paie');
        }
        if (salaire.ficheDePaie) {
            throw new ConflictException('Une fiche de paie a déjà été générée pour ce salaire');
        }

        // 4. EXTRACTION ET DOUBLE CAST SÉCURISÉ DES CHAMPS JSON PRISMA
        const joursAbsence = (salaire.absence?.jours as unknown) as JourAbsence[] ?? [];
        const joursRetard = (salaire.retard?.jours as unknown) as JourRetard[] ?? [];

        // OPTIMISATION MÉMOIRE : On évite de déstructurer tout l'objet salaire ({ ...salaire })
        // On passe une référence propre et enrichie sans forcer le Garbage Collector à dupliquer l'entité SQL brute.
        const salaireAvecDetails = Object.assign(salaire, {
            joursAbsence,
            joursRetard,
            jourDePaie: dto.jourDePaie,
        });

        // 5. GÉNÉRATION DU FICHIER PDF
        const fichierPDF = await this.pdfGen.genererFichePaie(
            salaireAvecDetails,
            entreprise,
            this.pdfGen.OUTPUT_DIR_FICHES,
        );

        // 6. TRANSACTION D'ÉCRITURE ET LOG D'AUDIT
        const ficheCreee = await this.prisma.$transaction(async (tx) => {
            const fiche = await tx.ficheDePaie.create({
                data: {
                    salaireId,
                    dateGeneration: new Date(),
                    fichierPDF,
                    jourDePaie,
                },
                include: {
                    salaire: {
                        select: {
                            id: true, mois: true, annee: true, salaireNet: true, estCloture: true,
                            user: { select: { id: true, firstName: true, lastName: true, email: true, profilePicture: true } },
                        },
                    },
                },
            });

            // Évaluation paresseuse (Lazy Evaluation) : Allouée uniquement si l'écriture réussit
            const codeMois = String(salaire.mois).padStart(2, '0');
            const nomEmploye = salaire.user
                ? `${salaire.user.firstName} ${salaire.user.lastName}`
                : 'Employé inconnu';
            const datePayeString = jourDePaie.toLocaleDateString('fr-FR');

            await this.rhLog.info({
                actorId, actorName,
                module: RhModule.FICHE_PAIE,
                action: 'GENERER_FICHE_PAIE',
                entityId: fiche.id,
                entityName: `Fiche ${codeMois}/${salaire.annee} — ${nomEmploye}`,
                apres: { fichierPDF, jourDePaie: datePayeString },
                message: `Fiche de paie générée pour ${nomEmploye} — ${codeMois}/${salaire.annee} — Payé le ${datePayeString}`,
            }, tx);

            return fiche;
        });

        this.realtimeGateway.emitEntityChanged({ module: 'salaire', action: 'updated', id: salaireId });
        return ficheCreee;
    }

    async getFicheStream(salaireId: string): Promise<{
        stream: fs.ReadStream;
        filename: string;
        mimeType: string;
    }> {
        if (!salaireId) throw new BadRequestException("L'identifiant du salaire est requis");

        // Même include que genererFicheDePaie pour récupérer ficheDePaie
        const salaire = await this.prisma.salaire.findUnique({
            where: { id: salaireId },
            include: {
                ficheDePaie: true,
                user: {
                    select: {
                        id: true, firstName: true, lastName: true, profilePicture: true
                    },
                },
            },
        });

        // Guard clauses dans le même ordre que genererFicheDePaie
        if (!salaire) {
            throw new NotFoundException(`Salaire #${salaireId} introuvable`);
        }

        if (!salaire.estCloture) {
            throw new BadRequestException(
                'Le salaire doit être clôturé avant de télécharger la fiche de paie',
            );
        }

        if (!salaire.ficheDePaie) {
            throw new NotFoundException(
                'Aucune fiche de paie générée pour ce salaire — ' +
                'utilisez POST /generer-fiche-de-paie d\'abord',
            );
        }

        // fichierPDF = le chemin stocké par genererFicheDePaie
        const fichierPDF = salaire.ficheDePaie.fichierPDF;

        if (!fichierPDF) {
            throw new NotFoundException('Le chemin du fichier PDF est manquant en base');
        }

        // Vérification physique sur le disque (même logique que getStream du rapport)
        try {
            await fs.promises.access(fichierPDF, fs.constants.R_OK);
        } catch {
            throw new NotFoundException(
                'Le fichier PDF n\'existe plus sur le serveur — régénérez la fiche de paie',
            );
        }

        const codeMois = String(salaire.mois).padStart(2, '0');
        const nomEmploye = salaire.user
            ? `${salaire.user.firstName}_${salaire.user.lastName}`
            : 'employe';

        return {
            stream: fs.createReadStream(fichierPDF),
            filename: `fiche_paie_${nomEmploye}_${codeMois}-${salaire.annee}.pdf`,
            mimeType: 'application/pdf',
        };
    }

    // ────────────────────────────────────────────────────────────────────────
    // LECTURES
    // ──────────────────────────────────────────────────────────────────────    

    async findAll(dto: FindAllSalairesDto) {
        const where: any = {};

        // 1. EXTRACTION DES FILTRES
        if (dto.userId) where.userId = dto.userId;
        if (dto.mois) where.mois = dto.mois;
        if (dto.annee) where.annee = dto.annee;
        if (dto.estCloture !== undefined) where.estCloture = dto.estCloture;

        // 2. CALCUL DES VARIABLES DE PAGINATION
        const page = dto.page ?? 1;
        const limit = dto.limit ?? 10;
        const skip = (page - 1) * limit;

        // 3. DOUBLE REQUÊTE PARALLÈLE
        const [total, data] = await Promise.all([
            this.prisma.salaire.count({ where }),
            this.prisma.salaire.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            profilePicture: true
                        },
                    },
                    absence: true,
                    retard: true,
                    ficheDePaie: {
                        select: { id: true, dateGeneration: true },
                    },
                },
                orderBy: [
                    { annee: 'desc' }, // most recent year first
                    { mois: 'desc' }, // most recent month first
                    { createdAt: 'desc' }, // tiebreaker
                ],
                skip,
                take: limit,
            }),
        ]);

        // 4. FORMAT DE RÉPONSE STANDARDISÉ
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
    }

    async findOne(salaireId: string) {
        // 1. PATTERN FAIL-FAST IMMÉDIAT : Validation de la présence de l'ID avant l'appel I/O
        if (!salaireId) {
            throw new BadRequestException("L'identifiant du salaire est requis");
        }

        // 2. REQUÊTE SQL OPTIMISÉE VIA PRISMA
        const salaire = await this.prisma.salaire.findUnique({
            where: { id: salaireId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: { select: { post: true } },
                        profilePicture: true,
                    },
                },
                absence: true,
                retard: true,
                ficheDePaie: true,
            },
        });

        // 3. GUARD CLAUSE : Validation de l'existence de l'enregistrement
        if (!salaire) {
            throw new NotFoundException(`Salaire #${salaireId} introuvable`);
        }

        // 4. SÉCURISATION DU TYPAGE DES CHAMPS JSON PRISMA (Évite les erreurs d'incompatibilité à l'usage)
        const joursAbsence = (salaire.absence?.jours as unknown) as JourAbsence[] ?? [];
        const joursRetard = (salaire.retard?.jours as unknown) as JourRetard[] ?? [];

        // On injecte ou réassigne proprement les tableaux typés dans l'objet de retour
        return Object.assign(salaire, {
            absence: salaire.absence ? { ...salaire.absence, jours: joursAbsence } : null,
            retard: salaire.retard ? { ...salaire.retard, jours: joursRetard } : null,
        });
    }

    async getMasseSalariale(dto: GetMasseSalarialeDto) {
        const { mois, annee, page = 1, limit = 10 } = dto;
        const skip = (page - 1) * limit;

        const whereCondition = { mois, annee, estCloture: true };

        // EXÉCUTION EN PARALLÈLE : Les totaux restent globaux, seule la liste est paginée
        const [agregatsDb, salaires] = await Promise.all([
            // 1. Agrégation globale (Ne prend PAS en compte le skip et limit pour avoir le vrai total)
            this.prisma.salaire.aggregate({
                where: whereCondition,
                _count: { id: true },
                _sum: {
                    salaireBrut: true,
                    totalDeductions: true,
                    totalPrimes: true,
                    salaireNet: true,
                    montantVerse: true,
                },
            }),

            // 2. Liste paginée pour l'affichage de la page demandée
            this.prisma.salaire.findMany({
                where: whereCondition,
                select: {
                    id: true,
                    salaireBrut: true,
                    totalDeductions: true,
                    totalPrimes: true,
                    salaireNet: true,
                    montantVerse: true,
                    mois: true,
                    annee: true,
                    estCloture: true,
                    user: {
                        select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            email: true,
                            role: { select: { post: true } },
                            profilePicture: true,
                        },
                    },
                },
                orderBy: [{ user: { lastName: 'asc' } }],
                skip,
                take: limit,
            }),
        ]);

        const totalEmployesMois = agregatsDb._count.id;
        const totalNet = Number(agregatsDb._sum.salaireNet ?? 0);
        const totalVerse = Number(agregatsDb._sum.montantVerse ?? 0);

        // FORMAT DE RÉPONSE STANDARDISÉ
        return {
            periode: `${String(mois).padStart(2, '0')}/${annee}`,
            agregatsGlobaux: {
                totalBrut: Number(agregatsDb._sum.salaireBrut ?? 0),
                totalDeductions: Number(agregatsDb._sum.totalDeductions ?? 0),
                totalPrimes: Number(agregatsDb._sum.totalPrimes ?? 0),
                totalNet,
                totalVerse,
                ecartTotal: totalVerse - totalNet,
            },
            data: salaires, // Liste paginée
            meta: {
                total: totalEmployesMois, // Nombre total d'employés touchés ce mois-ci
                page,
                limit,
                pagesTotales: Math.ceil(totalEmployesMois / limit) || 1,
            },
        };
    }

    async getHistoriquePaiements(userId: string, dto: HistoriquePaiementsDto) {
        // 1. Vérifier que l'utilisateur existe
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, firstName: true, lastName: true, email: true },
        });

        if (!user) throw new NotFoundException(`Employé #${userId} introuvable`);

        const {
            page = 1,
            limit = 20,
            annee,
            mois,
            montantMinimum,
            montantMaximum,
            avecEcart,
            avecFiche,
            ficheSigne,
            dateClotureDebut,
            dateClotureFin,
        } = dto;

        const skip = (page - 1) * limit;

        // 2. Construction dynamique du WHERE
        const where: Prisma.SalaireWhereInput = {
            userId,
            estCloture: true,
            montantVerse: { not: null },

            // ─── Filtres période ────────────────────────────────────────────────────
            ...(annee && { annee }),
            ...(mois && { mois }),

            // ─── Filtres financiers ─────────────────────────────────────────────────
            ...(montantMinimum !== undefined || montantMaximum !== undefined
                ? {
                    montantVerse: {
                        not: null,
                        ...(montantMinimum !== undefined && { gte: montantMinimum }),
                        ...(montantMaximum !== undefined && { lte: montantMaximum }),
                    },
                }
                : {}),

            // ─── Filtre écart ───────────────────────────────────────────────────────
            ...(avecEcart === true && {
                ecart: { not: 0 },
            }),

            // ─── Filtre fiche de paie ───────────────────────────────────────────────
            ...(avecFiche === true && { ficheDePaie: { isNot: null } }),
            ...(avecFiche === false && { ficheDePaie: { is: null } }),

            // ─── Filtre signature ───────────────────────────────────────────────────
            ...(ficheSigne !== undefined && {
                ficheDePaie: { signeeParUser: ficheSigne },
            }),

            // ─── Filtres date de clôture ────────────────────────────────────────────
            ...(dateClotureDebut || dateClotureFin
                ? {
                    dateCloture: {
                        ...(dateClotureDebut && { gte: new Date(dateClotureDebut) }),
                        ...(dateClotureFin && { lte: new Date(dateClotureFin) }),
                    },
                }
                : {}),
        };

        // 3. Exécution parallèle
        const [total, paiements, agregats] = await Promise.all([
            this.prisma.salaire.count({ where }),

            this.prisma.salaire.findMany({
                where,
                orderBy: [{ annee: 'desc' }, { mois: 'desc' }],
                skip,
                take: limit,
                select: {
                    id: true,
                    mois: true,
                    annee: true,
                    salaireBrut: true,
                    totalDeductions: true,
                    totalPrimes: true,
                    salaireNet: true,
                    montantVerse: true,
                    ecart: true,
                    dateCloture: true,
                    ficheDePaie: {
                        select: {
                            id: true,
                            dateGeneration: true,
                            signeeParUser: true,
                            dateSignature: true,
                            jourDePaie: true,
                        },
                    },
                },
            }),

            // Agrégats calculés sur le WHERE complet (pas paginé)
            this.prisma.salaire.aggregate({
                where,
                _sum: {
                    montantVerse: true,
                    salaireNet: true,
                    totalDeductions: true,
                    totalPrimes: true,
                },
                _count: { id: true },
            }),
        ]);

        // 4. Réponse formatée
        return {
            employe: user,
            filtresAppliques: {
                annee: annee ?? null,
                mois: mois ?? null,
                montantMinimum: montantMinimum ?? null,
                montantMaximum: montantMaximum ?? null,
                avecEcart: avecEcart ?? null,
                avecFiche: avecFiche ?? null,
                ficheSigne: ficheSigne ?? null,
                dateClotureDebut: dateClotureDebut ?? null,
                dateClotureFin: dateClotureFin ?? null,
            },
            agregats: {
                totalPaiements: agregats._count.id,
                totalVerse: Number(agregats._sum.montantVerse ?? 0),
                totalNet: Number(agregats._sum.salaireNet ?? 0),
                totalDeductions: Number(agregats._sum.totalDeductions ?? 0),
                totalPrimes: Number(agregats._sum.totalPrimes ?? 0),
            },
            data: paiements.map((p) => ({
                id: p.id,
                periode: `${String(p.mois).padStart(2, '0')}/${p.annee}`,
                mois: p.mois,
                annee: p.annee,
                salaireBrut: Number(p.salaireBrut),
                totalDeductions: Number(p.totalDeductions),
                totalPrimes: Number(p.totalPrimes),
                salaireNet: Number(p.salaireNet),
                montantVerse: Number(p.montantVerse),
                ecart: Number(p.ecart ?? 0),
                aEcart: Number(p.ecart ?? 0) !== 0,
                dateCloture: p.dateCloture,
                ficheDePaie: p.ficheDePaie ?? null,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
                hasNextPage: page * limit < total,
                hasPreviousPage: page > 1,
            },
        };
    }

}



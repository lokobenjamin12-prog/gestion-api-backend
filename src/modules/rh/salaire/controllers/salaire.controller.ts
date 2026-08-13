// src/salaire/salaire.controller.ts
import {
    Controller, Get, Post, Patch, Body, Param, Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Delete,
    Res,
    StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiBearerAuth, ApiResponse, ApiOkResponse, ApiOperation, ApiParam, ApiProduces } from '@nestjs/swagger';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { SalaireService } from '../services/salaire.service';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { InitialiserSalaireDto } from '../dto/initialiser.salaire.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenererFicheDto } from '../dto/generer-fiche.dto';
import { AjouterPrimeDto } from '../dto/ajouter.prime.dto';
import { SupprimerPrimeDto } from '../dto/supprimer-prime.dto';
import { VersementDto } from '../dto/versement.dto';
import { FindAllSalairesDto } from '../dto/find-all-salaires.dto';
import { GetMasseSalarialeDto } from '../dto/get-masse-salariale.dto';
import { RequireContratActor, RequireContratBoth } from 'src/common/decorators/require-contrat.decorator';
import { HistoriquePaiementsDto } from '../dto/historique-paiements.dto';



@ApiTags('Gestion des Salaires & Paie')
@ApiBearerAuth()
@ApiResponse({ status: 401, description: 'Authentification requise : Token JWT absent ou expiré.' })
@ApiResponse({ status: 403, description: 'Accès interdit : Permissions insuffisantes pour les opérations de paie.' })
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('salaires')
export class SalaireController {
    constructor(
        private readonly prisma: PrismaService,
        private readonly salaireService: SalaireService
    ) { }

    // ─── Initialiser ──────────────────────────────────────────────────────────────
    @Post('initialiser')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:create')
    @RequireContratBoth()
    @ApiOperation({
        summary: 'Initialiser la feuille de paie mensuelle',
        description: 'Génère les états de salaire initiaux pour un mois et une année donnés basés sur les contrats actifs.'
    })
    @ApiOkResponse({ description: 'États de salaires mensuels initialisés avec succès.' })

    async initialiser(
        @Body() dto: InitialiserSalaireDto,
        @GetUser('sub') actorId: string, // Extrait l'ID de l'admin authentifié qui réalise l'action
    ) {
        return this.salaireService.initialiser(dto, actorId);
    }

    @Get('masse-salariale')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:read')
    @ApiOperation({
        summary: 'Calculer la masse salariale globale',
        description: 'Récupère les statistiques financières cumulées (salaires bruts, nets, charges, primes cumulées) sur une période.'
    })
    @ApiOkResponse({ description: 'Statistiques de la masse salariale calculées.' })

    async getMasseSalariale(
        @Query() dto: GetMasseSalarialeDto,
    ) {
        return this.salaireService.getMasseSalariale(dto);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:read')
    @ApiOperation({
        summary: 'Lister et filtrer les fiches de paie de l\'entreprise',
        description: 'Retourne une liste paginée de l\'ensemble des états de salaires avec filtres multicritères.'
    })
    @ApiOkResponse({ description: 'Liste des états de salaires récupérée avec succès.' })

    async findAll(
        @Query() dto: FindAllSalairesDto, // Intercepte et valide tous les Query Params de l'URL
    ) {
        return this.salaireService.findAll(dto);
    }


    @Patch(':id/primes')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:update')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Ajouter une prime ou une indemnité',
        description: 'Ajoute une ligne de prime au calcul de paie en cours d\'un employé avant clôture.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'état de salaire' })
    @ApiOkResponse({ description: 'Prime ajout de manière fructueuse.' })
    @ApiResponse({ status: 404, description: 'État de salaire introuvable.' })

    async ajouterPrime(
        @Param('id') salaireId: string,              // Extrait l'id du salaire depuis l'URL (ex: /salaires/abc-123/primes)
        @Body() dto: AjouterPrimeDto,                 // Récupère le payload JSON de la prime (somme, raison)
        @GetUser('sub') actorId: string,           // Extrait l'ID de l'administrateur connecté qui valide l'action
    ) {
        return this.salaireService.ajouterPrime(salaireId, dto, actorId);
    }


    @Delete(':id/primes')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:update')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Supprimer une prime spécifique',
        description: 'Retire une prime ajoutée par erreur d\'un état de paie non clôturé via son index ou son ID.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'état de salaire' })
    @ApiOkResponse({ description: 'Prime retirée avec succès et salaire recalculé.' })

    async supprimerPrime(
        @Param('id') salaireId: string,              // Extrait l'id du salaire depuis l'URL (ex: /salaires/abc-123/primes)
        @Body() dto: SupprimerPrimeDto,               // Récupère l'index de la prime à supprimer ({ "index": 2 })
        @GetUser('sub') actorId: string,           // Extrait de manière sécurisée l'ID de l'admin via le JWT
    ) {
        return this.salaireService.supprimerPrime(salaireId, dto, actorId);
    }

    @Post(':id/cloturer')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:update')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Clôturer le mois comptable de paie',
        description: 'Fige définitivement les calculs d\'un employé pour le mois. Bloque toute modification ultérieure des primes ou des absences.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'état de salaire' })
    @ApiOkResponse({ description: 'Mois comptable gelé et clôturé avec succès.' })


    async cloturerMois(
        @Param('id') salaireId: string,              // Extrait l'identifiant du salaire depuis l'URL (ex: /salaires/abc-123/cloturer)
        @GetUser('sub') actorId: string,             // Extrait de manière sécurisée l'ID de l'admin connecté via le JWT
    ) {
        return this.salaireService.cloturerMois(salaireId, actorId);
    }

    @Post(':id/versements')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:update')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Enregistrer un ordre de versement',
        description: 'Associe un paiement ou une avance (numéraire, virement, chèque) à une feuille de paie et met à jour le solde restant dû.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'état de salaire' })
    @ApiOkResponse({ description: 'Versement pris en compte financièrement.' })

    async enregistrerVersement(
        @Param('id') salaireId: string,              // Extrait l'identifiant du salaire depuis l'URL (ex: /salaires/abc-123/versements)
        @Body() dto: VersementDto,                    // Récupère le payload JSON contenant le montantVerse
        @GetUser('sub') actorId: string,           // Extrait de manière sécurisée l'ID de l'admin via le token JWT
    ) {
        return this.salaireService.enregistrerVersement(salaireId, dto, actorId);
    }


    @Post(':id/fiche-de-paie')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:update')
    @RequireContratActor()
    @ApiOperation({
        summary: 'Générer le document PDF de la fiche de paie',
        description: 'Compile et fige la mise en page officielle de la fiche de paie avec sa date de paiement.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant unique de l\'état de salaire' })
    @ApiOkResponse({ description: 'Fiche de paie générée et stockée.' })

    async genererFicheDePaie(
        @Param('id') salaireId: string,              // Extrait le salaireId de l'URL (ex: /salaires/abc-123/fiche-de-paie)
        @Body() dto: GenererFicheDto,                 // Récupère la date de paiement ({ "jourDePaie": "2026-05-29" })
        @GetUser('sub') actorId: string,           // Extrait de manière sécurisée l'ID de l'administrateur connecté
    ) {
        return this.salaireService.genererFicheDePaie(salaireId, dto, actorId);
    }


    @Get(':id/telecharger-fiche')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:update')
    @ApiOperation({
        summary: 'Télécharger le bulletin de paie au format PDF',
        description: 'Récupère le fichier physique du bulletin de paie généré sous forme de flux binaire.'
    })
    @ApiParam({ name: 'id', description: 'Identifiant de l\'état de paie lié au document' })
    @ApiProduces('application/pdf')
    @ApiOkResponse({
        description: 'Document PDF transmis avec succès.',
        schema: { type: 'string', format: 'binary' }
    })
    @ApiResponse({ status: 404, description: 'Fiche de paie physique absente ou non encore générée.' })

    async telechargerFiche(
        @Param('id') id: string,
        @Res() res: Response,
    ) {
        const { stream, filename, mimeType } = await this.salaireService.getFicheStream(id);

        res.set({
            'Content-Type': mimeType,
            'Content-Disposition': `attachment; filename="${filename}"`,
        });

        stream.pipe(res);
    }


    @Get(':id')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:read')
    @ApiOperation({
        summary: 'Consulter un état de salaire unitaire',
        description: 'Renvoie le détail complet du calcul comptable d\'un employé (Heures, Primes, Retards, Avances).'
    })
    @ApiParam({ name: 'id', description: 'Identifiant technique de la ligne de paie' })
    @ApiOkResponse({ description: 'Fiche de salaire unitaire trouvée et retournée.' })
    @ApiResponse({ status: 404, description: 'Ligne de salaire introuvable.' })

    async findOne(
        @Param('id') salaireId: string, // Extrait l'identifiant technique depuis l'URL (ex: /salaires/abc-123)
    ) {
        return this.salaireService.findOne(salaireId);
    }


    @Get('user/:userId/historique-paiements')
    @HttpCode(HttpStatus.OK)
    @RequirePermissions('salaire:read')
    @RequireContratBoth()
    @ApiOperation({
        summary: 'Consulter l\'historique des gains d\'un employé',
        description: 'Permet à un employé (ou aux RH) de lister chronologiquement l\'historique de toutes ses fiches de paie validées.'
    })
    @ApiParam({ name: 'userId', description: 'Identifiant unique de l\'employé' })
    @ApiOkResponse({ description: 'Historique d\'activité comptable extrait avec succès.' })

    async getHistoriquePaiements(
        @Param('userId') userId: string,
        @Query() dto: HistoriquePaiementsDto,
    ) {
        return this.salaireService.getHistoriquePaiements(userId, dto);
    }

}
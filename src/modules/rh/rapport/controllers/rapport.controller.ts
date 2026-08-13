// src/rapport/rapport.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Res,
  UseGuards,
  HttpCode,
  HttpStatus,
  Patch,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOperation,
  ApiResponse,
  ApiOkResponse,
  ApiProduces,
  ApiParam,
} from '@nestjs/swagger';
import type { Response } from 'express'; // 👈 On ajoute le mot-clé 'type' ici !
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RequirePermissions } from 'src/modules/auth/authentification/decorators/permissions.decorator';
import { AuthGuard } from 'src/modules/auth/authentification/guards/auth.guard';
import { PermissionsGuard } from 'src/modules/auth/authentification/guards/permissions.guard';
import { RapportService } from '../services/rapport.service';
import { CreateRapportDto } from '../dto/create-rapport.dto';
import { FilterRapportDto } from '../dto/filter-rapport.dto';
import { RequireContratActor } from 'src/common/decorators/require-contrat.decorator';


@ApiTags('Rapports')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionsGuard)
@Controller('rapports')
export class RapportController {
  constructor(private readonly rapportService: RapportService) { }


  /**
   * Générer un nouveau rapport (PDF ou Excel)
   * POST /rapports/generer
   */
  @Post('generer')
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions('rapport:create')
  @RequireContratActor()
  @ApiOperation({
    summary: 'Générer un nouveau rapport RH',
    description: 'Déclenche la compilation de données et génère un fichier (PDF ou Excel) basé sur les filtres fournis.'
  })
  @ApiCreatedResponse({
    description: 'Le rapport a été initialisé et son fichier est prêt.',
  })

  async generer(
    @Body() dto: CreateRapportDto,               // Récupère les filtres et configurations du rapport depuis le JSON
    @GetUser('sub') actorId: string, // Extrait l'ID de l'utilisateur connecté depuis le token JWT
  ) {
    return this.rapportService.generer(dto, actorId);
  }

  /**
  * Télécharger le fichier d'un rapport sous forme de flux (Stream)
  * GET /rapports/:id/download
  */
  @Get(':id/telecharger')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('rapport:read')
  @ApiOperation({
    summary: 'Télécharger le document d\'un rapport',
    description: 'Récupère le fichier physique sous forme de flux binaire (Stream) et force le téléchargement côté client.'
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique du rapport (UUID/CUID)' })
  @ApiProduces('application/octet-stream', 'application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
  @ApiOkResponse({
    description: 'Fichier récupéré avec succès. Le flux binaire commence.',
    schema: {
      type: 'string',
      format: 'binary',
    },
  })
  @ApiResponse({ status: 404, description: 'Rapport ou fichier physique introuvable.' })

  async telechargerRapport(
    @Param('id') id: string,
    @Res() res: Response, // sans passthrough
  ) {
    const { stream, filename, mimeType } = await this.rapportService.getStream(id);

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });

    stream.pipe(res); // NestJS n'intervient plus — le fichier est envoyé directement
  }


  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('rapport:read')
  @ApiOperation({
    summary: 'Lister et filtrer les rapports',
    description: 'Récupère l\'historique des rapports générés avec support de filtres (type, date, statut).'
  })
  @ApiOkResponse({
    description: 'Liste des rapports récupérée avec succès.',
  })

  async findAll(
    @Query() filters: FilterRapportDto, // Extrait et mappe automatiquement les Query Params dans le DTO
  ) {
    return this.rapportService.findAll(filters);
  }

  /**
   * Récupérer un rapport unique par son identifiant (ID)
   * GET /rapports/:id
   * Exemple d'appel : /rapports/cl8z9x1y00000tzi8hfb3g7p2
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('rapport:read')
  @ApiOperation({
    summary: 'Consulter les métadonnées d\'un rapport',
    description: 'Récupère les informations structurelles d\'un rapport (statut de génération, filtres appliqués, auteur) sans télécharger le fichier.'
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique du rapport' })
  @ApiOkResponse({
    description: 'Rapport trouvé et retourné avec succès.',
  })
  @ApiResponse({ status: 404, description: 'Rapport introuvable.' })

  async findOne(@Param('id') id: string) {
    // On passe directement l'ID extrait des paramètres de l'URL au service
    return this.rapportService.findOne(id);
  }


  @Delete(':id/supprimer')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('rapport:delete')
  @RequireContratActor()
  @ApiOperation({
    summary: 'Archiver un rapport (Suppression logique)',
    description: 'Place le rapport dans la corbeille. Le fichier reste disponible pour restauration.'
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique du rapport à archiver' })
  @ApiOkResponse({ description: 'Rapport envoyé dans la corbeille avec succès.' })
  @ApiResponse({ status: 404, description: 'Rapport introuvable.' })

  async softDelete(
    @Param('id') id: string,                     // Extrait l'identifiant technique depuis l'URL
    @GetUser('sub') actorId: string,           // Extrait l'ID de l'admin connecté via son token JWT
  ) {
    return this.rapportService.softDelete(id, actorId);
  }

  /**
   * Restaurer un rapport archivé (Sortie de la corbeille)
   * PATCH /rapports/:id/restore
   * Exemple d'appel : /rapports/cl8z9x1y00000tzi8hfb3g7p2/restore
   */
  @Patch(':id/restore')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions('rapport:update')
  @RequireContratActor()
  @ApiOperation({
    summary: 'Restaurer un rapport archivé',
    description: 'Sort le rapport ciblé de la corbeille pour le rendre à nouveau visible dans l\'historique actif.'
  })
  @ApiParam({ name: 'id', description: 'Identifiant unique du rapport à restaurer' })
  @ApiOkResponse({ description: 'Rapport restauré avec succès.' })
  @ApiResponse({ status: 404, description: 'Rapport introuvable dans la corbeille.' })

  async restore(
    @Param('id') id: string,                     // Extrait l'identifiant technique depuis l'URL
    @GetUser('sub') actorId: string,           // Extrait l'ID de l'admin connecté via le token JWT
  ) {
    return this.rapportService.restore(id, actorId);
  }

} 
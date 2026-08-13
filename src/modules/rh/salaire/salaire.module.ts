import { Module } from '@nestjs/common';
import { SalaireController } from './controllers/salaire.controller';
import { SalaireService } from './services/salaire.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AbsenceModule } from '../absence/absence.module';
import { JwtModule } from '@nestjs/jwt';
import { PdfGeneratorModule } from '../../admin/pdf-generator/pdf-generator.module';
import { EntrepriseModule } from '../../commerce/entreprise/entreprise.module';
import { RhLogService } from '../log/rh-log.service';
import { RhLogController } from '../log/rh-log.controller';
import { RealtimeModule } from '../../commerce/realtime/realtime.module';

@Module({
  imports: [
    JwtModule,
    PrismaModule,   // Fournit l'accès à this.prisma
    AbsenceModule, // Fournit l'accès à this.absences (verifierPretePourCloture, getAbsencesPourCalculPaie)
    PdfGeneratorModule,
    EntrepriseModule,
    RealtimeModule,
  ],
  controllers: [SalaireController, RhLogController],
  providers: [SalaireService, RhLogService],
  exports: [
    SalaireService, // Optionnel : permet à d'autres modules d'injecter ce service si besoin
  ],
})
export class SalaireModule { }
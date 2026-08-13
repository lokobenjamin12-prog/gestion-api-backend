import { Module } from '@nestjs/common';
import { RapportController } from './controllers/rapport.controller';
import { RapportService } from './services/rapport.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ExcelGeneratorModule } from '../../admin/excel-generator/excel-generator.module';
import { PdfGeneratorModule } from '../../admin/pdf-generator/pdf-generator.module';
import { JwtModule } from '@nestjs/jwt';
import { EntrepriseModule } from '../../commerce/entreprise/entreprise.module';
import { RhLogService } from '../log/rh-log.service';
import { RhLogController } from '../log/rh-log.controller';
import { RealtimeModule } from '../../commerce/realtime/realtime.module';

@Module({
  imports: [PdfGeneratorModule, ExcelGeneratorModule, PrismaModule, JwtModule, EntrepriseModule, RealtimeModule],
  controllers: [RapportController, RhLogController],
  providers: [RapportService, RhLogService],
  exports: [RapportService]
})
export class RapportModule { }
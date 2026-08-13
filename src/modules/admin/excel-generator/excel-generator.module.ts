import { Module } from '@nestjs/common';
import { ExcelGeneratorService } from './services/excel-generator.service';

@Module({
  providers: [ExcelGeneratorService],
  exports: [ExcelGeneratorService]
})
export class ExcelGeneratorModule { }

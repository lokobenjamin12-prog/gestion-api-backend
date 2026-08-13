import { Test, TestingModule } from '@nestjs/testing';
import { ExcelGeneratorService } from './excel-generator.service';

describe('ExcelGeneratorService', () => {
  let service: ExcelGeneratorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ExcelGeneratorService],
    }).compile();

    service = module.get<ExcelGeneratorService>(ExcelGeneratorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

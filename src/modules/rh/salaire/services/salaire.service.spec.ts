import { Test, TestingModule } from '@nestjs/testing';
import { SalaireService } from './salaire.service';

describe('SalaireService', () => {
  let service: SalaireService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalaireService],
    }).compile();

    service = module.get<SalaireService>(SalaireService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

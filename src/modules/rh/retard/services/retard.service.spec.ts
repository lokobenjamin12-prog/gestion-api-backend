import { Test, TestingModule } from '@nestjs/testing';
import { RetardService } from './retard.service';

describe('RetardService', () => {
  let service: RetardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetardService],
    }).compile();

    service = module.get<RetardService>(RetardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

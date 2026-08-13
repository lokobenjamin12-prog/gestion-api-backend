import { Test, TestingModule } from '@nestjs/testing';
import { RetardController } from './retard.controller';

describe('RetardController', () => {
  let controller: RetardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RetardController],
    }).compile();

    controller = module.get<RetardController>(RetardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

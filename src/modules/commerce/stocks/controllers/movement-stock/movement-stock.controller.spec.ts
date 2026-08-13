import { Test, TestingModule } from '@nestjs/testing';
import { MovementStockController } from './movement-stock.controller';

describe('MovementStockController', () => {
  let controller: MovementStockController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovementStockController],
    }).compile();

    controller = module.get<MovementStockController>(MovementStockController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

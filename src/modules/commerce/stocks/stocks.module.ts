import { Module } from '@nestjs/common';
import { ArticleController } from './controllers/article/article.controller';
import { CategoryController } from './controllers/category/category.controller';
import { MovementStockController } from './controllers/movement-stock/movement-stock.controller';
import { ArticleService } from './services/article/article.service';
import { CategoryService } from './services/category/category.service';
import { StockService } from './services/stock/stock.service';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { CommerceLogService } from '../log/commerce-log.service';
import { CommerceLogController } from '../log/commerce-log.controller';
import { RealtimeModule } from '../realtime/realtime.module';



@Module({
  imports: [
    JwtModule,
    PrismaModule,
    RealtimeModule,
  ],
  controllers: [
    ArticleController,
    CategoryController,
    MovementStockController,
    CommerceLogController,
  ],
  providers: [
    ArticleService,
    CategoryService,
    StockService,
    CommerceLogService
  ],
  exports: [
    ArticleService,
    CategoryService,
    StockService
  ]
})
export class StocksModule { }
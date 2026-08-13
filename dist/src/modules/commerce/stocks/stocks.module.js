"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StocksModule = void 0;
const common_1 = require("@nestjs/common");
const article_controller_1 = require("./controllers/article/article.controller");
const category_controller_1 = require("./controllers/category/category.controller");
const movement_stock_controller_1 = require("./controllers/movement-stock/movement-stock.controller");
const article_service_1 = require("./services/article/article.service");
const category_service_1 = require("./services/category/category.service");
const stock_service_1 = require("./services/stock/stock.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_module_1 = require("../../../prisma/prisma.module");
const commerce_log_service_1 = require("../log/commerce-log.service");
const commerce_log_controller_1 = require("../log/commerce-log.controller");
const realtime_module_1 = require("../realtime/realtime.module");
let StocksModule = class StocksModule {
};
exports.StocksModule = StocksModule;
exports.StocksModule = StocksModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jwt_1.JwtModule,
            prisma_module_1.PrismaModule,
            realtime_module_1.RealtimeModule,
        ],
        controllers: [
            article_controller_1.ArticleController,
            category_controller_1.CategoryController,
            movement_stock_controller_1.MovementStockController,
            commerce_log_controller_1.CommerceLogController,
        ],
        providers: [
            article_service_1.ArticleService,
            category_service_1.CategoryService,
            stock_service_1.StockService,
            commerce_log_service_1.CommerceLogService
        ],
        exports: [
            article_service_1.ArticleService,
            category_service_1.CategoryService,
            stock_service_1.StockService
        ]
    })
], StocksModule);
//# sourceMappingURL=stocks.module.js.map
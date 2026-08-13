"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HealthController = void 0;
const common_1 = require("@nestjs/common");
const terminus_1 = require("@nestjs/terminus");
const Public_decoration_1 = require("../../../auth/authentification/decorators/Public.decoration");
const prisma_health_1 = require("../indicators/prisma.health");
const swagger_1 = require("@nestjs/swagger");
let HealthController = class HealthController {
    health;
    prismaIndicator;
    disk;
    memory;
    constructor(health, prismaIndicator, disk, memory) {
        this.health = health;
        this.prismaIndicator = prismaIndicator;
        this.disk = disk;
        this.memory = memory;
    }
    check() {
        return this.health.check([
            () => this.prismaIndicator.isHealthy('database'),
            () => this.disk.checkStorage('storage', {
                path: '/',
                thresholdPercent: 0.9,
            }),
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
        ]);
    }
    checkDatabase() {
        return this.health.check([
            () => this.prismaIndicator.isHealthy('database'),
        ]);
    }
    checkMemory() {
        return this.health.check([
            () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
            () => this.memory.checkRSS('memory_rss', 512 * 1024 * 1024),
        ]);
    }
    live() {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: Math.floor(process.uptime()),
            environment: process.env.NODE_ENV ?? 'development',
        };
    }
    ready() {
        return this.health.check([
            () => this.prismaIndicator.isHealthy('database'),
        ]);
    }
};
exports.HealthController = HealthController;
__decorate([
    (0, common_1.Get)(),
    (0, Public_decoration_1.Public)(),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Bilan de santé complet de l\'application' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'L\'application et toutes ses dépendances sont saines.' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'Un ou plusieurs composants (Base de données, Stockage, Mémoire) sont défaillants.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "check", null);
__decorate([
    (0, common_1.Get)('db'),
    (0, Public_decoration_1.Public)(),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vérification de l\'état de la base de données' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'La base de données Prisma fonctionne correctement.' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'La base de données est inaccessible.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "checkDatabase", null);
__decorate([
    (0, common_1.Get)('memory'),
    (0, Public_decoration_1.Public)(),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Vérification de l\'état de la mémoire (Heap & RSS)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'L\'utilisation de la mémoire est sous les seuils critiques.' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'La consommation de mémoire a dépassé la limite autorisée.' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "checkMemory", null);
__decorate([
    (0, common_1.Get)('live'),
    (0, Public_decoration_1.Public)(),
    (0, swagger_1.ApiOperation)({ summary: 'Liveness Probe : Indique si l\'instance de l\'application est vivante' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'L\'application tourne (statut ok).' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "live", null);
__decorate([
    (0, common_1.Get)('ready'),
    (0, Public_decoration_1.Public)(),
    (0, terminus_1.HealthCheck)(),
    (0, swagger_1.ApiOperation)({ summary: 'Readiness Probe : Détermine si l\'application est prête à recevoir du trafic' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'L\'application est prête à traiter les requêtes.' }),
    (0, swagger_1.ApiResponse)({ status: 503, description: 'L\'application n\'est pas prête (ex: DB non connectée).' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HealthController.prototype, "ready", null);
exports.HealthController = HealthController = __decorate([
    (0, common_1.Controller)('health'),
    __metadata("design:paramtypes", [terminus_1.HealthCheckService,
        prisma_health_1.PrismaHealthIndicator,
        terminus_1.DiskHealthIndicator,
        terminus_1.MemoryHealthIndicator])
], HealthController);
//# sourceMappingURL=health.controller.js.map
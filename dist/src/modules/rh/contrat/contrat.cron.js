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
var ContratCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContratCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const contrat_service_1 = require("./services/contrat.service");
let ContratCron = ContratCron_1 = class ContratCron {
    contratService;
    logger = new common_1.Logger(ContratCron_1.name);
    constructor(contratService) {
        this.contratService = contratService;
    }
    async verifierExpirationsContrats() {
        this.logger.log('🔍 Vérification CDD en cours...');
        const resultats = await this.contratService.traiterAlertesCDD();
        for (const r of resultats) {
            this.logger.log(`J-${r.delai} : ${r.nb} alerte(s) envoyée(s)`);
        }
    }
};
exports.ContratCron = ContratCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ContratCron.prototype, "verifierExpirationsContrats", null);
exports.ContratCron = ContratCron = ContratCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [contrat_service_1.ContratService])
], ContratCron);
//# sourceMappingURL=contrat.cron.js.map
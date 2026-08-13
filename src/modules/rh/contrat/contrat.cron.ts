// ─────────────────────────────────────────────────────────────────────────────
// src/contrat/contrat.cron.ts
// ─────────────────────────────────────────────────────────────────────────────
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ContratService } from './services/contrat.service';

@Injectable()
export class ContratCron {
  private readonly logger = new Logger(ContratCron.name);

  constructor(private readonly contratService: ContratService) { }


  //@Cron(CronExpression.EVERY_10_SECONDS) // Runs every 10 seconds
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async verifierExpirationsContrats() {
    this.logger.log('🔍 Vérification CDD en cours...');

    const resultats = await this.contratService.traiterAlertesCDD();

    for (const r of resultats) {
      this.logger.log(`J-${r.delai} : ${r.nb} alerte(s) envoyée(s)`);
    }
  }

}

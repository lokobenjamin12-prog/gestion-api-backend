import { ContratService } from './services/contrat.service';
export declare class ContratCron {
    private readonly contratService;
    private readonly logger;
    constructor(contratService: ContratService);
    verifierExpirationsContrats(): Promise<void>;
}

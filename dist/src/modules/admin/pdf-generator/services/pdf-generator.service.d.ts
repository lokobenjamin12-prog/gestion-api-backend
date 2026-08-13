interface LigneAbsence {
    employe: string;
    date: string;
    estJustifie: boolean;
    statut: string;
}
interface LigneRetard {
    employe: string;
    date: string;
    estJustifie: boolean;
    statut: string;
    heureArrivee?: string;
}
export interface PdfColumn {
    header: string;
    key: string;
    width: number;
}
export interface PdfTableOptions {
    title: string;
    columns: PdfColumn[];
    rows: Record<string, any>[];
}
export declare class PdfGeneratorService {
    readonly OUTPUT_DIR_FICHES: string;
    constructor();
    genererRapportAbsencesEtRetards(absenceLignes: LigneAbsence[], retardLignes: LigneRetard[], periode: string, outputDir: string, avertissement?: string | null, entreprise?: any, salaires?: any[]): Promise<string>;
    genererRapportMasseSalariale(data: {
        agregats: any;
        salaires: any[];
    }, periode: string, outputDir: string, entreprise?: any): Promise<string>;
    genererRapportContratsCDD(contrats: any[], periode: string, outputDir: string, entreprise?: any): Promise<string>;
    genererFichePaie(salaire: any, entreprise: any | null, outputDir: string): Promise<string>;
    private joursRestants;
}
export {};

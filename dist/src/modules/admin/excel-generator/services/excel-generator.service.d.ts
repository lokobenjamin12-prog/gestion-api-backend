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
    heureArrivee: string;
}
export declare class ExcelGeneratorService {
    genererRapportAbsencesEtRetards(absenceLignes: LigneAbsence[], retardLignes: LigneRetard[], periode: string, outputDir: string, avertissement?: string | null, entreprise?: any, salaires?: any[]): Promise<string>;
    genererRapportMasseSalariale(data: {
        agregats: any;
        salaires: any[];
    }, periode: string, outputDir: string, entreprise?: any): Promise<string>;
    genererRapportContratsCDD(contrats: any[], periode: string, outputDir: string, entreprise?: any): Promise<string>;
    private setWorkbookMeta;
    private drawSummarySheet;
    private drawSheetTitle;
    private drawWarningRow;
    private styleHeaderRow;
    private styleDataRow;
    private addAutoFilter;
    private joursRestants;
}
export {};

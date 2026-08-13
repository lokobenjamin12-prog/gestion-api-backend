export declare function getJoursOuvrables(mois: number, annee: number): number;
export declare function isDateInMonth(dateStr: string, mois: number, annee: number): boolean;
export declare function extractMoisAnnee(dateStr: string): {
    mois: number;
    annee: number;
};
export declare function round2(n: number): number;
export declare function calculerPaie(params: {
    salaireBrut: number;
    prixJournalier: number;
    joursAbsence: Array<{
        estJustifie: boolean;
    }>;
    joursRetard: Array<{
        estJustifie: boolean;
    }>;
    primes: Array<{
        somme: number;
    }>;
}): import('./paie.types').CalculPaieResult;

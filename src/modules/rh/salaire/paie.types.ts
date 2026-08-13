// paie.types.ts

export interface JourAbsence {
    /** Format ISO : "YYYY-MM-DD" */
    date: string;
    estJustifie: boolean;
}

export interface JourRetard {
    /** Format ISO : "YYYY-MM-DD" */
    date: string;
    estJustifie: boolean;
    /** Heure d'arrivée au format "HH:MM" — ex: "08:45" */
    heureArrivee?: string;
}

export interface Prime {
    somme: number;
    raison: string;
}

export interface CalculPaieResult {
    nbAbsJust: number;
    nbAbsInjust: number;
    deductionAbs: number;

    nbRetardsJust: number;
    nbRetardsInjust: number;
    deductionRetards: number;

    totalDeductions: number;
    totalPrimes: number;
    salaireNet: number;
}
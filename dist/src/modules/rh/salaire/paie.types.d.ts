export interface JourAbsence {
    date: string;
    estJustifie: boolean;
}
export interface JourRetard {
    date: string;
    estJustifie: boolean;
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

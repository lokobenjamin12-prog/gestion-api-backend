"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getJoursOuvrables = getJoursOuvrables;
exports.isDateInMonth = isDateInMonth;
exports.extractMoisAnnee = extractMoisAnnee;
exports.round2 = round2;
exports.calculerPaie = calculerPaie;
function getJoursOuvrables(mois, annee) {
    return new Date(annee, mois, 0).getDate();
}
function isDateInMonth(dateStr, mois, annee) {
    const d = new Date(dateStr);
    return (!isNaN(d.getTime()) &&
        d.getUTCFullYear() === annee &&
        d.getUTCMonth() + 1 === mois);
}
function extractMoisAnnee(dateStr) {
    const d = new Date(dateStr);
    return { mois: d.getUTCMonth() + 1, annee: d.getUTCFullYear() };
}
function round2(n) {
    return Math.round(n * 100) / 100;
}
function calculerPaie(params) {
    const { salaireBrut, prixJournalier, joursAbsence, joursRetard, primes } = params;
    const nbAbsJust = joursAbsence.filter(j => j.estJustifie).length;
    const nbAbsInjust = joursAbsence.filter(j => !j.estJustifie).length;
    const deductionAbs = round2(nbAbsInjust * prixJournalier);
    const nbRetardsJust = joursRetard.filter(j => j.estJustifie).length;
    const nbRetardsInjust = joursRetard.filter(j => !j.estJustifie).length;
    const deductionRetards = round2(nbRetardsInjust * prixJournalier);
    const totalDeductions = round2(deductionAbs + deductionRetards);
    const totalPrimes = round2(primes.reduce((s, p) => s + p.somme, 0));
    const salaireNet = round2(Math.max(0, salaireBrut - totalDeductions + totalPrimes));
    return {
        nbAbsJust,
        nbAbsInjust,
        deductionAbs,
        nbRetardsJust,
        nbRetardsInjust,
        deductionRetards,
        totalDeductions,
        totalPrimes,
        salaireNet,
    };
}
//# sourceMappingURL=jours-ouvrables.util.js.map
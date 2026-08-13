// jours-ouvrables.util.ts

/**
 * Calcule le nombre de jours ouvrables (lundi–vendredi) dans un mois donné.
 *
 * @example getJoursOuvrables(1, 2026) → 22
 */
// export function getJoursOuvrables(mois: number, annee: number): number {
//     let count = 0;
//     const cursor = new Date(annee, mois - 1, 1);
//     while (cursor.getMonth() === mois - 1) {
//         const jour = cursor.getDay(); // 0 = dimanche, 6 = samedi
//         if (jour !== 0 && jour !== 6) count++;
//         cursor.setDate(cursor.getDate() + 1);
//     }
//     return count;
// }


/**
 * Retourne le nombre total de jours dans un mois donné
 * (tous les jours sans exception — weekends et jours fériés inclus).
 *
 * @example getJoursOuvrables(2, 2027) → 28
 * @example getJoursOuvrables(1, 2026) → 31
 */
export function getJoursOuvrables(mois: number, annee: number): number {
    return new Date(annee, mois, 0).getDate();
}

/**
 * Vérifie qu'une date ISO ("YYYY-MM-DD") appartient au mois et à l'année donnés.
 * Retourne false si la chaîne n'est pas une date valide.
 */
export function isDateInMonth(dateStr: string, mois: number, annee: number): boolean {
    const d = new Date(dateStr);
    return (
        !isNaN(d.getTime()) &&
        d.getUTCFullYear() === annee &&
        d.getUTCMonth() + 1 === mois
    );
}

/**
 * Extrait le mois (1-12) et l'année depuis une date ISO ("YYYY-MM-DD").
 */
export function extractMoisAnnee(dateStr: string): { mois: number; annee: number } {
    const d = new Date(dateStr);
    return { mois: d.getUTCMonth() + 1, annee: d.getUTCFullYear() };
}

/**
 * Arrondit un nombre à 2 décimales (évite les imprécisions flottantes).
 */
export function round2(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * Calcule le salaire net à partir des composantes de la paie.
 * Garantit que le résultat ne peut pas être négatif.
 */
export function calculerPaie(params: {
    salaireBrut: number;
    prixJournalier: number;
    joursAbsence: Array<{ estJustifie: boolean }>;
    joursRetard: Array<{ estJustifie: boolean }>;
    primes: Array<{ somme: number }>;
}): import('./paie.types').CalculPaieResult {
    const { salaireBrut, prixJournalier, joursAbsence, joursRetard, primes } = params;

    // ── Absences ──────────────────────────────────────────────────────────────
    const nbAbsJust = joursAbsence.filter(j => j.estJustifie).length;
    const nbAbsInjust = joursAbsence.filter(j => !j.estJustifie).length;
    // Seules les absences injustifiées entraînent une déduction
    const deductionAbs = round2(nbAbsInjust * prixJournalier);

    // ── Retards ───────────────────────────────────────────────────────────────
    const nbRetardsJust = joursRetard.filter(j => j.estJustifie).length;
    const nbRetardsInjust = joursRetard.filter(j => !j.estJustifie).length;
    // Un retard injustifié annule la journée → 1 jour déduit
    const deductionRetards = round2(nbRetardsInjust * prixJournalier);

    // ── Totaux ────────────────────────────────────────────────────────────────
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

// src/modules/excel-generator/services/excel-generator.service.ts
import { Injectable } from '@nestjs/common';
import * as ExcelJS from 'exceljs';
import * as path from 'path';

// ── Types des lignes reçues depuis rapport.service.ts ─────────────────────────
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

// ── Styles partagés ───────────────────────────────────────────────────────────
const HEADER_FILL: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0201A' }, // rouge Hoozon
};
const HEADER_FONT: Partial<ExcelJS.Font> = {
  bold: true, color: { argb: 'FFFFFFFF' }, size: 10,
};
const SUMMARY_FILL: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' },
};
const ALT_FILL: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FC' },
};
const WHITE_FILL: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' },
};
const WARNING_FILL: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' },
};
const ALERT_FILL: ExcelJS.Fill = {
  type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' },
};
const BORDER_THIN: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFD0D9E8' } },
  left: { style: 'thin', color: { argb: 'FFD0D9E8' } },
  bottom: { style: 'thin', color: { argb: 'FFD0D9E8' } },
  right: { style: 'thin', color: { argb: 'FFD0D9E8' } },
};
const BORDER_WARNING: Partial<ExcelJS.Borders> = {
  top: { style: 'thin', color: { argb: 'FFFFAD00' } },
  left: { style: 'medium', color: { argb: 'FFFFAD00' } },
  bottom: { style: 'thin', color: { argb: 'FFFFAD00' } },
  right: { style: 'thin', color: { argb: 'FFFFAD00' } },
};

@Injectable()
export class ExcelGeneratorService {

  // ══════════════════════════════════════════════════════════════════════════
  // RAPPORT ABSENCES & RETARDS (fonction unique combinée)
  // Feuille 1 : Résumé stats | Feuille 2 : Jours Absence | Feuille 3 : Jours Retard
  // ══════════════════════════════════════════════════════════════════════════

  // Remplacer la fonction genererRapportAbsencesEtRetards dans excel-generator.service.ts
  // Mettre aussi à jour la signature dans rapport.service.ts (ajouter entreprise et salaires)

  async genererRapportAbsencesEtRetards(
    absenceLignes: LigneAbsence[],
    retardLignes: LigneRetard[],
    periode: string,
    outputDir: string,
    avertissement: string | null = null,
    entreprise: any = null,         // ← nouveau
    salaires: any[] = [],         // ← nouveau
  ): Promise<string> {
    const wb = new ExcelJS.Workbook();
    this.setWorkbookMeta(wb, 'Rapport Absences & Retards');

    // ── Calcul des statistiques ──────────────────────────────────────────────
    const nbAbsTotal = absenceLignes.length;
    const nbAbsJust = absenceLignes.filter(l => l.estJustifie).length;
    const nbAbsInjust = absenceLignes.filter(l => !l.estJustifie).length;
    const nbRetTotal = retardLignes.length;
    const nbRetJust = retardLignes.filter(l => l.estJustifie).length;
    const nbRetInjust = retardLignes.filter(l => !l.estJustifie).length;

    // ── Calcul des montants (depuis salaires) ────────────────────────────────
    let totalBrut = 0, totalDedRetards = 0, totalDedAbs = 0;
    let totalPrimes = 0, totalNet = 0, totalVerse = 0;
    let nbRetInjustTotal = 0, nbAbsInjustTotal = 0;

    for (const s of salaires) {
      totalBrut += Number(s.salaireBrut ?? 0);
      totalDedRetards += Number(s.deductionRetards ?? 0);
      totalDedAbs += Number(s.deductionAbs ?? 0);
      totalPrimes += Number(s.totalPrimes ?? 0);
      totalNet += Number(s.salaireNet ?? 0);
      totalVerse += Number(s.montantVerse ?? 0);
      nbRetInjustTotal += Number(s.nbRetardsInjust ?? 0);
      nbAbsInjustTotal += Number(s.nbAbsInjust ?? 0);
    }

    const user = salaires.length > 0 ? salaires[0].user : null;

    // ════════════════════════════════════════════════════════════════════════
    // FEUILLE 1 : RÉSUMÉ
    // ════════════════════════════════════════════════════════════════════════
    const wsSummary = wb.addWorksheet('Résumé');
    wsSummary.columns = [
      { key: 'label', width: 32 },
      { key: 'value', width: 28 },
    ];

    // ── Titre & en-tête ──────────────────────────────────────────────────────
    const titleRow = wsSummary.addRow(['RAPPORT ABSENCES & RETARDS']);
    titleRow.font = { bold: true, size: 14, color: { argb: 'FFC0201A' } };
    wsSummary.mergeCells(`A${titleRow.number}:B${titleRow.number}`);

    const nomEntreprise = entreprise?.nom ?? '';
    if (nomEntreprise) {
      const entRow = wsSummary.addRow([nomEntreprise]);
      entRow.font = { bold: true, size: 11, color: { argb: 'FF333333' } };
      wsSummary.mergeCells(`A${entRow.number}:B${entRow.number}`);
    }

    if (entreprise?.adresse) {
      const adrRow = wsSummary.addRow([entreprise.adresse]);
      adrRow.font = { italic: true, size: 9, color: { argb: 'FF666666' } };
      wsSummary.mergeCells(`A${adrRow.number}:B${adrRow.number}`);
    }

    const periodeRow = wsSummary.addRow([`Période : ${periode}`]);
    periodeRow.font = { italic: true, color: { argb: 'FF555555' } };
    wsSummary.mergeCells(`A${periodeRow.number}:B${periodeRow.number}`);

    const dateRow = wsSummary.addRow([`Généré le : ${new Date().toLocaleDateString('fr-FR')}`]);
    dateRow.font = { italic: true, size: 9, color: { argb: 'FF888888' } };
    wsSummary.mergeCells(`A${dateRow.number}:B${dateRow.number}`);

    // ── Avertissement ────────────────────────────────────────────────────────
    if (avertissement) {
      wsSummary.addRow([]);
      this.drawWarningRow(wsSummary, `⚠  ${avertissement}`);
    }

    wsSummary.addRow([]);

    // ── Informations employé ─────────────────────────────────────────────────
    if (user) {
      const empTitleRow = wsSummary.addRow(['Informations employé']);
      empTitleRow.font = { bold: true, size: 11, color: { argb: 'FFC0201A' } };
      wsSummary.mergeCells(`A${empTitleRow.number}:B${empTitleRow.number}`);

      const empFields: [string, string][] = [
        ['Nom complet', `${user.firstName} ${user.lastName}`],
        ['Email professionnel', user.email ?? '—'],
        ['Téléphone', user.phoneNumber ?? '—'],
        ['Adresse', user.adresse ?? '—'],
        ['Poste', user.role?.post ?? '—'],
        ['Date de recrutement', user.dateRecrutement
          ? new Date(user.dateRecrutement).toLocaleDateString('fr-FR') : '—'],
        ['Période de paie', periode],
      ];

      empFields.forEach(([label, value], idx) => {
        const row = wsSummary.addRow([label, value]);
        row.fill = idx % 2 === 0 ? SUMMARY_FILL : WHITE_FILL;
        row.border = BORDER_THIN;
        row.getCell(1).font = { bold: true, color: { argb: 'FF555555' } };
        row.getCell(2).font = { color: { argb: 'FF1A1A1A' } };
      });

      wsSummary.addRow([]);
    }

    // ── Statistiques absences & retards ──────────────────────────────────────
    const statsTitleRow = wsSummary.addRow(['Récapitulatif du mois']);
    statsTitleRow.font = { bold: true, size: 11, color: { argb: 'FFC0201A' } };
    wsSummary.mergeCells(`A${statsTitleRow.number}:B${statsTitleRow.number}`);

    const statsHeader = wsSummary.addRow(['Indicateur', 'Valeur']);
    statsHeader.fill = HEADER_FILL;
    statsHeader.font = HEADER_FONT;
    statsHeader.border = BORDER_THIN;

    const statsItems: [string, number][] = [
      ['── ABSENCES ──', 0],
      ['Total absences', nbAbsTotal],
      ['Absences justifiées', nbAbsJust],
      ['Absences injustifiées', nbAbsInjust],
      ['── RETARDS ──', 0],
      ['Total retards', nbRetTotal],
      ['Retards justifiés', nbRetJust],
      ['Retards injustifiés', nbRetInjust],
    ];

    statsItems.forEach(([label, value], idx) => {
      const isSeparator = label.startsWith('──');
      const row = wsSummary.addRow([label, isSeparator ? '' : value]);
      if (isSeparator) {
        row.font = { bold: true, color: { argb: 'FFC0201A' } };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' } };
      } else {
        row.fill = idx % 2 === 0 ? SUMMARY_FILL : WHITE_FILL;
        row.border = BORDER_THIN;
        const valCell = row.getCell(2);
        valCell.font = { bold: true };
        valCell.numFmt = '#,##0';
        // Rouge si injustifié > 0
        if ((label.includes('injust') || label.includes('Injust')) && value > 0) {
          valCell.font = { bold: true, color: { argb: 'FFC0201A' } };
        }
      }
    });

    wsSummary.addRow([]);

    // ── Détail du calcul de la paie ──────────────────────────────────────────
    if (salaires.length > 0) {
      const calcTitleRow = wsSummary.addRow(['Détail du calcul de la paie']);
      calcTitleRow.font = { bold: true, size: 11, color: { argb: 'FFC0201A' } };
      wsSummary.mergeCells(`A${calcTitleRow.number}:B${calcTitleRow.number}`);

      const calcHeader = wsSummary.addRow(['Libellé', 'Montant (FCFA)']);
      calcHeader.fill = HEADER_FILL;
      calcHeader.font = HEADER_FONT;
      calcHeader.border = BORDER_THIN;

      const calcItems: [string, number, boolean][] = [
        ['Salaire brut de base', totalBrut, true],
        [`Déduction retards injustifiés (${nbRetInjustTotal} jour(s))`, -totalDedRetards, false],
        [`Déduction absences injustifiées (${nbAbsInjustTotal} jour(s))`, -totalDedAbs, false],
        ['Primes', totalPrimes, true],
      ];

      calcItems.forEach(([label, value, isPositive], idx) => {
        const row = wsSummary.addRow([label, Math.abs(value)]);
        row.fill = idx % 2 === 0 ? SUMMARY_FILL : WHITE_FILL;
        row.border = BORDER_THIN;
        const valCell = row.getCell(2);
        valCell.numFmt = '#,##0.00';
        valCell.font = {
          bold: true,
          color: { argb: isPositive ? 'FF2E7D32' : 'FFC0201A' },
        };
      });

      // Salaire net
      const netRow = wsSummary.addRow(['SALAIRE NET À PAYER', totalNet]);
      netRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0201A' } };
      netRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      netRow.border = BORDER_THIN;
      netRow.height = 22;
      netRow.getCell(2).numFmt = '#,##0.00';

      // Montant versé
      const verseRow = wsSummary.addRow(['Montant versé', totalVerse]);
      verseRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
      verseRow.font = { bold: true };
      verseRow.border = BORDER_THIN;
      verseRow.getCell(2).numFmt = '#,##0.00';
    }

    // ════════════════════════════════════════════════════════════════════════
    // FEUILLE 2 : JOURS ABSENCE
    // ════════════════════════════════════════════════════════════════════════
    const wsAbs = wb.addWorksheet('Jours Absence');
    this.drawSheetTitle(wsAbs, 'Détails de Jours Absence', avertissement);

    wsAbs.columns = [
      { header: 'Jour', key: 'date', width: 18 },
      { header: 'Justifié', key: 'estJustifie', width: 14 },
      { header: 'Statut', key: 'statut', width: 22 },
    ];
    this.styleHeaderRow(wsAbs, wsAbs.lastRow!.number + 1);

    absenceLignes.forEach((ligne, idx) => {
      const row = wsAbs.addRow({
        date: new Date(ligne.date).toLocaleDateString('fr-FR'),
        estJustifie: ligne.estJustifie ? '☑ Justifiée' : '☐ Injustifiée',
        statut: ligne.statut,
      });
      const isAlert = !ligne.estJustifie;
      row.fill = isAlert
        ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' } }
        : idx % 2 === 0 ? WHITE_FILL : ALT_FILL;
      row.border = BORDER_THIN;
      row.height = 16;
      row.alignment = { vertical: 'middle' };
      row.getCell('estJustifie').font = ligne.estJustifie
        ? { color: { argb: 'FF2E7D32' }, bold: true }
        : { color: { argb: 'FFC0201A' }, bold: true };
    });

    this.addAutoFilter(wsAbs);

    // ════════════════════════════════════════════════════════════════════════
    // FEUILLE 3 : JOURS RETARD
    // ════════════════════════════════════════════════════════════════════════
    const wsRet = wb.addWorksheet('Jours Retard');
    this.drawSheetTitle(wsRet, 'Détails de Jours Retard', avertissement);

    wsRet.columns = [
      { header: "Jour", key: 'date', width: 18 },
      { header: "Heure d'arrivée", key: 'heureArrivee', width: 18 },
      { header: 'Justifié', key: 'estJustifie', width: 18 },
      { header: 'Statut', key: 'statut', width: 28 },
    ];
    this.styleHeaderRow(wsRet, wsRet.lastRow!.number + 1);

    retardLignes.forEach((ligne, idx) => {
      const row = wsRet.addRow({
        date: new Date(ligne.date).toLocaleDateString('fr-FR'),
        heureArrivee: ligne.heureArrivee ?? '—',
        estJustifie: ligne.estJustifie ? '☑ Justifié' : '☐ Injustifié',
        statut: ligne.statut,
      });
      const isAlert = !ligne.estJustifie;
      row.fill = isAlert
        ? { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' } }
        : idx % 2 === 0 ? WHITE_FILL : ALT_FILL;
      row.border = BORDER_THIN;
      row.height = 16;
      row.alignment = { vertical: 'middle' };

      row.getCell('heureArrivee').font = ligne.estJustifie
        ? { color: { argb: 'FF1A1A1A' } }
        : { color: { argb: 'FFC0201A' }, bold: true };

      row.getCell('estJustifie').font = ligne.estJustifie
        ? { color: { argb: 'FF2E7D32' }, bold: true }
        : { color: { argb: 'FFC0201A' }, bold: true };
    });

    this.addAutoFilter(wsRet);

    // ── Écriture du fichier ──────────────────────────────────────────────────
    const filename = `rapport_absences_retards_${periode.replace('/', '-')}_${Date.now()}.xlsx`;
    const filepath = path.join(outputDir, filename);
    await wb.xlsx.writeFile(filepath);
    return filepath;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RAPPORT MASSE SALARIALE
  // ══════════════════════════════════════════════════════════════════════════
  async genererRapportMasseSalariale(
    data: { agregats: any; salaires: any[] },
    periode: string,
    outputDir: string,
    entreprise: any = null,
  ): Promise<string> {
    const wb = new ExcelJS.Workbook();
    this.setWorkbookMeta(wb, 'Masse Salariale');

    const { agregats, salaires } = data;

    // ── Feuille 1 : Résumé ────────────────────────────────────────────────
    const wsSummary = wb.addWorksheet('Résumé');
    this.drawSummarySheet(wsSummary, 'MASSE SALARIALE', periode, [
      ["Nombre d'employés", agregats.nbEmployes],
      ['Total brut (FCFA)', agregats.totalBrut],
      ['Total déductions (FCFA)', agregats.totalDeductions],
      ['Total primes (FCFA)', agregats.totalPrimes ?? 0],
      ['Total net (FCFA)', agregats.totalNet],
      ['Total versé (FCFA)', agregats.totalVerse],
    ], null, entreprise);

    // ── Feuille 2 : Détail par employé ────────────────────────────────────
    const wsDetail = wb.addWorksheet('Détail employés');
    this.drawSheetTitle(wsDetail, 'Détail par employé', null);

    wsDetail.columns = [
      { header: 'Employé', key: 'employe', width: 22 },
      { header: 'Salaire brut', key: 'brut', width: 16 },
      { header: 'Nb abs. just.', key: 'nbAbsJust', width: 14 },
      { header: 'Nb abs. injust.', key: 'nbAbsInjust', width: 14 },
      { header: 'Déd. absences', key: 'dedAbs', width: 16 },
      { header: 'Nb retards just.', key: 'nbRetJust', width: 14 },
      { header: 'Nb retards injust.', key: 'nbRetInjust', width: 16 },
      { header: 'Déd. retards', key: 'dedRetards', width: 14 },
      { header: 'Total déductions', key: 'totalDed', width: 16 },
      { header: 'Total primes', key: 'totalPrimes', width: 14 },
      { header: 'Salaire net', key: 'net', width: 14 },
      { header: 'Montant versé', key: 'verse', width: 14 },
      { header: 'Écart', key: 'ecart', width: 12 },
    ];
    this.styleHeaderRow(wsDetail, wsDetail.lastRow!.number + 1);

    salaires.forEach((s, idx) => {
      const ecart = s.ecart ? Number(s.ecart) : null;
      const row = wsDetail.addRow({
        employe: `${s.user?.firstName ?? ''} ${s.user?.lastName ?? ''}`.trim(),
        brut: Number(s.salaireBrut),
        nbAbsJust: s.nbAbsJust ?? 0,
        nbAbsInjust: s.nbAbsInjust ?? 0,
        dedAbs: Number(s.deductionAbs ?? 0),
        nbRetJust: s.nbRetardsJust ?? 0,
        nbRetInjust: s.nbRetardsInjust ?? 0,
        dedRetards: Number(s.deductionRetards ?? 0),
        totalDed: Number(s.totalDeductions),
        totalPrimes: Number(s.totalPrimes ?? 0),
        net: Number(s.salaireNet),
        verse: s.montantVerse ? Number(s.montantVerse) : null,
        ecart,
      });
      this.styleDataRow(row, idx);

      // Format monétaire
      ['brut', 'dedAbs', 'dedRetards', 'totalDed', 'totalPrimes', 'net', 'verse', 'ecart'].forEach(key => {
        const cell = row.getCell(key);
        if (cell.value !== null && cell.value !== undefined) {
          cell.numFmt = '#,##0 "FCFA"';
        }
      });

      row.getCell('net').font = { bold: true };

      if (ecart !== null) {
        const cell = row.getCell('ecart');
        cell.font = ecart >= 0
          ? { color: { argb: 'FF2E7D32' } }
          : { color: { argb: 'FFC0201A' } };
      }
    });

    // Ligne total
    const totalRow = wsDetail.addRow({
      employe: 'TOTAL',
      brut: agregats.totalBrut,
      totalDed: agregats.totalDeductions,
      totalPrimes: agregats.totalPrimes ?? 0,
      net: agregats.totalNet,
      verse: agregats.totalVerse,
    });
    totalRow.font = { bold: true };
    totalRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD5E8F0' } };
    totalRow.border = BORDER_THIN;

    this.addAutoFilter(wsDetail);

    const filename = `rapport_masse_salariale_${periode.replace('/', '-')}_${Date.now()}.xlsx`;
    const filepath = path.join(outputDir, filename);
    await wb.xlsx.writeFile(filepath);
    return filepath;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RAPPORT CONTRATS CDD
  // ══════════════════════════════════════════════════════════════════════════
  async genererRapportContratsCDD(
    contrats: any[],
    periode: string,
    outputDir: string,
    entreprise: any = null,
  ): Promise<string> {
    const wb = new ExcelJS.Workbook();
    this.setWorkbookMeta(wb, 'Contrats CDD');

    const wsSummary = wb.addWorksheet('Résumé');
    this.drawSummarySheet(wsSummary, 'CONTRATS CDD — EXPIRATIONS', periode, [
      ['CDD à surveiller', contrats.length],
      ['Expirant < 7j', contrats.filter(c => this.joursRestants(c.dateFin) <= 7).length],
      ['Expirant < 15j', contrats.filter(c => this.joursRestants(c.dateFin) <= 15).length],
      ['Expirant < 30j', contrats.filter(c => this.joursRestants(c.dateFin) <= 30).length],
    ], null, entreprise);

    const wsDetail = wb.addWorksheet('Détail CDD');
    this.drawSheetTitle(wsDetail, 'Contrats CDD expirant dans les 90 prochains jours', null);

    wsDetail.columns = [
      { header: 'Employé', key: 'employe', width: 22 },
      { header: 'Date début', key: 'debut', width: 14 },
      { header: 'Date fin', key: 'fin', width: 14 },
      { header: 'Jours restants', key: 'jours', width: 14 },
      { header: 'Alertes envoyées', key: 'alertes', width: 16 },
      { header: 'Statut urgence', key: 'statut', width: 16 },
    ];
    this.styleHeaderRow(wsDetail, wsDetail.lastRow!.number + 1);

    contrats.forEach((c, idx) => {
      const jours = this.joursRestants(c.dateFin);
      const row = wsDetail.addRow({
        employe: `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.trim(),
        debut: new Date(c.dateDebut).toLocaleDateString('fr-FR'),
        fin: new Date(c.dateFin).toLocaleDateString('fr-FR'),
        jours,
        alertes: c.alertes?.length ?? 0,
        statut: jours <= 7 ? 'URGENT' : jours <= 15 ? 'ATTENTION' : 'À surveiller',
      });
      this.styleDataRow(row, idx);

      const statutCell = row.getCell('statut');
      const joursCell = row.getCell('jours');
      if (jours <= 7) {
        statutCell.font = { color: { argb: 'FFC0201A' }, bold: true };
        joursCell.font = { color: { argb: 'FFC0201A' }, bold: true };
      } else if (jours <= 15) {
        statutCell.font = { color: { argb: 'FFBA7517' }, bold: true };
      }
    });

    this.addAutoFilter(wsDetail);

    const filename = `rapport_contrats_cdd_${periode.replace('/', '-')}_${Date.now()}.xlsx`;
    const filepath = path.join(outputDir, filename);
    await wb.xlsx.writeFile(filepath);
    return filepath;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS PARTAGÉS
  // ══════════════════════════════════════════════════════════════════════════

  private setWorkbookMeta(wb: ExcelJS.Workbook, titre: string) {
    wb.creator = 'Système RH';
    wb.created = new Date();
    wb.modified = new Date();
    wb.title = titre;
  }

  private drawSummarySheet(
    ws: ExcelJS.Worksheet,
    titre: string,
    periode: string,
    items: [string, number | string][],
    avertissement: string | null,
    entreprise: any = null,
  ) {
    ws.columns = [
      { key: 'label', width: 30 },
      { key: 'value', width: 20 },
    ];

    // ── Nom entreprise ──────────────────────────────────────────────────────
    if (entreprise?.nom) {
      const nomRow = ws.addRow([entreprise.nom]);
      nomRow.font = { bold: true, size: 13, color: { argb: 'FF1A1A1A' } };
      ws.mergeCells(`A${nomRow.number}:B${nomRow.number}`);
    }

    if (entreprise?.adresse) {
      const adrRow = ws.addRow([entreprise.adresse]);
      adrRow.font = { italic: true, size: 9, color: { argb: 'FF666666' } };
      ws.mergeCells(`A${adrRow.number}:B${adrRow.number}`);
    }

    const contact = [entreprise?.telephone, entreprise?.email]
      .filter(Boolean).join('  |  ');
    if (contact) {
      const cRow = ws.addRow([contact]);
      cRow.font = { size: 9, color: { argb: 'FF666666' } };
      ws.mergeCells(`A${cRow.number}:B${cRow.number}`);
    }


    // ── Titre du rapport ────────────────────────────────────────────────────

    const titleRow = ws.addRow([titre]);
    titleRow.font = { bold: true, size: 14, color: { argb: 'FFC0201A' } };
    ws.mergeCells(`A${titleRow.number}:B${titleRow.number}`);

    const periodeRow = ws.addRow([`Période : ${periode}`]);
    periodeRow.font = { italic: true, color: { argb: 'FF555555' } };
    ws.mergeCells(`A${periodeRow.number}:B${periodeRow.number}`);

    const dateRow = ws.addRow([`Généré le : ${new Date().toLocaleDateString('fr-FR')}`]);
    dateRow.font = { italic: true, size: 9, color: { argb: 'FF888888' } };
    ws.mergeCells(`A${dateRow.number}:B${dateRow.number}`);

    if (avertissement) {
      ws.addRow([]);
      this.drawWarningRow(ws, avertissement);
    }
    ws.addRow([]);

    const headerRow = ws.addRow(['Indicateur', 'Valeur']);
    headerRow.fill = HEADER_FILL;
    headerRow.font = HEADER_FONT;
    headerRow.border = BORDER_THIN;

    items.forEach(([label, value], idx) => {
      const isSeparator = typeof value === 'string' && value === '';
      const row = ws.addRow([label, isSeparator ? '' : value]);

      if (isSeparator) {
        // Ligne séparatrice (titre de section)
        row.font = { bold: true, color: { argb: 'FFC0201A' } };
        row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' } };
      } else {
        row.fill = idx % 2 === 0 ? SUMMARY_FILL : WHITE_FILL;
        row.border = BORDER_THIN;
        const valCell = row.getCell(2);
        valCell.font = { bold: true };
        valCell.numFmt = '#,##0';
      }
    });
  }

  private drawSheetTitle(
    ws: ExcelJS.Worksheet,
    titre: string,
    avertissement: string | null,
  ) {
    const titleRow = ws.addRow([titre]);
    titleRow.font = { bold: true, size: 13, color: { argb: 'FFC0201A' } };

    if (avertissement) {
      ws.addRow([]);
      this.drawWarningRow(ws, avertissement);
    }
    ws.addRow([]);
  }

  private drawWarningRow(ws: ExcelJS.Worksheet, message: string) {
    const row = ws.addRow([`⚠  ${message}`]);
    row.fill = WARNING_FILL;
    row.font = { color: { argb: 'FF856404' }, bold: true, size: 10 };
    row.border = BORDER_WARNING;
    row.height = 20;

    const colCount = ws.columns.length || 2;
    const lastCol = String.fromCharCode(64 + Math.max(colCount, 2));
    ws.mergeCells(`A${row.number}:${lastCol}${row.number}`);
  }

  private styleHeaderRow(ws: ExcelJS.Worksheet, rowNumber: number) {
    const row = ws.getRow(rowNumber);
    row.fill = HEADER_FILL;
    row.font = HEADER_FONT;
    row.height = 18;
    row.alignment = { vertical: 'middle' };
    row.border = BORDER_THIN;
    row.commit();
  }

  private styleDataRow(row: ExcelJS.Row, idx: number) {
    row.fill = idx % 2 === 0 ? WHITE_FILL : ALT_FILL;
    row.border = BORDER_THIN;
    row.height = 16;
    row.alignment = { vertical: 'middle' };
  }

  private addAutoFilter(ws: ExcelJS.Worksheet) {
    if (!ws.lastRow) return;
    const colCount = ws.columns.length;
    if (colCount === 0) return;

    // Trouver la ligne d'en-tête (dernière ligne non-données)
    let headerRowNum = 1;
    ws.eachRow((row, rowNumber) => {
      if (row.getCell(1).font?.bold && rowNumber < ws.lastRow!.number) {
        headerRowNum = rowNumber;
      }
    });

    const lastCol = String.fromCharCode(64 + colCount);
    ws.autoFilter = `A${headerRowNum}:${lastCol}${headerRowNum}`;
  }

  private joursRestants(dateFin: Date | string): number {
    return Math.ceil((new Date(dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
}


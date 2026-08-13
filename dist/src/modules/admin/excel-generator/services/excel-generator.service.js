"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExcelGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const ExcelJS = __importStar(require("exceljs"));
const path = __importStar(require("path"));
const HEADER_FILL = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0201A' },
};
const HEADER_FONT = {
    bold: true, color: { argb: 'FFFFFFFF' }, size: 10,
};
const SUMMARY_FILL = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' },
};
const ALT_FILL = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF7F9FC' },
};
const WHITE_FILL = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFFFF' },
};
const WARNING_FILL = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF3CD' },
};
const ALERT_FILL = {
    type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' },
};
const BORDER_THIN = {
    top: { style: 'thin', color: { argb: 'FFD0D9E8' } },
    left: { style: 'thin', color: { argb: 'FFD0D9E8' } },
    bottom: { style: 'thin', color: { argb: 'FFD0D9E8' } },
    right: { style: 'thin', color: { argb: 'FFD0D9E8' } },
};
const BORDER_WARNING = {
    top: { style: 'thin', color: { argb: 'FFFFAD00' } },
    left: { style: 'medium', color: { argb: 'FFFFAD00' } },
    bottom: { style: 'thin', color: { argb: 'FFFFAD00' } },
    right: { style: 'thin', color: { argb: 'FFFFAD00' } },
};
let ExcelGeneratorService = class ExcelGeneratorService {
    async genererRapportAbsencesEtRetards(absenceLignes, retardLignes, periode, outputDir, avertissement = null, entreprise = null, salaires = []) {
        const wb = new ExcelJS.Workbook();
        this.setWorkbookMeta(wb, 'Rapport Absences & Retards');
        const nbAbsTotal = absenceLignes.length;
        const nbAbsJust = absenceLignes.filter(l => l.estJustifie).length;
        const nbAbsInjust = absenceLignes.filter(l => !l.estJustifie).length;
        const nbRetTotal = retardLignes.length;
        const nbRetJust = retardLignes.filter(l => l.estJustifie).length;
        const nbRetInjust = retardLignes.filter(l => !l.estJustifie).length;
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
        const wsSummary = wb.addWorksheet('Résumé');
        wsSummary.columns = [
            { key: 'label', width: 32 },
            { key: 'value', width: 28 },
        ];
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
        if (avertissement) {
            wsSummary.addRow([]);
            this.drawWarningRow(wsSummary, `⚠  ${avertissement}`);
        }
        wsSummary.addRow([]);
        if (user) {
            const empTitleRow = wsSummary.addRow(['Informations employé']);
            empTitleRow.font = { bold: true, size: 11, color: { argb: 'FFC0201A' } };
            wsSummary.mergeCells(`A${empTitleRow.number}:B${empTitleRow.number}`);
            const empFields = [
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
        const statsTitleRow = wsSummary.addRow(['Récapitulatif du mois']);
        statsTitleRow.font = { bold: true, size: 11, color: { argb: 'FFC0201A' } };
        wsSummary.mergeCells(`A${statsTitleRow.number}:B${statsTitleRow.number}`);
        const statsHeader = wsSummary.addRow(['Indicateur', 'Valeur']);
        statsHeader.fill = HEADER_FILL;
        statsHeader.font = HEADER_FONT;
        statsHeader.border = BORDER_THIN;
        const statsItems = [
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
            }
            else {
                row.fill = idx % 2 === 0 ? SUMMARY_FILL : WHITE_FILL;
                row.border = BORDER_THIN;
                const valCell = row.getCell(2);
                valCell.font = { bold: true };
                valCell.numFmt = '#,##0';
                if ((label.includes('injust') || label.includes('Injust')) && value > 0) {
                    valCell.font = { bold: true, color: { argb: 'FFC0201A' } };
                }
            }
        });
        wsSummary.addRow([]);
        if (salaires.length > 0) {
            const calcTitleRow = wsSummary.addRow(['Détail du calcul de la paie']);
            calcTitleRow.font = { bold: true, size: 11, color: { argb: 'FFC0201A' } };
            wsSummary.mergeCells(`A${calcTitleRow.number}:B${calcTitleRow.number}`);
            const calcHeader = wsSummary.addRow(['Libellé', 'Montant (FCFA)']);
            calcHeader.fill = HEADER_FILL;
            calcHeader.font = HEADER_FONT;
            calcHeader.border = BORDER_THIN;
            const calcItems = [
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
            const netRow = wsSummary.addRow(['SALAIRE NET À PAYER', totalNet]);
            netRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC0201A' } };
            netRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
            netRow.border = BORDER_THIN;
            netRow.height = 22;
            netRow.getCell(2).numFmt = '#,##0.00';
            const verseRow = wsSummary.addRow(['Montant versé', totalVerse]);
            verseRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
            verseRow.font = { bold: true };
            verseRow.border = BORDER_THIN;
            verseRow.getCell(2).numFmt = '#,##0.00';
        }
        const wsAbs = wb.addWorksheet('Jours Absence');
        this.drawSheetTitle(wsAbs, 'Détails de Jours Absence', avertissement);
        wsAbs.columns = [
            { header: 'Jour', key: 'date', width: 18 },
            { header: 'Justifié', key: 'estJustifie', width: 14 },
            { header: 'Statut', key: 'statut', width: 22 },
        ];
        this.styleHeaderRow(wsAbs, wsAbs.lastRow.number + 1);
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
        const wsRet = wb.addWorksheet('Jours Retard');
        this.drawSheetTitle(wsRet, 'Détails de Jours Retard', avertissement);
        wsRet.columns = [
            { header: "Jour", key: 'date', width: 18 },
            { header: "Heure d'arrivée", key: 'heureArrivee', width: 18 },
            { header: 'Justifié', key: 'estJustifie', width: 18 },
            { header: 'Statut', key: 'statut', width: 28 },
        ];
        this.styleHeaderRow(wsRet, wsRet.lastRow.number + 1);
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
        const filename = `rapport_absences_retards_${periode.replace('/', '-')}_${Date.now()}.xlsx`;
        const filepath = path.join(outputDir, filename);
        await wb.xlsx.writeFile(filepath);
        return filepath;
    }
    async genererRapportMasseSalariale(data, periode, outputDir, entreprise = null) {
        const wb = new ExcelJS.Workbook();
        this.setWorkbookMeta(wb, 'Masse Salariale');
        const { agregats, salaires } = data;
        const wsSummary = wb.addWorksheet('Résumé');
        this.drawSummarySheet(wsSummary, 'MASSE SALARIALE', periode, [
            ["Nombre d'employés", agregats.nbEmployes],
            ['Total brut (FCFA)', agregats.totalBrut],
            ['Total déductions (FCFA)', agregats.totalDeductions],
            ['Total primes (FCFA)', agregats.totalPrimes ?? 0],
            ['Total net (FCFA)', agregats.totalNet],
            ['Total versé (FCFA)', agregats.totalVerse],
        ], null, entreprise);
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
        this.styleHeaderRow(wsDetail, wsDetail.lastRow.number + 1);
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
    async genererRapportContratsCDD(contrats, periode, outputDir, entreprise = null) {
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
        this.styleHeaderRow(wsDetail, wsDetail.lastRow.number + 1);
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
            }
            else if (jours <= 15) {
                statutCell.font = { color: { argb: 'FFBA7517' }, bold: true };
            }
        });
        this.addAutoFilter(wsDetail);
        const filename = `rapport_contrats_cdd_${periode.replace('/', '-')}_${Date.now()}.xlsx`;
        const filepath = path.join(outputDir, filename);
        await wb.xlsx.writeFile(filepath);
        return filepath;
    }
    setWorkbookMeta(wb, titre) {
        wb.creator = 'Système RH';
        wb.created = new Date();
        wb.modified = new Date();
        wb.title = titre;
    }
    drawSummarySheet(ws, titre, periode, items, avertissement, entreprise = null) {
        ws.columns = [
            { key: 'label', width: 30 },
            { key: 'value', width: 20 },
        ];
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
                row.font = { bold: true, color: { argb: 'FFC0201A' } };
                row.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF5F5' } };
            }
            else {
                row.fill = idx % 2 === 0 ? SUMMARY_FILL : WHITE_FILL;
                row.border = BORDER_THIN;
                const valCell = row.getCell(2);
                valCell.font = { bold: true };
                valCell.numFmt = '#,##0';
            }
        });
    }
    drawSheetTitle(ws, titre, avertissement) {
        const titleRow = ws.addRow([titre]);
        titleRow.font = { bold: true, size: 13, color: { argb: 'FFC0201A' } };
        if (avertissement) {
            ws.addRow([]);
            this.drawWarningRow(ws, avertissement);
        }
        ws.addRow([]);
    }
    drawWarningRow(ws, message) {
        const row = ws.addRow([`⚠  ${message}`]);
        row.fill = WARNING_FILL;
        row.font = { color: { argb: 'FF856404' }, bold: true, size: 10 };
        row.border = BORDER_WARNING;
        row.height = 20;
        const colCount = ws.columns.length || 2;
        const lastCol = String.fromCharCode(64 + Math.max(colCount, 2));
        ws.mergeCells(`A${row.number}:${lastCol}${row.number}`);
    }
    styleHeaderRow(ws, rowNumber) {
        const row = ws.getRow(rowNumber);
        row.fill = HEADER_FILL;
        row.font = HEADER_FONT;
        row.height = 18;
        row.alignment = { vertical: 'middle' };
        row.border = BORDER_THIN;
        row.commit();
    }
    styleDataRow(row, idx) {
        row.fill = idx % 2 === 0 ? WHITE_FILL : ALT_FILL;
        row.border = BORDER_THIN;
        row.height = 16;
        row.alignment = { vertical: 'middle' };
    }
    addAutoFilter(ws) {
        if (!ws.lastRow)
            return;
        const colCount = ws.columns.length;
        if (colCount === 0)
            return;
        let headerRowNum = 1;
        ws.eachRow((row, rowNumber) => {
            if (row.getCell(1).font?.bold && rowNumber < ws.lastRow.number) {
                headerRowNum = rowNumber;
            }
        });
        const lastCol = String.fromCharCode(64 + colCount);
        ws.autoFilter = `A${headerRowNum}:${lastCol}${headerRowNum}`;
    }
    joursRestants(dateFin) {
        return Math.ceil((new Date(dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }
};
exports.ExcelGeneratorService = ExcelGeneratorService;
exports.ExcelGeneratorService = ExcelGeneratorService = __decorate([
    (0, common_1.Injectable)()
], ExcelGeneratorService);
//# sourceMappingURL=excel-generator.service.js.map
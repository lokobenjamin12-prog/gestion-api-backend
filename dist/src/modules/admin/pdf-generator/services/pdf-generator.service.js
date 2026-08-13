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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfGeneratorService = void 0;
const common_1 = require("@nestjs/common");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const pdfkit_1 = __importDefault(require("pdfkit"));
const C_RED = '#C0201A';
const C_DARK = '#1A1A1A';
const C_GRAY = '#F5F5F5';
const C_WHITE = '#FFFFFF';
const C_MUTED = '#AAAAAA';
const C_BORDER = '#E0E0E0';
const C_GREEN = '#2E7D32';
const C_BLUE = '#1B3A6B';
let PdfGeneratorService = class PdfGeneratorService {
    OUTPUT_DIR_FICHES = path.join(process.cwd(), 'storage', 'fiches-paie');
    constructor() {
        if (!fs.existsSync(this.OUTPUT_DIR_FICHES)) {
            fs.mkdirSync(this.OUTPUT_DIR_FICHES, { recursive: true });
        }
    }
    async genererRapportAbsencesEtRetards(absenceLignes, retardLignes, periode, outputDir, avertissement = null, entreprise = null, salaires = []) {
        const user = salaires.length > 0 ? salaires[0].user : null;
        const nomFichier = user
            ? `${user.firstName}_${user.lastName}`.replace(/\s+/g, '_')
            : 'inconnu';
        const filename = `rapport_absences_retards_${nomFichier}_${periode.replace('/', '-')}_${Date.now()}.pdf`;
        const filepath = path.join(outputDir, filename);
        const doc = new pdfkit_1.default({ margin: 0, size: 'A4' });
        const stream = fs.createWriteStream(filepath);
        const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
            .replace(/\u00a0/g, ' ')
            .replace(/\u202f/g, ' ');
        await new Promise((resolve, reject) => {
            doc.pipe(stream);
            stream.on('finish', resolve);
            stream.on('error', reject);
            const W = doc.page.width;
            const H = doc.page.height;
            const M = 40;
            doc.rect(0, 0, W, 80).fill(C_RED);
            if (entreprise?.logo && fs.existsSync(entreprise.logo)) {
                try {
                    doc.image(entreprise.logo, M, 10, { fit: [60, 60], valign: 'center' });
                }
                catch { }
            }
            const nomEntreprise = entreprise?.nom ?? '';
            doc.fillColor(C_WHITE).fontSize(15).font('Helvetica-Bold')
                .text(nomEntreprise, 110, 16, { width: 260, align: 'center' });
            if (entreprise?.adresse) {
                doc.fontSize(8).font('Helvetica').fillColor('#FFCDD2')
                    .text(entreprise.adresse, 110, 36, { width: 260, align: 'center' });
            }
            doc.moveTo(390, 12).lineTo(390, 68).lineWidth(0.5).stroke(C_WHITE).opacity(0.3);
            doc.opacity(1);
            doc.fillColor(C_WHITE).fontSize(11).font('Helvetica-Bold')
                .text('RAPPORT ABSENCES', 395, 18, { width: 160, align: 'center' });
            doc.fontSize(10).font('Helvetica-Bold')
                .text('& RETARDS', 395, 34, { width: 160, align: 'center' });
            doc.fontSize(9).font('Helvetica').fillColor('#FFCDD2')
                .text(`Période : ${periode}`, 395, 52, { width: 160, align: 'center' });
            let y = 92;
            if (avertissement) {
                doc.rect(M, y, W - M * 2, 24).fill('#FFF3E0');
                doc.fontSize(8.5).font('Helvetica').fillColor('#E65100')
                    .text(avertissement, M + 8, y + 7, { width: W - M * 2 - 16 });
                y += 32;
            }
            const user = salaires.length > 0 ? salaires[0].user : null;
            if (user) {
                doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED)
                    .text('Informations employé', M, y);
                doc.moveTo(M, y + 15).lineTo(W - M, y + 15).lineWidth(0.8).stroke(C_RED);
                y += 22;
                const infos = [
                    ['Nom complet', `${user.firstName} ${user.lastName}`],
                    ['Email professionnel', user.email ?? '—'],
                    ['Téléphone', user.phoneNumber ?? '—'],
                    ['Adresse', user.adresse ?? '—'],
                    ['Poste', user.role?.post ?? '—'],
                    ['Date de recrutement', user.dateRecrutement
                            ? new Date(user.dateRecrutement).toLocaleDateString('fr-FR') : '—'],
                    ['Période de paie', periode],
                ];
                const COL1_X = M;
                const COL2_X = M + 255;
                const ROW_H = 17;
                infos.forEach(([label, valeur], i) => {
                    const col = i % 2 === 0 ? COL1_X : COL2_X;
                    const row = Math.floor(i / 2);
                    const yy = y + row * ROW_H;
                    if (i % 2 === 0 && row % 2 === 0) {
                        doc.rect(M, yy - 2, W - M * 2, ROW_H).fill(C_GRAY);
                    }
                    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#555555')
                        .text(label, col + 4, yy + 2, { width: 110 });
                    doc.font('Helvetica').fontSize(8.5).fillColor(C_DARK)
                        .text(valeur, col + 118, yy + 2, { width: 130 });
                });
                y += Math.ceil(infos.length / 2) * ROW_H + 14;
            }
            const drawSectionTitle = (title, yy) => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED).text(title, M, yy);
                doc.moveTo(M, yy + 15).lineTo(W - M, yy + 15).lineWidth(0.8).stroke(C_RED);
                return yy + 22;
            };
            y = drawSectionTitle('Récapitulatif du mois', y);
            const nbAbsTotal = absenceLignes.length;
            const nbAbsJust = absenceLignes.filter(l => l.estJustifie).length;
            const nbAbsInjust = absenceLignes.filter(l => !l.estJustifie).length;
            const nbRetTotal = retardLignes.length;
            const nbRetJust = retardLignes.filter(l => l.estJustifie).length;
            const nbRetInjust = retardLignes.filter(l => !l.estJustifie).length;
            const BOX_W = (W - M * 2 - 10) / 3;
            const BOX_H = 42;
            const GAP = 5;
            const drawStatBox = (label, value, x, yy, alert) => {
                const bg = alert ? '#FFF5F5' : C_GRAY;
                const border = alert ? C_RED : C_BORDER;
                const color = alert ? C_RED : '#555555';
                doc.roundedRect(x, yy, BOX_W, BOX_H, 4).fillAndStroke(bg, border);
                doc.font('Helvetica-Bold').fontSize(20).fillColor(color)
                    .text(String(value), x, yy + 6, { width: BOX_W, align: 'center' });
                doc.font('Helvetica').fontSize(7.5).fillColor('#777777')
                    .text(label, x, yy + 30, { width: BOX_W, align: 'center' });
            };
            drawStatBox('Absence', nbAbsTotal, M, y, false);
            drawStatBox('Absence justifié', nbAbsJust, M + BOX_W + GAP, y, false);
            drawStatBox('Absence Injustifié', nbAbsInjust, M + (BOX_W + GAP) * 2, y, nbAbsInjust > 0);
            y += BOX_H + GAP;
            drawStatBox('Retard', nbRetTotal, M, y, false);
            drawStatBox('Retard justifié', nbRetJust, M + BOX_W + GAP, y, false);
            drawStatBox('Retard Injustifié', nbRetInjust, M + (BOX_W + GAP) * 2, y, nbRetInjust > 0);
            y += BOX_H + 16;
            const drawCheckbox = (cx, cy, checked) => {
                const SIZE = 8;
                const bx = cx - SIZE / 2;
                const by = cy - SIZE / 2;
                doc.rect(bx, by, SIZE, SIZE).lineWidth(0.8).stroke(checked ? C_GREEN : '#999999');
                if (checked) {
                    doc
                        .moveTo(bx + 1.5, by + 4)
                        .lineTo(bx + 3.5, by + 6.5)
                        .lineTo(bx + 6.5, by + 1.5)
                        .lineWidth(1.5)
                        .stroke(C_GREEN);
                }
                doc.lineWidth(0.5);
            };
            y = drawSectionTitle('Détails de Jours Absence :', y);
            {
                const COL_DAT = 300;
                const COL_EST = W - M * 2 - COL_DAT;
                const TR_H = 18;
                doc.rect(M, y, W - M * 2, TR_H).fill(C_RED);
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_WHITE);
                doc.text('Jour', M + 6, y + 5, { width: COL_DAT, align: 'center' });
                doc.text('Justifié', M + COL_DAT, y + 5, { width: COL_EST, align: 'center' });
                y += TR_H;
                if (absenceLignes.length === 0) {
                    doc.rect(M, y, W - M * 2, TR_H).fill(C_GRAY);
                    doc.font('Helvetica').fontSize(8).fillColor('#999999')
                        .text('Aucune absence enregistrée pour cette période', M, y + 5, { width: W - M * 2, align: 'center' });
                    y += TR_H;
                }
                else {
                    absenceLignes.forEach((ligne, i) => {
                        if (y + TR_H > H - 80) {
                            doc.addPage();
                            y = 40;
                        }
                        doc.rect(M, y, W - M * 2, TR_H).fill(i % 2 === 0 ? C_WHITE : C_GRAY);
                        doc.font('Helvetica').fontSize(8).fillColor(C_DARK)
                            .text(new Date(ligne.date).toLocaleDateString('fr-FR'), M + 6, y + 5, { width: COL_DAT, align: 'center' });
                        drawCheckbox(M + COL_DAT + COL_EST / 2, y + TR_H / 2, ligne.estJustifie);
                        y += TR_H;
                    });
                }
            }
            y += 14;
            y = drawSectionTitle('Détails de Jours Retard :', y);
            {
                const COL_DAT = 180;
                const COL_HRE = 150;
                const COL_EST = W - M * 2 - COL_DAT - COL_HRE;
                const TR_H = 18;
                doc.rect(M, y, W - M * 2, TR_H).fill(C_RED);
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_WHITE);
                doc.text('Jour', M + 6, y + 5, { width: COL_DAT, align: 'center' });
                doc.text("Heure d'arrivée", M + COL_DAT, y + 5, { width: COL_HRE, align: 'center' });
                doc.text('Justifié', M + COL_DAT + COL_HRE, y + 5, { width: COL_EST, align: 'center' });
                y += TR_H;
                if (retardLignes.length === 0) {
                    doc.rect(M, y, W - M * 2, TR_H).fill(C_GRAY);
                    doc.font('Helvetica').fontSize(8).fillColor('#999999')
                        .text('Aucun retard enregistré pour cette période', M, y + 5, { width: W - M * 2, align: 'center' });
                    y += TR_H;
                }
                else {
                    retardLignes.forEach((ligne, i) => {
                        if (y + TR_H > H - 80) {
                            doc.addPage();
                            y = 40;
                        }
                        doc.rect(M, y, W - M * 2, TR_H).fill(i % 2 === 0 ? C_WHITE : C_GRAY);
                        doc.font('Helvetica').fontSize(8).fillColor(C_DARK)
                            .text(new Date(ligne.date).toLocaleDateString('fr-FR'), M + 6, y + 5, { width: COL_DAT, align: 'center' });
                        doc.fillColor(ligne.estJustifie ? C_DARK : C_RED)
                            .text(ligne.heureArrivee ?? '—', M + COL_DAT, y + 5, { width: COL_HRE, align: 'center' });
                        drawCheckbox(M + COL_DAT + COL_HRE + COL_EST / 2, y + TR_H / 2, ligne.estJustifie);
                        y += TR_H;
                    });
                }
            }
            y += 14;
            if (salaires && salaires.length > 0) {
                y = drawSectionTitle('Détail du calcul de la paie', y);
                const COL_LIB_W = W - M * 2 - 140;
                const COL_MNT_W = 140;
                const TR_H = 16;
                doc.rect(M, y, W - M * 2, TR_H + 2).fill(C_RED);
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_WHITE)
                    .text('Libellé', M + 6, y + 4, { width: COL_LIB_W });
                doc.text('Montant', M + COL_LIB_W, y + 4, { width: COL_MNT_W, align: 'right' });
                y += TR_H + 2;
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
                const calcRows = [
                    { libelle: 'Salaire brut de base', montant: `${fmt(totalBrut)} FCFA`, plus: true },
                    { libelle: `Déduction retards injustifiés (${nbRetInjustTotal} jour(s))`, montant: `- ${fmt(totalDedRetards)} FCFA`, plus: false },
                    { libelle: `Déduction absences injustifiées (${nbAbsInjustTotal} jour(s))`, montant: `- ${fmt(totalDedAbs)} FCFA`, plus: false },
                    { libelle: 'Primes', montant: `+ ${fmt(totalPrimes)} FCFA`, plus: true },
                ];
                calcRows.forEach((r, i) => {
                    if (y + TR_H > H - 80) {
                        doc.addPage();
                        y = 40;
                    }
                    doc.rect(M, y, W - M * 2, TR_H).fill(i % 2 === 0 ? C_WHITE : C_GRAY);
                    doc.font('Helvetica').fontSize(8).fillColor(C_DARK)
                        .text(r.libelle, M + 6, y + 4, { width: COL_LIB_W - 6 });
                    doc.font('Helvetica-Bold').fontSize(8).fillColor(r.plus ? C_GREEN : C_RED)
                        .text(r.montant, M + COL_LIB_W, y + 4, { width: COL_MNT_W - 6, align: 'right' });
                    y += TR_H;
                });
                doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.5).stroke(C_BORDER);
                y += 8;
                if (y + 30 > H - 80) {
                    doc.addPage();
                    y = 40;
                }
                doc.rect(M, y, W - M * 2, 30).fill(C_RED);
                doc.font('Helvetica-Bold').fontSize(11).fillColor(C_WHITE)
                    .text('SALAIRE NET À PAYER', M + 8, y + 10);
                doc.text(`${fmt(totalNet)} FCFA`, M + 8, y + 10, { align: 'right', width: W - M * 2 - 16 });
                y += 32;
                doc.rect(M, y, W - M * 2, 22).fill(C_GRAY);
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_DARK)
                    .text('Montant versé', M + 8, y + 7);
                doc.font('Helvetica').fontSize(8.5).fillColor(C_DARK)
                    .text(`${fmt(totalVerse)} FCFA`, M + 8, y + 7, { align: 'right', width: W - M * 2 - 16 });
                y += 26;
                if (y + 50 < H - 40) {
                    doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#444444')
                        .text("Signature de l'employé :", M, y + 8);
                    doc.moveTo(250, y + 28).lineTo(W - M, y + 28).lineWidth(0.8).stroke(C_DARK);
                    doc.font('Helvetica').fontSize(7.5).fillColor(C_MUTED)
                        .text('Date : _____ / _____ / _________', 250, y + 32);
                }
            }
            const FOOTER_Y = H - 28;
            doc.rect(0, FOOTER_Y, W, 28).fill(C_RED);
            doc.font('Helvetica').fontSize(7.5).fillColor('#FFCDD2')
                .text(`${nomEntreprise || 'Document confidentiel'} — ${new Date().getFullYear()}`, 0, FOOTER_Y + 10, { width: W, align: 'center' });
            doc.end();
        });
        return filepath;
    }
    async genererRapportMasseSalariale(data, periode, outputDir, entreprise = null) {
        const filename = `rapport_masse_salariale_${periode.replace('/', '-')}_${Date.now()}.pdf`;
        const filepath = path.join(outputDir, filename);
        const doc = new pdfkit_1.default({ margin: 0, size: 'A4' });
        const stream = fs.createWriteStream(filepath);
        const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
            .replace(/\u00a0/g, ' ')
            .replace(/\u202f/g, ' ');
        await new Promise((resolve, reject) => {
            doc.pipe(stream);
            stream.on('finish', resolve);
            stream.on('error', reject);
            const W = doc.page.width;
            const H = doc.page.height;
            const M = 40;
            doc.rect(0, 0, W, 80).fill(C_RED);
            if (entreprise?.logo && fs.existsSync(entreprise.logo)) {
                try {
                    doc.image(entreprise.logo, M, 10, { fit: [60, 60], valign: 'center' });
                }
                catch { }
            }
            const nomEntreprise = entreprise?.nom ?? '';
            doc.fillColor(C_WHITE).fontSize(15).font('Helvetica-Bold')
                .text(nomEntreprise, 110, 14, { width: 260, align: 'center' });
            if (entreprise?.adresse) {
                doc.fontSize(8).font('Helvetica').fillColor('#FFCDD2')
                    .text(entreprise.adresse, 110, 32, { width: 260, align: 'center' });
            }
            const contact = [entreprise?.telephone, entreprise?.email].filter(Boolean).join('  |  ');
            if (contact) {
                doc.fontSize(7.5).fillColor('#FFCDD2')
                    .text(contact, 110, 44, { width: 260, align: 'center' });
            }
            doc.moveTo(390, 10).lineTo(390, 70).lineWidth(0.5).stroke(C_WHITE).opacity(0.3);
            doc.opacity(1);
            doc.fillColor(C_WHITE).fontSize(11).font('Helvetica-Bold')
                .text('RAPPORT', 395, 18, { width: 160, align: 'center' });
            doc.fontSize(10).font('Helvetica-Bold')
                .text('MASSE SALARIALE', 395, 33, { width: 160, align: 'center' });
            doc.fontSize(8).font('Helvetica').fillColor('#FFCDD2')
                .text(`Période : ${periode}`, 395, 50, { width: 160, align: 'center' });
            doc.fontSize(7).fillColor('#FFCDD2')
                .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 395, 62, { width: 160, align: 'center' });
            let y = 92;
            const drawSectionTitle = (title, yy) => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED).text(title, M, yy);
                doc.moveTo(M, yy + 15).lineTo(W - M, yy + 15).lineWidth(0.8).stroke(C_RED);
                return yy + 22;
            };
            y = drawSectionTitle('Récapitulatif', y);
            const { agregats } = data;
            const BOX_W = (W - M * 2 - 10) / 3;
            const BOX_H = 50;
            const GAP = 5;
            const drawSummaryBox = (label, value, x, yy, color = '#555555') => {
                doc.roundedRect(x, yy, BOX_W, BOX_H, 4).fillAndStroke(C_GRAY, C_BORDER);
                doc.font('Helvetica-Bold').fontSize(13).fillColor(color)
                    .text(value, x + 4, yy + 8, { width: BOX_W - 8, align: 'center' });
                doc.font('Helvetica').fontSize(7.5).fillColor('#777777')
                    .text(label, x + 4, yy + 34, { width: BOX_W - 8, align: 'center' });
            };
            drawSummaryBox('Employés', String(agregats.nbEmployes), M, y);
            drawSummaryBox('Total brut (FCFA)', `${fmt(Number(agregats.totalBrut))} FCFA`, M + BOX_W + GAP, y, C_DARK);
            drawSummaryBox('Déductions (FCFA)', `${fmt(Number(agregats.totalDeductions))} FCFA`, M + (BOX_W + GAP) * 2, y, C_RED);
            y += BOX_H + GAP;
            drawSummaryBox('Primes (FCFA)', `${fmt(Number(agregats.totalPrimes ?? 0))} FCFA`, M, y, C_GREEN);
            drawSummaryBox('Total net (FCFA)', `${fmt(Number(agregats.totalNet))} FCFA`, M + BOX_W + GAP, y, C_DARK);
            drawSummaryBox('Total versé (FCFA)', `${fmt(Number(agregats.totalVerse))} FCFA`, M + (BOX_W + GAP) * 2, y, C_DARK);
            y += BOX_H + 18;
            if (data.avertissement) {
                doc.rect(M, y, W - M * 2, 22).fill('#FFF3E0');
                doc.rect(M, y, 4, 22).fill('#FF9800');
                doc.font('Helvetica-Bold').fontSize(8).fillColor('#E65100')
                    .text(`⚠️  ${data.avertissement}`, M + 10, y + 7, { width: W - M * 2 - 14 });
                y += 30;
            }
            y = drawSectionTitle('Détail par employé', y);
            const cols = [
                { header: 'Employé', key: 'employe', w: 120 },
                { header: 'Brut', key: 'brut', w: 72 },
                { header: 'Déductions', key: 'deductions', w: 72 },
                { header: 'Primes', key: 'primes', w: 60 },
                { header: 'Net', key: 'net', w: 72 },
                { header: 'Versé', key: 'verse', w: 72 },
                { header: 'Écart', key: 'ecart', w: 47 },
            ];
            const TR_H = 18;
            const HDR_H = 20;
            const totalW = cols.reduce((s, c) => s + c.w, 0);
            doc.rect(M, y, totalW, HDR_H).fill(C_RED);
            let cx = M;
            cols.forEach(col => {
                doc.font('Helvetica-Bold').fontSize(8).fillColor(C_WHITE)
                    .text(col.header, cx + 3, y + 6, { width: col.w - 6, align: 'center' });
                cx += col.w;
            });
            y += HDR_H;
            data.salaires.forEach((s, i) => {
                if (y + TR_H > H - 40) {
                    doc.addPage();
                    y = 40;
                }
                const ecart = s.ecart ? Number(s.ecart) : 0;
                const rows = {
                    employe: `${s.user?.firstName ?? ''} ${s.user?.lastName ?? ''}`.trim(),
                    brut: `${fmt(Number(s.salaireBrut))}`,
                    deductions: `${fmt(Number(s.totalDeductions))}`,
                    primes: `${fmt(Number(s.totalPrimes ?? 0))}`,
                    net: `${fmt(Number(s.salaireNet))}`,
                    verse: s.montantVerse ? `${fmt(Number(s.montantVerse))}` : '—',
                    ecart: `${ecart >= 0 ? '+' : ''}${fmt(ecart)}`,
                };
                doc.rect(M, y, totalW, TR_H).fill(i % 2 === 0 ? C_WHITE : C_GRAY);
                cx = M;
                cols.forEach(col => {
                    let color = C_DARK;
                    if (col.key === 'deductions')
                        color = C_RED;
                    if (col.key === 'net')
                        color = C_DARK;
                    if (col.key === 'ecart')
                        color = ecart >= 0 ? C_GREEN : C_RED;
                    const align = col.key === 'employe' ? 'left' : 'center';
                    const xOff = col.key === 'employe' ? 5 : 0;
                    doc.font(col.key === 'net' ? 'Helvetica-Bold' : 'Helvetica')
                        .fontSize(7.5).fillColor(color)
                        .text(rows[col.key], cx + xOff, y + 5, { width: col.w - 6, align });
                    cx += col.w;
                });
                doc.moveTo(M, y + TR_H).lineTo(M + totalW, y + TR_H)
                    .lineWidth(0.3).stroke(C_BORDER);
                y += TR_H;
            });
            if (y + TR_H <= H - 40) {
                doc.rect(M, y, totalW, TR_H).fill('#F0F0F0');
                doc.font('Helvetica-Bold').fontSize(8).fillColor(C_DARK)
                    .text('TOTAL', M + 5, y + 5, { width: cols[0].w - 6 });
                const totalCols = [
                    [cols[0].w, `${fmt(Number(agregats.totalBrut))}`, C_DARK],
                    [cols[0].w + cols[1].w, `${fmt(Number(agregats.totalDeductions))}`, C_RED],
                    [cols[0].w + cols[1].w + cols[2].w, `${fmt(Number(agregats.totalPrimes ?? 0))}`, C_GREEN],
                    [cols[0].w + cols[1].w + cols[2].w + cols[3].w, `${fmt(Number(agregats.totalNet))}`, C_DARK],
                    [cols[0].w + cols[1].w + cols[2].w + cols[3].w + cols[4].w, `${fmt(Number(agregats.totalVerse))}`, C_DARK],
                ];
                totalCols.forEach(([offset, val, color]) => {
                    doc.font('Helvetica-Bold').fontSize(7.5).fillColor(color)
                        .text(val, M + offset + 3, y + 5, { width: cols[1].w - 6, align: 'center' });
                });
                y += TR_H;
            }
            const FOOTER_Y = H - 28;
            doc.rect(0, FOOTER_Y, W, 28).fill(C_RED);
            doc.font('Helvetica').fontSize(7.5).fillColor('#FFCDD2')
                .text(`${nomEntreprise || 'Document confidentiel'} — ${new Date().getFullYear()}`, 0, FOOTER_Y + 10, { width: W, align: 'center' });
            doc.end();
        });
        return filepath;
    }
    async genererRapportContratsCDD(contrats, periode, outputDir, entreprise = null) {
        const filename = `rapport_contrats_cdd_${periode.replace('/', '-')}_${Date.now()}.pdf`;
        const filepath = path.join(outputDir, filename);
        const doc = new pdfkit_1.default({ margin: 0, size: 'A4' });
        const stream = fs.createWriteStream(filepath);
        await new Promise((resolve, reject) => {
            doc.pipe(stream);
            stream.on('finish', resolve);
            stream.on('error', reject);
            const W = doc.page.width;
            const H = doc.page.height;
            const M = 40;
            doc.rect(0, 0, W, 80).fill(C_RED);
            if (entreprise?.logo && fs.existsSync(entreprise.logo)) {
                try {
                    doc.image(entreprise.logo, M, 10, { fit: [60, 60], valign: 'center' });
                }
                catch { }
            }
            const nomEntreprise = entreprise?.nom ?? '';
            doc.fillColor(C_WHITE).fontSize(15).font('Helvetica-Bold')
                .text(nomEntreprise, 110, 14, { width: 260, align: 'center' });
            if (entreprise?.adresse) {
                doc.fontSize(8).font('Helvetica').fillColor('#FFCDD2')
                    .text(entreprise.adresse, 110, 32, { width: 260, align: 'center' });
            }
            const contact = [entreprise?.telephone, entreprise?.email].filter(Boolean).join('  |  ');
            if (contact) {
                doc.fontSize(7.5).fillColor('#FFCDD2')
                    .text(contact, 110, 44, { width: 260, align: 'center' });
            }
            doc.moveTo(390, 10).lineTo(390, 70).lineWidth(0.5).stroke(C_WHITE).opacity(0.3);
            doc.opacity(1);
            doc.fillColor(C_WHITE).fontSize(11).font('Helvetica-Bold')
                .text('CONTRATS CDD', 395, 18, { width: 160, align: 'center' });
            doc.fontSize(10).font('Helvetica-Bold')
                .text('EXPIRATIONS', 395, 34, { width: 160, align: 'center' });
            doc.fontSize(8).font('Helvetica').fillColor('#FFCDD2')
                .text(`Période : ${periode}`, 395, 52, { width: 160, align: 'center' });
            doc.fontSize(7).fillColor('#FFCDD2')
                .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 395, 62, { width: 160, align: 'center' });
            let y = 92;
            const drawSectionTitle = (title, yy) => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED).text(title, M, yy);
                doc.moveTo(M, yy + 15).lineTo(W - M, yy + 15).lineWidth(0.8).stroke(C_RED);
                return yy + 22;
            };
            y = drawSectionTitle('Récapitulatif', y);
            const urgents = contrats.filter(c => this.joursRestants(c.dateFin) <= 7).length;
            const proches = contrats.filter(c => this.joursRestants(c.dateFin) <= 30).length;
            const BOX_W = (W - M * 2 - 10) / 3;
            const BOX_H = 50;
            const GAP = 5;
            const drawBox = (label, value, x, yy, alert) => {
                const bg = alert && value > 0 ? '#FFF5F5' : C_GRAY;
                const border = alert && value > 0 ? C_RED : C_BORDER;
                const color = alert && value > 0 ? C_RED : '#555555';
                doc.roundedRect(x, yy, BOX_W, BOX_H, 4).fillAndStroke(bg, border);
                doc.font('Helvetica-Bold').fontSize(22).fillColor(color)
                    .text(String(value), x + 4, yy + 8, { width: BOX_W - 8, align: 'center' });
                doc.font('Helvetica').fontSize(7.5).fillColor('#777777')
                    .text(label, x + 4, yy + 34, { width: BOX_W - 8, align: 'center' });
            };
            drawBox('CDD à surveiller', contrats.length, M, y, false);
            drawBox('Expirant < 7j', urgents, M + BOX_W + GAP, y, true);
            drawBox('Expirant < 30j', proches, M + (BOX_W + GAP) * 2, y, true);
            y += BOX_H + 18;
            y = drawSectionTitle('CDD expirant prochainement', y);
            const cols = [
                { header: 'Employé', key: 'employe', w: 150 },
                { header: 'Début', key: 'debut', w: 80 },
                { header: 'Fin', key: 'fin', w: 80 },
                { header: 'Jours rest.', key: 'jours', w: 65 },
                { header: 'Alertes', key: 'alertes', w: 65 },
                { header: 'Statut', key: 'statut', w: 75 },
            ];
            const totalW = cols.reduce((s, c) => s + c.w, 0);
            const TR_H = 18;
            const HDR_H = 20;
            doc.rect(M, y, totalW, HDR_H).fill(C_RED);
            let cx = M;
            cols.forEach(col => {
                doc.font('Helvetica-Bold').fontSize(8).fillColor(C_WHITE)
                    .text(col.header, cx + 3, y + 6, { width: col.w - 6, align: 'center' });
                cx += col.w;
            });
            y += HDR_H;
            if (contrats.length === 0) {
                doc.rect(M, y, totalW, TR_H).fill(C_GRAY);
                doc.font('Helvetica').fontSize(8).fillColor('#999999')
                    .text('Aucun contrat CDD expirant dans cette période', M, y + 5, { width: totalW, align: 'center' });
                y += TR_H;
            }
            else {
                contrats.forEach((c, i) => {
                    if (y + TR_H > H - 40) {
                        doc.addPage();
                        y = 40;
                    }
                    const jours = this.joursRestants(c.dateFin);
                    const statut = jours <= 7 ? 'URGENT' : jours <= 15 ? 'ATTENTION' : 'À surveiller';
                    const bg = jours <= 7 ? '#FFF5F5' : i % 2 === 0 ? C_WHITE : C_GRAY;
                    doc.rect(M, y, totalW, TR_H).fill(bg);
                    const statutColor = jours <= 7 ? C_RED
                        : jours <= 15 ? '#BA7517'
                            : C_DARK;
                    const rows = {
                        employe: { text: `${c.user?.firstName ?? ''} ${c.user?.lastName ?? ''}`.trim(), color: C_DARK },
                        debut: { text: new Date(c.dateDebut).toLocaleDateString('fr-FR'), color: C_DARK },
                        fin: { text: c.dateFin ? new Date(c.dateFin).toLocaleDateString('fr-FR') : '—', color: jours <= 30 ? C_RED : C_DARK },
                        jours: { text: String(jours), color: jours <= 7 ? C_RED : C_DARK, bold: jours <= 7 },
                        alertes: { text: `${c.alertes?.length ?? 0} envoyée(s)`, color: C_DARK },
                        statut: { text: statut, color: statutColor, bold: jours <= 15 },
                    };
                    cx = M;
                    cols.forEach(col => {
                        const cell = rows[col.key];
                        doc
                            .font(cell.bold ? 'Helvetica-Bold' : 'Helvetica')
                            .fontSize(7.5)
                            .fillColor(cell.color)
                            .text(cell.text, cx + 3, y + 5, { width: col.w - 6, align: col.key === 'employe' ? 'left' : 'center' });
                        cx += col.w;
                    });
                    doc.moveTo(M, y + TR_H).lineTo(M + totalW, y + TR_H).lineWidth(0.3).stroke(C_BORDER);
                    y += TR_H;
                });
            }
            const FOOTER_Y = H - 28;
            doc.rect(0, FOOTER_Y, W, 28).fill(C_RED);
            doc.font('Helvetica').fontSize(7.5).fillColor('#FFCDD2')
                .text(`${nomEntreprise || 'Document confidentiel'} — ${new Date().getFullYear()}`, 0, FOOTER_Y + 10, { width: W, align: 'center' });
            doc.end();
        });
        return filepath;
    }
    async genererFichePaie(salaire, entreprise, outputDir) {
        const user = salaire.user;
        const codeMois = String(salaire.mois).padStart(2, '0');
        const periode = `${codeMois}/${salaire.annee}`;
        const nomEmploye = `${user.firstName}_${user.lastName}`.replace(/\s+/g, '_');
        const filename = `fiche_paie_${nomEmploye}_${codeMois}-${salaire.annee}.pdf`;
        const filepath = path.join(outputDir, filename);
        const fmt = (n) => n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
            .replace(/\u00a0/g, ' ')
            .replace(/\u202f/g, ' ');
        const doc = new pdfkit_1.default({ margin: 0, size: 'A4' });
        const stream = fs.createWriteStream(filepath);
        await new Promise((resolve, reject) => {
            doc.pipe(stream);
            stream.on('finish', resolve);
            stream.on('error', reject);
            const W = doc.page.width;
            const H = doc.page.height;
            const M = 40;
            doc.rect(0, 0, W, 80).fill(C_RED);
            if (entreprise?.logo && fs.existsSync(entreprise.logo)) {
                try {
                    doc.image(entreprise.logo, M, 10, { fit: [60, 60], valign: 'center' });
                }
                catch { }
            }
            const nomEntreprise = entreprise?.nom ?? 'Mon Entreprise';
            doc.fillColor(C_WHITE).fontSize(15).font('Helvetica-Bold')
                .text(nomEntreprise, 110, 16, { width: 260, align: 'center' });
            if (entreprise?.adresse) {
                doc.fontSize(8).font('Helvetica').fillColor('#FFCDD2')
                    .text(entreprise.adresse, 110, 36, { width: 260, align: 'center' });
            }
            doc.moveTo(390, 12).lineTo(390, 68).stroke(C_WHITE).opacity(0.3);
            doc.opacity(1);
            doc.fillColor(C_WHITE).fontSize(12).font('Helvetica-Bold')
                .text('FICHE DE PAIE', 395, 18, { width: 160, align: 'center' });
            doc.fontSize(9).font('Helvetica').fillColor('#FFCDD2')
                .text(`Période : ${periode}`, 395, 38, { width: 160, align: 'center' });
            doc.fontSize(7.5)
                .text(`Générée le ${new Date().toLocaleDateString('fr-FR')}`, 395, 54, { width: 160, align: 'center' });
            let y = 98;
            const drawSectionTitle = (title, yy) => {
                doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED).text(title, M, yy);
                doc.moveTo(M, yy + 15).lineTo(W - M, yy + 15).lineWidth(0.8).stroke(C_RED);
                return yy + 22;
            };
            y = drawSectionTitle('Informations employé', y);
            const infos = [
                ['Nom complet', `${user.firstName} ${user.lastName}`],
                ['Email', user.email ?? '—'],
                ['Téléphone', user.phoneNumber ?? '—'],
                ['Adresse', user.adresse ?? '—'],
                ['Poste', user.role?.post ?? '—'],
                ['Date de recrutement', user.dateRecrutement
                        ? new Date(user.dateRecrutement).toLocaleDateString('fr-FR') : '—'],
                ['Période de paie', periode],
                ['Date de paiement', new Date(salaire.jourDePaie).toLocaleDateString('fr-FR')],
            ];
            const COL1_X = M;
            const COL2_X = M + 230;
            const ROW_H = 17;
            infos.forEach(([label, valeur], i) => {
                const col = i % 2 === 0 ? COL1_X : COL2_X;
                const row = Math.floor(i / 2);
                const yy = y + row * ROW_H;
                if (i % 2 === 0 && row % 2 === 0) {
                    doc.rect(M, yy - 2, W - M * 2, ROW_H).fill(C_GRAY);
                }
                doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#555555')
                    .text(label, col + 4, yy + 2, { width: 100 });
                doc.font('Helvetica').fontSize(8.5).fillColor(C_DARK)
                    .text(valeur, col + 110, yy + 2, { width: 115 });
            });
            y = y + Math.ceil(infos.length / 2) * ROW_H + 14;
            y = drawSectionTitle('Détail du calcul de la paie', y);
            const COL_LIB_W = W - M * 2 - 130;
            const COL_MNT_W = 130;
            const TR_H = 16;
            doc.rect(M, y, W - M * 2, TR_H + 2).fill(C_RED);
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_WHITE)
                .text('Libellé', M + 6, y + 4, { width: COL_LIB_W });
            doc.text('Montant', M + COL_LIB_W, y + 4, { width: COL_MNT_W, align: 'right' });
            y += TR_H + 2;
            const calcRows = [
                {
                    libelle: 'Salaire brut de base',
                    montant: `${fmt(Number(salaire.salaireBrut))} FCFA`,
                    plus: true,
                },
                {
                    libelle: `Déduction retards injustifiés (${salaire.nbRetardsInjust ?? 0} jour(s))`,
                    montant: `- ${fmt(Number(salaire.deductionRetards ?? 0))} FCFA`,
                    plus: false,
                },
                {
                    libelle: `Déduction absences injustifiées (${salaire.nbAbsInjust ?? 0} jour(s))`,
                    montant: `- ${fmt(Number(salaire.deductionAbs ?? 0))} FCFA`,
                    plus: false,
                },
            ];
            const primes = (salaire.primes ?? []);
            primes.forEach(p => {
                calcRows.push({
                    libelle: `Prime — ${p.raison}`,
                    montant: `+ ${fmt(Number(p.somme))} FCFA`,
                    plus: true,
                });
            });
            calcRows.forEach((r, i) => {
                doc.rect(M, y, W - M * 2, TR_H).fill(i % 2 === 0 ? C_WHITE : C_GRAY);
                doc.font('Helvetica').fontSize(8).fillColor(C_DARK)
                    .text(r.libelle, M + 6, y + 4, { width: COL_LIB_W - 6 });
                doc.font('Helvetica-Bold').fontSize(8).fillColor(r.plus ? C_GREEN : C_RED)
                    .text(r.montant, M + COL_LIB_W, y + 4, { width: COL_MNT_W - 6, align: 'right' });
                y += TR_H;
            });
            doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.5).stroke(C_BORDER);
            y += 10;
            doc.rect(M, y, W - M * 2, 30).fill(C_RED);
            doc.font('Helvetica-Bold').fontSize(11).fillColor(C_WHITE)
                .text('SALAIRE NET À PAYER', M + 8, y + 10);
            doc.text(`${fmt(Number(salaire.salaireNet))} FCFA`, M + 8, y + 10, { align: 'right', width: W - M * 2 - 16 });
            y += 32;
            doc.rect(M, y, W - M * 2, 22).fill(C_GRAY);
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_DARK)
                .text('Montant versé', M + 8, y + 7);
            doc.font('Helvetica').fontSize(8.5).fillColor(C_DARK)
                .text(`${fmt(Number(salaire.montantVerse ?? salaire.salaireNet))} FCFA`, M + 8, y + 7, { align: 'right', width: W - M * 2 - 16 });
            y += 26;
            doc.font('Helvetica').fontSize(8).fillColor('#444444')
                .text(`Je soussigné(e) ${user.firstName} ${user.lastName} certifie avoir reçu ` +
                `la somme de ${fmt(Number(salaire.montantVerse ?? salaire.salaireNet))} FCFA ` +
                `correspondant à ma rémunération du mois de ${periode}.`, M, y + 6, { width: W - M * 2 });
            y += 28;
            doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#444444')
                .text("Signature de l'employé :", M, y + 8);
            doc.moveTo(250, y + 28).lineTo(W - M, y + 28).lineWidth(0.8).stroke(C_DARK);
            doc.font('Helvetica').fontSize(7.5).fillColor(C_MUTED)
                .text('Date : _____ / _____ / _________', 250, y + 32);
            const FOOTER_Y = H - 28;
            doc.rect(0, FOOTER_Y, W, 28).fill(C_RED);
            doc.font('Helvetica').fontSize(7.5).fillColor('#FFCDD2')
                .text(`${nomEntreprise} — Document confidentiel — ${new Date().getFullYear()}`, 0, FOOTER_Y + 10, { width: W, align: 'center' });
            doc.end();
        });
        return filepath;
    }
    joursRestants(dateFin) {
        return Math.ceil((new Date(dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    }
};
exports.PdfGeneratorService = PdfGeneratorService;
exports.PdfGeneratorService = PdfGeneratorService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], PdfGeneratorService);
//# sourceMappingURL=pdf-generator.service.js.map
// src/modules/pdf-generator/services/pdf-generator.service.ts
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import PDFDocument from 'pdfkit';


// ── Interfaces mises à jour ───────────────────────────────────────────────────
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
  heureArrivee?: string; // ← nouveau
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


// ── Palette de couleurs partagée ──────────────────────────────────────────────
const C_RED = '#C0201A';
const C_DARK = '#1A1A1A';
const C_GRAY = '#F5F5F5';
const C_WHITE = '#FFFFFF';
const C_MUTED = '#AAAAAA';
const C_BORDER = '#E0E0E0';
const C_GREEN = '#2E7D32';
const C_BLUE = '#1B3A6B';

@Injectable()
export class PdfGeneratorService {

  readonly OUTPUT_DIR_FICHES = path.join(process.cwd(), 'storage', 'fiches-paie');

  constructor() {
    if (!fs.existsSync(this.OUTPUT_DIR_FICHES)) {
      fs.mkdirSync(this.OUTPUT_DIR_FICHES, { recursive: true });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HELPER PRIVÉ — En-tête avec infos entreprise (partagé par tous les rapports)
  // ══════════════════════════════════════════════════════════════════════════

  // ══════════════════════════════════════════════════════════════════════════
  // RAPPORT ABSENCES & RETARDS
  // ══════════════════════════════════════════════════════════════════════════

  async genererRapportAbsencesEtRetards(
    absenceLignes: LigneAbsence[],
    retardLignes: LigneRetard[],
    periode: string,
    outputDir: string,
    avertissement: string | null = null,
    entreprise: any = null,
    salaires: any[] = [],
  ): Promise<string> {


    // APRÈS
    const user = salaires.length > 0 ? salaires[0].user : null;
    const nomFichier = user
      ? `${user.firstName}_${user.lastName}`.replace(/\s+/g, '_')
      : 'inconnu';

    const filename = `rapport_absences_retards_${nomFichier}_${periode.replace('/', '-')}_${Date.now()}.pdf`;
    const filepath = path.join(outputDir, filename);

    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const stream = fs.createWriteStream(filepath);

    const fmt = (n: number): string =>
      n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        .replace(/\u00a0/g, ' ')
        .replace(/\u202f/g, ' ');

    await new Promise<void>((resolve, reject) => {
      doc.pipe(stream);
      stream.on('finish', resolve);
      stream.on('error', reject);

      const W = doc.page.width;
      const H = doc.page.height;
      const M = 40;

      // ── EN-TÊTE ──────────────────────────────────────────────────────────────
      doc.rect(0, 0, W, 80).fill(C_RED);

      if (entreprise?.logo && fs.existsSync(entreprise.logo)) {
        try { doc.image(entreprise.logo, M, 10, { fit: [60, 60], valign: 'center' }); } catch { /* logo illisible */ }
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

      // ── BANNIÈRE AVERTISSEMENT ────────────────────────────────────────────────
      if (avertissement) {
        doc.rect(M, y, W - M * 2, 24).fill('#FFF3E0');
        doc.fontSize(8.5).font('Helvetica').fillColor('#E65100')
          .text(avertissement, M + 8, y + 7, { width: W - M * 2 - 16 });
        y += 32;
      }

      // ── SECTION : INFORMATIONS EMPLOYÉ ────────────────────────────────────────
      const user = salaires.length > 0 ? salaires[0].user : null;

      if (user) {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED)
          .text('Informations employé', M, y);
        doc.moveTo(M, y + 15).lineTo(W - M, y + 15).lineWidth(0.8).stroke(C_RED);
        y += 22;

        const infos: [string, string][] = [
          ['Nom complet', `${user.firstName} ${user.lastName}`],
          ['Email professionnel', user.email ?? '—'],
          ['Téléphone', user.phoneNumber ?? '—'],
          ['Adresse', user.adresse ?? '—'],
          ['Poste', user.role?.post ?? '—'],
          ['Date de recrutement', user.dateRecrutement
            ? new Date(user.dateRecrutement).toLocaleDateString('fr-FR') : '—'],
          ['Période de paie', periode],

          // ['Date de clôture', salaires[0]?.dateCloture
          //   ? new Date(salaires[0].dateCloture).toLocaleDateString('fr-FR') : '—'],
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

      // ── HELPER : titre de section ─────────────────────────────────────────────
      const drawSectionTitle = (title: string, yy: number): number => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED).text(title, M, yy);
        doc.moveTo(M, yy + 15).lineTo(W - M, yy + 15).lineWidth(0.8).stroke(C_RED);
        return yy + 22;
      };

      // ── RÉCAPITULATIF DU MOIS — 6 boîtes ────────────────────────────────────
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

      const drawStatBox = (label: string, value: number, x: number, yy: number, alert: boolean) => {
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


      // ── Helper checkbox — à placer AVANT les tables dans votre fonction ───────────
      const drawCheckbox = (cx: number, cy: number, checked: boolean) => {
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
        doc.lineWidth(0.5); // remettre la valeur par défaut
      };

      // ── TABLE ABSENCES — sans colonne Employé ────────────────────────────────────
      y = drawSectionTitle('Détails de Jours Absence :', y);
      {
        const COL_DAT = 300;
        const COL_EST = W - M * 2 - COL_DAT;
        const TR_H = 18; // légèrement plus haut pour la checkbox

        // En-tête
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
        } else {
          absenceLignes.forEach((ligne, i) => {
            if (y + TR_H > H - 80) { doc.addPage(); y = 40; }
            doc.rect(M, y, W - M * 2, TR_H).fill(i % 2 === 0 ? C_WHITE : C_GRAY);

            // Date
            doc.font('Helvetica').fontSize(8).fillColor(C_DARK)
              .text(new Date(ligne.date).toLocaleDateString('fr-FR'), M + 6, y + 5, { width: COL_DAT, align: 'center' });

            // ← Checkbox au lieu de OUI/NON
            drawCheckbox(M + COL_DAT + COL_EST / 2, y + TR_H / 2, ligne.estJustifie);

            y += TR_H;
          });
        }
      }

      y += 14;

      // ── TABLE RETARDS — sans colonne Employé ─────────────────────────────────────
      y = drawSectionTitle('Détails de Jours Retard :', y);
      {
        const COL_DAT = 180;
        const COL_HRE = 150;
        const COL_EST = W - M * 2 - COL_DAT - COL_HRE;
        const TR_H = 18;

        // En-tête
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
        } else {
          retardLignes.forEach((ligne, i) => {
            if (y + TR_H > H - 80) { doc.addPage(); y = 40; }
            doc.rect(M, y, W - M * 2, TR_H).fill(i % 2 === 0 ? C_WHITE : C_GRAY);

            // Date
            doc.font('Helvetica').fontSize(8).fillColor(C_DARK)
              .text(new Date(ligne.date).toLocaleDateString('fr-FR'), M + 6, y + 5, { width: COL_DAT, align: 'center' });

            // Heure d'arrivée — rouge si injustifié
            doc.fillColor(ligne.estJustifie ? C_DARK : C_RED)
              .text(ligne.heureArrivee ?? '—', M + COL_DAT, y + 5, { width: COL_HRE, align: 'center' });

            // ← Checkbox au lieu de OUI/NON
            drawCheckbox(M + COL_DAT + COL_HRE + COL_EST / 2, y + TR_H / 2, ligne.estJustifie);

            y += TR_H;
          });
        }
      }

      y += 14;

      // ── SECTION CALCUL ────────────────────────────────────────────────────────
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

        const calcRows: { libelle: string; montant: string; plus: boolean }[] = [
          { libelle: 'Salaire brut de base', montant: `${fmt(totalBrut)} FCFA`, plus: true },
          { libelle: `Déduction retards injustifiés (${nbRetInjustTotal} jour(s))`, montant: `- ${fmt(totalDedRetards)} FCFA`, plus: false },
          { libelle: `Déduction absences injustifiées (${nbAbsInjustTotal} jour(s))`, montant: `- ${fmt(totalDedAbs)} FCFA`, plus: false },
          { libelle: 'Primes', montant: `+ ${fmt(totalPrimes)} FCFA`, plus: true },
        ];

        calcRows.forEach((r, i) => {
          if (y + TR_H > H - 80) { doc.addPage(); y = 40; }
          doc.rect(M, y, W - M * 2, TR_H).fill(i % 2 === 0 ? C_WHITE : C_GRAY);
          doc.font('Helvetica').fontSize(8).fillColor(C_DARK)
            .text(r.libelle, M + 6, y + 4, { width: COL_LIB_W - 6 });
          doc.font('Helvetica-Bold').fontSize(8).fillColor(r.plus ? C_GREEN : C_RED)
            .text(r.montant, M + COL_LIB_W, y + 4, { width: COL_MNT_W - 6, align: 'right' });
          y += TR_H;
        });

        doc.moveTo(M, y).lineTo(W - M, y).lineWidth(0.5).stroke(C_BORDER);
        y += 8;

        // Salaire net
        if (y + 30 > H - 80) { doc.addPage(); y = 40; }
        doc.rect(M, y, W - M * 2, 30).fill(C_RED);
        doc.font('Helvetica-Bold').fontSize(11).fillColor(C_WHITE)
          .text('SALAIRE NET À PAYER', M + 8, y + 10);
        doc.text(`${fmt(totalNet)} FCFA`, M + 8, y + 10, { align: 'right', width: W - M * 2 - 16 });
        y += 32;

        // Montant versé
        doc.rect(M, y, W - M * 2, 22).fill(C_GRAY);
        doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_DARK)
          .text('Montant versé', M + 8, y + 7);
        doc.font('Helvetica').fontSize(8.5).fillColor(C_DARK)
          .text(`${fmt(totalVerse)} FCFA`, M + 8, y + 7, { align: 'right', width: W - M * 2 - 16 });
        y += 26;

        // Signature
        if (y + 50 < H - 40) {
          doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#444444')
            .text("Signature de l'employé :", M, y + 8);
          doc.moveTo(250, y + 28).lineTo(W - M, y + 28).lineWidth(0.8).stroke(C_DARK);
          doc.font('Helvetica').fontSize(7.5).fillColor(C_MUTED)
            .text('Date : _____ / _____ / _________', 250, y + 32);
        }
      }

      // ── FOOTER ────────────────────────────────────────────────────────────────
      const FOOTER_Y = H - 28;
      doc.rect(0, FOOTER_Y, W, 28).fill(C_RED);
      doc.font('Helvetica').fontSize(7.5).fillColor('#FFCDD2')
        .text(
          `${nomEntreprise || 'Document confidentiel'} — ${new Date().getFullYear()}`,
          0, FOOTER_Y + 10, { width: W, align: 'center' },
        );

      doc.end();
    });

    return filepath;
  }


  // ══════════════════════════════════════════════════════════════════════════
  // RAPPORT MASSE SALARIALE
  // ══════════════════════════════════════════════════════════════════════════

  // Remplacer genererRapportMasseSalariale dans pdf-generator.service.ts
  async genererRapportMasseSalariale(
    data: { agregats: any; salaires: any[] },
    periode: string,
    outputDir: string,
    entreprise: any = null,
  ): Promise<string> {
    const filename = `rapport_masse_salariale_${periode.replace('/', '-')}_${Date.now()}.pdf`;
    const filepath = path.join(outputDir, filename);
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const stream = fs.createWriteStream(filepath);

    // ── Formater un montant sans espace insécable (fix du "/") ───────────────
    const fmt = (n: number): string =>
      n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        .replace(/\u00a0/g, ' ')
        .replace(/\u202f/g, ' ');

    await new Promise<void>((resolve, reject) => {
      doc.pipe(stream);
      stream.on('finish', resolve);
      stream.on('error', reject);

      const W = doc.page.width;
      const H = doc.page.height;
      const M = 40;

      // ── EN-TÊTE ──────────────────────────────────────────────────────────────
      doc.rect(0, 0, W, 80).fill(C_RED);

      if (entreprise?.logo && fs.existsSync(entreprise.logo)) {
        try { doc.image(entreprise.logo, M, 10, { fit: [60, 60], valign: 'center' }); } catch { /* logo illisible */ }
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

      // Séparateur vertical
      doc.moveTo(390, 10).lineTo(390, 70).lineWidth(0.5).stroke(C_WHITE).opacity(0.3);
      doc.opacity(1);

      // Titre — droite
      doc.fillColor(C_WHITE).fontSize(11).font('Helvetica-Bold')
        .text('RAPPORT', 395, 18, { width: 160, align: 'center' });
      doc.fontSize(10).font('Helvetica-Bold')
        .text('MASSE SALARIALE', 395, 33, { width: 160, align: 'center' });
      doc.fontSize(8).font('Helvetica').fillColor('#FFCDD2')
        .text(`Période : ${periode}`, 395, 50, { width: 160, align: 'center' });
      doc.fontSize(7).fillColor('#FFCDD2')
        .text(`Généré le ${new Date().toLocaleDateString('fr-FR')}`, 395, 62, { width: 160, align: 'center' });

      let y = 92;

      // ── HELPER : titre de section ─────────────────────────────────────────────
      const drawSectionTitle = (title: string, yy: number): number => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED).text(title, M, yy);
        doc.moveTo(M, yy + 15).lineTo(W - M, yy + 15).lineWidth(0.8).stroke(C_RED);
        return yy + 22;
      };

      // ── RÉCAPITULATIF — 2 lignes × 3 boîtes ──────────────────────────────────
      y = drawSectionTitle('Récapitulatif', y);

      const { agregats } = data;
      const BOX_W = (W - M * 2 - 10) / 3;
      const BOX_H = 50;
      const GAP = 5;

      const drawSummaryBox = (
        label: string,
        value: string,
        x: number,
        yy: number,
        color: string = '#555555',
      ) => {
        doc.roundedRect(x, yy, BOX_W, BOX_H, 4).fillAndStroke(C_GRAY, C_BORDER);
        doc.font('Helvetica-Bold').fontSize(13).fillColor(color)
          .text(value, x + 4, yy + 8, { width: BOX_W - 8, align: 'center' });
        doc.font('Helvetica').fontSize(7.5).fillColor('#777777')
          .text(label, x + 4, yy + 34, { width: BOX_W - 8, align: 'center' });
      };

      // Ligne 1
      drawSummaryBox('Employés', String(agregats.nbEmployes), M, y);
      drawSummaryBox('Total brut (FCFA)', `${fmt(Number(agregats.totalBrut))} FCFA`, M + BOX_W + GAP, y, C_DARK);
      drawSummaryBox('Déductions (FCFA)', `${fmt(Number(agregats.totalDeductions))} FCFA`, M + (BOX_W + GAP) * 2, y, C_RED);
      y += BOX_H + GAP;

      // Ligne 2
      drawSummaryBox('Primes (FCFA)', `${fmt(Number(agregats.totalPrimes ?? 0))} FCFA`, M, y, C_GREEN);
      drawSummaryBox('Total net (FCFA)', `${fmt(Number(agregats.totalNet))} FCFA`, M + BOX_W + GAP, y, C_DARK);
      drawSummaryBox('Total versé (FCFA)', `${fmt(Number(agregats.totalVerse))} FCFA`, M + (BOX_W + GAP) * 2, y, C_DARK);
      y += BOX_H + 18;

      // ── AVERTISSEMENT (données partielles) ──────────────────────────────────
      if ((data as any).avertissement) {
        doc.rect(M, y, W - M * 2, 22).fill('#FFF3E0');
        doc.rect(M, y, 4, 22).fill('#FF9800');
        doc.font('Helvetica-Bold').fontSize(8).fillColor('#E65100')
          .text(`⚠️  ${(data as any).avertissement}`, M + 10, y + 7, { width: W - M * 2 - 14 });
        y += 30;
      }


      // ── TABLEAU DÉTAIL PAR EMPLOYÉ ────────────────────────────────────────────
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

      // En-tête tableau
      doc.rect(M, y, totalW, HDR_H).fill(C_RED);
      let cx = M;
      cols.forEach(col => {
        doc.font('Helvetica-Bold').fontSize(8).fillColor(C_WHITE)
          .text(col.header, cx + 3, y + 6, { width: col.w - 6, align: 'center' });
        cx += col.w;
      });
      y += HDR_H;

      // Lignes de données
      data.salaires.forEach((s, i) => {
        if (y + TR_H > H - 40) { doc.addPage(); y = 40; }

        const ecart = s.ecart ? Number(s.ecart) : 0;
        const rows: Record<string, string> = {
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
          if (col.key === 'deductions') color = C_RED;
          if (col.key === 'net') color = C_DARK;
          if (col.key === 'ecart') color = ecart >= 0 ? C_GREEN : C_RED;

          const align = col.key === 'employe' ? 'left' : 'center';
          const xOff = col.key === 'employe' ? 5 : 0;

          doc.font(col.key === 'net' ? 'Helvetica-Bold' : 'Helvetica')
            .fontSize(7.5).fillColor(color)
            .text(rows[col.key], cx + xOff, y + 5, { width: col.w - 6, align });
          cx += col.w;
        });

        // Ligne séparatrice
        doc.moveTo(M, y + TR_H).lineTo(M + totalW, y + TR_H)
          .lineWidth(0.3).stroke(C_BORDER);
        y += TR_H;
      });

      // Ligne total
      if (y + TR_H <= H - 40) {
        doc.rect(M, y, totalW, TR_H).fill('#F0F0F0');
        doc.font('Helvetica-Bold').fontSize(8).fillColor(C_DARK)
          .text('TOTAL', M + 5, y + 5, { width: cols[0].w - 6 });

        const totalCols: [number, string, string][] = [
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

      // ── FOOTER ────────────────────────────────────────────────────────────────
      const FOOTER_Y = H - 28;
      doc.rect(0, FOOTER_Y, W, 28).fill(C_RED);
      doc.font('Helvetica').fontSize(7.5).fillColor('#FFCDD2')
        .text(
          `${nomEntreprise || 'Document confidentiel'} — ${new Date().getFullYear()}`,
          0, FOOTER_Y + 10, { width: W, align: 'center' },
        );

      doc.end();
    });

    return filepath;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // RAPPORT CONTRATS CDD
  // ══════════════════════════════════════════════════════════════════════════

  // Remplacer genererRapportContratsCDD dans pdf-generator.service.ts

  async genererRapportContratsCDD(
    contrats: any[],
    periode: string,
    outputDir: string,
    entreprise: any = null,
  ): Promise<string> {
    const filename = `rapport_contrats_cdd_${periode.replace('/', '-')}_${Date.now()}.pdf`;
    const filepath = path.join(outputDir, filename);
    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const stream = fs.createWriteStream(filepath);

    await new Promise<void>((resolve, reject) => {
      doc.pipe(stream);
      stream.on('finish', resolve);
      stream.on('error', reject);

      const W = doc.page.width;
      const H = doc.page.height;
      const M = 40;

      // ── EN-TÊTE ──────────────────────────────────────────────────────────────
      doc.rect(0, 0, W, 80).fill(C_RED);

      if (entreprise?.logo && fs.existsSync(entreprise.logo)) {
        try { doc.image(entreprise.logo, M, 10, { fit: [60, 60], valign: 'center' }); } catch { /* logo illisible */ }
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

      // ── HELPER : titre de section ─────────────────────────────────────────────
      const drawSectionTitle = (title: string, yy: number): number => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED).text(title, M, yy);
        doc.moveTo(M, yy + 15).lineTo(W - M, yy + 15).lineWidth(0.8).stroke(C_RED);
        return yy + 22;
      };

      // ── RÉCAPITULATIF — 3 boîtes ──────────────────────────────────────────────
      y = drawSectionTitle('Récapitulatif', y);

      const urgents = contrats.filter(c => this.joursRestants(c.dateFin) <= 7).length;
      const proches = contrats.filter(c => this.joursRestants(c.dateFin) <= 30).length;

      const BOX_W = (W - M * 2 - 10) / 3;
      const BOX_H = 50;
      const GAP = 5;

      const drawBox = (
        label: string,
        value: number,
        x: number,
        yy: number,
        alert: boolean,
      ) => {
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

      // ── TABLEAU CDD ───────────────────────────────────────────────────────────
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

      // En-tête tableau
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
      } else {
        contrats.forEach((c, i) => {
          if (y + TR_H > H - 40) { doc.addPage(); y = 40; }

          const jours = this.joursRestants(c.dateFin);
          const statut = jours <= 7 ? 'URGENT' : jours <= 15 ? 'ATTENTION' : 'À surveiller';

          // Fond rouge clair si urgent
          const bg = jours <= 7 ? '#FFF5F5' : i % 2 === 0 ? C_WHITE : C_GRAY;
          doc.rect(M, y, totalW, TR_H).fill(bg);

          const statutColor = jours <= 7 ? C_RED
            : jours <= 15 ? '#BA7517'
              : C_DARK;

          const rows: Record<string, { text: string; color: string; bold?: boolean }> = {
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

          // Séparateur
          doc.moveTo(M, y + TR_H).lineTo(M + totalW, y + TR_H).lineWidth(0.3).stroke(C_BORDER);
          y += TR_H;
        });
      }

      // ── FOOTER ────────────────────────────────────────────────────────────────
      const FOOTER_Y = H - 28;
      doc.rect(0, FOOTER_Y, W, 28).fill(C_RED);
      doc.font('Helvetica').fontSize(7.5).fillColor('#FFCDD2')
        .text(
          `${nomEntreprise || 'Document confidentiel'} — ${new Date().getFullYear()}`,
          0, FOOTER_Y + 10, { width: W, align: 'center' },
        );

      doc.end();
    });

    return filepath;
  }
  // ══════════════════════════════════════════════════════════════════════════
  // FICHE DE PAIE
  // ══════════════════════════════════════════════════════════════════════════

  async genererFichePaie(
    salaire: any,
    entreprise: any | null,
    outputDir: string,
  ): Promise<string> {
    const user = salaire.user;
    const codeMois = String(salaire.mois).padStart(2, '0');
    const periode = `${codeMois}/${salaire.annee}`;
    const nomEmploye = `${user.firstName}_${user.lastName}`.replace(/\s+/g, '_');
    const filename = `fiche_paie_${nomEmploye}_${codeMois}-${salaire.annee}.pdf`;
    const filepath = path.join(outputDir, filename);

    // ── Helper : supprime le "/" causé par l'espace insécable de fr-FR ────────
    const fmt = (n: number): string =>
      n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
        .replace(/\u00a0/g, ' ')
        .replace(/\u202f/g, ' ');

    const doc = new PDFDocument({ margin: 0, size: 'A4' });
    const stream = fs.createWriteStream(filepath);

    await new Promise<void>((resolve, reject) => {
      doc.pipe(stream);
      stream.on('finish', resolve);
      stream.on('error', reject);

      const W = doc.page.width;
      const H = doc.page.height;
      const M = 40;

      // ── EN-TÊTE ──────────────────────────────────────────────────────────────
      doc.rect(0, 0, W, 80).fill(C_RED);

      if (entreprise?.logo && fs.existsSync(entreprise.logo)) {
        try { doc.image(entreprise.logo, M, 10, { fit: [60, 60], valign: 'center' }); } catch { /* logo illisible */ }
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

      // ── INFORMATIONS EMPLOYÉ ───────────────────────────────────────────────
      let y = 98;

      const drawSectionTitle = (title: string, yy: number): number => {
        doc.fontSize(10).font('Helvetica-Bold').fillColor(C_RED).text(title, M, yy);
        doc.moveTo(M, yy + 15).lineTo(W - M, yy + 15).lineWidth(0.8).stroke(C_RED);
        return yy + 22;
      };

      y = drawSectionTitle('Informations employé', y);

      const infos: [string, string][] = [
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

      // ── DÉTAIL DU CALCUL ──────────────────────────────────────────────────
      y = drawSectionTitle('Détail du calcul de la paie', y);

      const COL_LIB_W = W - M * 2 - 130;
      const COL_MNT_W = 130;
      const TR_H = 16;

      // En-tête tableau
      doc.rect(M, y, W - M * 2, TR_H + 2).fill(C_RED);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_WHITE)
        .text('Libellé', M + 6, y + 4, { width: COL_LIB_W });
      doc.text('Montant', M + COL_LIB_W, y + 4, { width: COL_MNT_W, align: 'right' });
      y += TR_H + 2;

      const calcRows: { libelle: string; montant: string; plus: boolean }[] = [
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

      // Une ligne par prime
      const primes = (salaire.primes ?? []) as Array<{ somme: number; raison: string }>;
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

      // ── SALAIRE NET ────────────────────────────────────────────────────────
      doc.rect(M, y, W - M * 2, 30).fill(C_RED);
      doc.font('Helvetica-Bold').fontSize(11).fillColor(C_WHITE)
        .text('SALAIRE NET À PAYER', M + 8, y + 10);
      doc.text(
        `${fmt(Number(salaire.salaireNet))} FCFA`,
        M + 8, y + 10, { align: 'right', width: W - M * 2 - 16 },
      );
      y += 32;

      // ── MONTANT VERSÉ ─────────────────────────────────────────────────────
      doc.rect(M, y, W - M * 2, 22).fill(C_GRAY);
      doc.font('Helvetica-Bold').fontSize(8.5).fillColor(C_DARK)
        .text('Montant versé', M + 8, y + 7);
      doc.font('Helvetica').fontSize(8.5).fillColor(C_DARK)
        .text(
          `${fmt(Number(salaire.montantVerse ?? salaire.salaireNet))} FCFA`,
          M + 8, y + 7, { align: 'right', width: W - M * 2 - 16 },
        );
      y += 26;

      // ── ZONE DE SIGNATURE ──────────────────────────────────────────────────
      doc.font('Helvetica').fontSize(8).fillColor('#444444')
        .text(
          `Je soussigné(e) ${user.firstName} ${user.lastName} certifie avoir reçu ` +
          `la somme de ${fmt(Number(salaire.montantVerse ?? salaire.salaireNet))} FCFA ` +
          `correspondant à ma rémunération du mois de ${periode}.`,
          M, y + 6, { width: W - M * 2 },
        );
      y += 28;

      doc.font('Helvetica-Bold').fontSize(8.5).fillColor('#444444')
        .text("Signature de l'employé :", M, y + 8);
      doc.moveTo(250, y + 28).lineTo(W - M, y + 28).lineWidth(0.8).stroke(C_DARK);
      doc.font('Helvetica').fontSize(7.5).fillColor(C_MUTED)
        .text('Date : _____ / _____ / _________', 250, y + 32);

      // ── FOOTER ────────────────────────────────────────────────────────────
      const FOOTER_Y = H - 28;
      doc.rect(0, FOOTER_Y, W, 28).fill(C_RED);
      doc.font('Helvetica').fontSize(7.5).fillColor('#FFCDD2')
        .text(
          `${nomEntreprise} — Document confidentiel — ${new Date().getFullYear()}`,
          0, FOOTER_Y + 10, { width: W, align: 'center' },
        );

      doc.end();
    });

    return filepath;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HELPERS PARTAGÉS (rapports génériques avec drawHeader bleu)
  // ══════════════════════════════════════════════════════════════════════════

  private joursRestants(dateFin: Date | string): number {
    return Math.ceil((new Date(dateFin).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
}
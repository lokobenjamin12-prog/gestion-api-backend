import { ApiProperty } from "@nestjs/swagger";

export class SessionSummaryDto {
    @ApiProperty({
        example: 'sess_999888xyz',
        description: 'Identifiant unique de la session de vente'
    })
    id: string;

    @ApiProperty({
        description: 'Informations condensées sur le commercial sur le terrain',
        example: { id: 'usr_comm456', firstName: 'Jean', lastName: 'Kamdem' }
    })
    commercial: { id: string; profilePicture: string; firstName: string; lastName: string };

    @ApiProperty({
        description: 'Informations sur le manager qui a supervisé ou ouvert la session',
        example: { id: 'usr_mgr789', firstName: 'Alain', lastName: 'Tchakounté' }
    })
    manager: { id: string; profilePicture: string; firstName: string; lastName: string };

    @ApiProperty({
        description: 'Détails du produit/article géré durant cette course',
        example: { nom: 'Ndolé Box Premium', categorie: 'Plats', prixUnite: 3500 }
    })
    article: { nom: string; categorie: string; prixUnite: number };

    @ApiProperty({ example: 50, description: 'Stock initial emporté au départ', type: Number })
    quantiteDepart: number;

    @ApiProperty({ example: 5, description: 'Stock invendu rapporté au retour (null si session active)', nullable: true, type: Number })
    quantiteRetour: number | null;

    @ApiProperty({ example: 45, description: 'Quantité nette vendue calculée', nullable: true, type: Number })
    quantiteVendue: number | null;

    @ApiProperty({ example: '2026-07-06', description: 'Date de l\'ouverture de la session (Format: YYYY-MM-DD)' })
    jourOuverture: string;       // ← new — date only (YYYY-MM-DD)

    @ApiProperty({ example: '2026-07-06T08:30:00.000Z', description: 'Timestamp précis du départ effectif' })
    heureDepart: Date;

    @ApiProperty({ example: '2026-07-06T17:30:00.000Z', description: 'Timestamp précis du retour (null si active)', nullable: true })
    heureRetour: Date | null;

    @ApiProperty({ example: 157500, description: 'Somme totale cumulée des ventes enregistrées', nullable: true, type: Number })
    totalVentesRecues: number | null;

    @ApiProperty({ example: 2500, description: 'Somme totale cumulée des dépenses sur le terrain', type: Number })
    totalDepenses: number;

    @ApiProperty({
        description: 'Liste des lignes de dépenses déclarées pendant la session',
        example: [{ montant: 2500, motif: 'Achat carburant livraison' }],
        type: 'array',
        items: { type: 'object' }
    })
    depenses: any[];

    @ApiProperty({ example: 157500, description: 'Chiffre d\'affaires théorique attendu (quantiteVendue * prixUnite)', nullable: true, type: Number })
    chiffreAffaireTheorique: number | null;

    @ApiProperty({ example: 0, description: 'Écart constaté en caisse (Négatif = Manquant, Positif = Surplus)', nullable: true, type: Number })
    ecartCaisse: number | null;

    @ApiProperty({ example: 'CLOSED', description: 'Statut de cycle de vie de la session (OPEN, CLOSED, CANCELLED)' })
    status: string;
} 
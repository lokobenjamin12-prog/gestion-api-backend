declare class DepenseItemDto {
    montant: number;
    motif: string;
}
export declare class CloseSessionDto {
    quantiteRetour: number;
    depenses: DepenseItemDto[];
    heureRetour?: string;
}
export {};

import { Chantier } from "./Chantier";
import { Fournisseur } from "./Fournisseur";
import { DepenseBonCommandeFournisseur } from "./depenseBonCommandeFournisseur";
import { Devis } from "./Devis";

export class BonCommandeFournisseur {
    id: number;
    reference: string;
    idChantier: number;
    status: number;
    articles: string;
    dateCreation: Date | string;
    dateExpiration: Date | string;
    objet: string;
    note: string;
    conditionsReglement: string;
    memos: string;
    historique: string;
    chantier: Chantier;
    totalHt: number;
    tva: string;
    tvaGlobal: number;
    prorata: number;
    puc: number;
    retenueGarantie: number;
    remise: number;
    typeRemise: string;
    total: number;
    idFournisseur: number;
    fournisseur: Fournisseur;
    idDevis: number;
    devis: Devis;
    depenseBonCommandeFournisseurs: DepenseBonCommandeFournisseur[];
}

export class BonCommandeFournisseurListModel {
    public hasNextPage: boolean;
    public hasPreviousPage: boolean;
    public nextPageNumber: number;
    public pageNumber: number;
    public pageSize: number;
    public previousPageNumber: number;
    public totalItems: number;
    public totalPages: number;
    public list: BonCommandeFournisseur[];
}
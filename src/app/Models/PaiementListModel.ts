import { Paiement } from "./Entities/Paiement";

export class PaiementDataModel {
    data: PaiementListModel
    total: number
}

export class PaiementListModel {
    public hasNextPage: boolean;
    public hasPreviousPage: boolean;
    public nextPageNumber: number;
    public pageNumber: number;
    public pageSize: number;
    public previousPageNumber: number;
    public totalItems: number;
    public totalPages: number;
    public list: Paiement[];
}
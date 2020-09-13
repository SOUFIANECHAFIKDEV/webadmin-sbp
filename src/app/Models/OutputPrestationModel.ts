import { Produit } from "./Entities/Produit";
import { Prestation } from "./Entities/Prestation";

export class OutputPrestationModel {
    prestations: Produit[];
    globalTotalTTC;
    remiseGloabl = 0;
    typeRemiseGloabl: string
}
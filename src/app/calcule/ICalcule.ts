import { CalculTva } from "app/Models/calcul-tva";
import { ResultatCalculModel } from "app/Models/ResultatCalculModel";

export interface ICalcule {

    totalHTArticle(prix: number, quantite: number, remise: number): number

    totalTTCArticle(articleTotalHT: number, tva: number): number;

    totalHt(articles: any[]): number;

    totalHtRemise(globalTotalHT: number, remiseGloabl: number, typeRemiseGloabl: string): number

    calculVentilationRemise(articles: any[], globalTotalHT: number, remiseGloabl: number, typeRemiseGloabl: string): CalculTva[]
    calculVentilationRemiseDepense(articles: any[], globalTotalHT: number, remiseGloabl: number, typeRemiseGloabl: string): CalculTva[]
    totalTTC(globalTotalHT: number, globalTotalHTRemise: number, calculTvas: CalculTva[], remiseGloabl: number): number

    margeBrut(articles: any[], globalTotalHT: number, remiseGloabl: number, typeRemiseGloabl: string): number

    calculGenerale(articles: any[], remiseGloabl: number, typeRemiseGloabl: string): ResultatCalculModel
}
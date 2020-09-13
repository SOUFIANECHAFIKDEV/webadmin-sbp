import { CalculTva } from "./calcul-tva";

export class ResultatCalculModel {
    articles: any[]
    totalHT: number
    calculTvas: CalculTva[]
    totalHtRemise: number
    totalTTC: number
    margeBrut: number
}
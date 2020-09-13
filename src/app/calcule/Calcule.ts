import { ICalcule } from "./ICalcule";

import { CalculTva } from "app/Models/calcul-tva";
import { ResultatCalculModel } from "app/Models/ResultatCalculModel";
import { Produit } from "app/Models/Entities/Produit";

export class Calcule implements ICalcule {

    margeBrut(articles: Produit[], globalTotalHT: number, remiseGloabl: number, typeRemiseGloabl: string): number {
        var sumPrixAchatArticles = articles.reduce((x, y) => x + ((y.prixParFournisseur == null || y.prixParFournisseur.filter(x => x.default == 1).length == 0) ? 0 : y.prixParFournisseur.filter(x => x.default == 1)[0].prix) * y.qte, 0);
        var sumPrixArticles = articles.reduce((x, y) => x + y.totalHT, 0)
        articles.map(x => x.remise == null ? x.remise = 0 : x.remise);
        var sumRemiseArticles = articles.reduce((x, y) => x + y.remise, 0);
        if (typeRemiseGloabl == "€")
            var valeurRemiseGloabl = remiseGloabl;
        else
            var valeurRemiseGloabl = (globalTotalHT * (remiseGloabl / 100));
        return sumPrixArticles - sumPrixAchatArticles - sumRemiseArticles - valeurRemiseGloabl;
    }

    totalTTC(globalTotalHT: number, globalTotalHTRemise: number, calculTvas: CalculTva[], remiseGloabl: number): number {
        var sumTVA = calculTvas.reduce((x, y) => x + y.totalTVA, 0);
        if (remiseGloabl && remiseGloabl != 0)
            return (globalTotalHTRemise + sumTVA);
        else
            return (globalTotalHT + sumTVA)
    }

    totalHtRemise(globalTotalHT: number, remiseGloabl: number, typeRemiseGloabl: string): number {
        if (typeRemiseGloabl == "€")
            return (globalTotalHT - remiseGloabl);
        else
            return (globalTotalHT - (globalTotalHT * (remiseGloabl / 100)));
    }

    calculVentilationRemiseDepense(articles: Produit[], globalTotalHT: number, remiseGloabl: number, typeRemiseGloabl: string): CalculTva[] {
        let calculTvas: CalculTva[] = [];
        let groubTva = [];

        articles = articles.map(article => {
            const tva: string = article.tva.toString();
            article.tva = parseFloat(tva);
            return article;
        })

        var groupTvaDistinct = articles.filter(
            (value, index, self) => self.map(e => e.tva).indexOf(value.tva) === index
        );
        groubTva = groupTvaDistinct.map(x => x.tva).sort((a, b) => a - b);
        groubTva.forEach(tva => {
            const calcule = new CalculTva();
            calcule.tva = tva;
            const produits = articles.filter(x => x.tva == tva)
            var totalHtProduit = 0;

            produits.forEach(element => {
                var prixParFournisseur = element.prixParFournisseur.filter(x => x.default == 1);
                prixParFournisseur.forEach(res => {
                    var prix = res.prix;
                    totalHtProduit = totalHtProduit + (prix * element.qte);
                });
            });

            if (typeRemiseGloabl == "€") {
                var percente = (totalHtProduit / globalTotalHT);
                percente = isNaN(percente) ? 0 : percente;
                calcule.totalHT = totalHtProduit - percente * remiseGloabl;
                calcule.totalTVA = calcule.totalHT * (tva / 100);
                calcule.totalTTC = calcule.totalTVA + calcule.totalHT;
            }
            else {
                calcule.totalHT = totalHtProduit - ((totalHtProduit * remiseGloabl) / 100);
                calcule.totalTVA = calcule.totalHT * (tva / 100);
                calcule.totalTTC = calcule.totalTVA + calcule.totalHT;
            }
            calculTvas.push(calcule);
        });

        return calculTvas;
    }

    calculVentilationRemise(articles: Produit[], globalTotalHT: number, remiseGloabl: number, typeRemiseGloabl: string): CalculTva[] {

        let calculTvas: CalculTva[] = [];
        let groubTva = [];
        var groupTvaDistinct = articles.filter(
            (value, index, self) => self.map(e => e.tva).indexOf(value.tva) === index
        );
        groubTva = groupTvaDistinct.map(x => x.tva).sort((a, b) => a - b);
        groubTva.forEach(tva => {
            const calcule = new CalculTva();
            calcule.tva = tva;
            const produits = articles.filter(x => x.tva == tva)
            var totalHtProduit = produits.reduce((x, y) => x + (y.prixHt * y.qte), 0)
            if (typeRemiseGloabl == "€") {
                var percente = (totalHtProduit / globalTotalHT);
                percente = isNaN(percente) ? 0 : percente;
                calcule.totalHT = totalHtProduit - percente * remiseGloabl;
                calcule.totalTVA = calcule.totalHT * (tva / 100);
                calcule.totalTTC = calcule.totalTVA + calcule.totalHT;
            }
            else {
                calcule.totalHT = totalHtProduit - ((totalHtProduit * remiseGloabl) / 100);
                calcule.totalTVA = calcule.totalHT * (tva / 100);
                calcule.totalTTC = calcule.totalTVA + calcule.totalHT;
            }
            calculTvas.push(calcule);
        });
        return calculTvas;
    }

    totalHt(articles: Produit[]): number {
        return articles.reduce((x, y) => x + y.totalHT, 0);
    }

    totalTTCArticle(articleTotalHT: number, tva: number): number {
        return articleTotalHT * (tva / 100) + articleTotalHT
    }

    totalHTArticle(prix: number, quantite: number, remise: number): number {
        if (remise)
            return (prix * quantite) - remise;
        else
            return (prix * quantite);
    }

    calculGenerale(articles: Produit[], remiseGloabl: number, typeRemiseGloabl: string): ResultatCalculModel {
        articles.forEach(article => {
            article.totalHT = this.totalHTArticle(article.prix, article.qte, article.remise);
            article.totalTTC = this.totalTTCArticle(article.totalHT, article.tva);
        });
        var totalHT = this.totalHt(articles);
        var calculTvas = this.calculVentilationRemise(articles, totalHT, remiseGloabl, typeRemiseGloabl);
        var totalHtRemise = this.totalHtRemise(totalHT, remiseGloabl, typeRemiseGloabl);
        var totalTTC = this.totalTTC(totalHT, totalHtRemise, calculTvas, remiseGloabl);
        var margeBrut = this.margeBrut(articles, totalHT, remiseGloabl, typeRemiseGloabl);
        return {
            articles: articles,
            totalHT: totalHT,
            calculTvas: calculTvas,
            totalHtRemise: totalHtRemise,
            totalTTC: totalTTC,
            margeBrut: margeBrut
        };
    }

}
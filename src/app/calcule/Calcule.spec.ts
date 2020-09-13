import { ICalcule } from './ICalcule';
import { Calcule } from './Calcule';
import { Prestation } from 'app/Models/Entities/Prestation';
import { CalculTva } from 'app/Models/calcul-tva';

describe('Class Calcule', () => {

    let iCalcule: ICalcule = new Calcule();
    let prestations: Prestation[] = []
    let globalTotalHT = 0;
    let calculsVentilationRemise: CalculTva[] = [];
    let remiseGloabl = 0;
    let globalTotalTTC = 0;

    beforeAll(() => {
        // 1
        let prestation1 = new Prestation()
        prestation1.prix = 30;
        prestation1.tva = 15;
        prestation1.qte = 4;
        prestation1.remise = 0;
        prestation1.totalHT = iCalcule.totalHTArticle(prestation1.prix, prestation1.qte, prestation1.remise)
        // 2
        let prestation2 = new Prestation()
        prestation2.prix = 10;
        prestation2.tva = 20;
        prestation2.qte = 2;
        prestation2.remise = 4;
        prestation2.totalHT = iCalcule.totalHTArticle(prestation2.prix, prestation2.qte, prestation2.remise)

        // push
        prestations.push(prestation1)
        prestations.push(prestation2)

        // pre calcul
        prestations[0].totalHT = iCalcule.totalHTArticle(prestations[0].prix, prestations[0].qte, prestations[0].remise)
        prestations[1].totalHT = iCalcule.totalHTArticle(prestations[1].prix, prestations[1].qte, prestations[1].remise)

        prestations[0].totalTTC = iCalcule.totalTTCArticle(prestations[0].totalHT, prestations[0].tva)
        prestations[1].totalTTC = iCalcule.totalTTCArticle(prestations[1].totalHT, prestations[1].tva)

        globalTotalHT = iCalcule.totalHt(prestations)
    });

    it('Prix total HT article', () => {
        prestations[0].totalHT = iCalcule.totalHTArticle(prestations[0].prix, prestations[0].qte, prestations[0].remise)
        prestations[1].totalHT = iCalcule.totalHTArticle(prestations[1].prix, prestations[1].qte, prestations[1].remise)
        expect(prestations[0].totalHT).toBe(120);
        expect(prestations[1].totalHT).toBe(16);
    });

    it('Prix total TTC article', () => {
        prestations[0].totalTTC = iCalcule.totalTTCArticle(prestations[0].totalHT, prestations[0].tva)
        prestations[1].totalTTC = iCalcule.totalTTCArticle(prestations[1].totalHT, prestations[1].tva)
        expect(prestations[0].totalTTC).toBe(138);
        expect(prestations[1].totalTTC).toBe(19.2);
    });

    it('Global total HT tous les articles', () => {
        globalTotalHT = iCalcule.totalHt(prestations)
        expect(globalTotalHT).toBe(136);
    });

    it("Global total TTC ", () => {
        calculsVentilationRemise = iCalcule.calculVentilationRemise(prestations, globalTotalHT, remiseGloabl, "€")
        globalTotalTTC = iCalcule.totalTTC(globalTotalTTC, null, calculsVentilationRemise, null);
        expect(globalTotalTTC).toBe(21.2);
    });

    it('Global total HT tous les articles', () => {
        globalTotalHT = iCalcule.totalHt(prestations)
        expect(globalTotalHT).toBe(136);
    });

  
    it("Marge brut", () => {
        var res = iCalcule.margeBrut(prestations, globalTotalHT, remiseGloabl, "€");
        expect(res).toBe(132)
    })

});
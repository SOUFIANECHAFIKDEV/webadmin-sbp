import { PaiementGroupeComponent } from "./paiement-groupe.component";
import { FacturePaiement } from "app/Models/Entities/FacturePaiement";
import { Facture } from "app/Models/Entities/Facture";
import { FormBuilder } from "@angular/forms";

describe("Module Paiement - index - paiement groupe", () => {

    var comp: PaiementGroupeComponent;
    var facturePaiement: FacturePaiement[]
    var factures: Facture[]

    beforeEach(() => {
        comp = new PaiementGroupeComponent(new FormBuilder)

        let facturePaiement0 = new FacturePaiement();
        facturePaiement0.id = 1;
        facturePaiement0.idFacture = 4;
        facturePaiement0.idPaiement = 6;
        facturePaiement0.montant = 155;

        let facturePaiement1 = new FacturePaiement();
        facturePaiement1.id = 3;
        facturePaiement1.idFacture = 4;
        facturePaiement1.idPaiement = 6;
        facturePaiement1.montant = 145;

        let facturePaiement2 = new FacturePaiement();
        facturePaiement2.id = 2;
        facturePaiement2.idFacture = 4;
        facturePaiement2.idPaiement = 6;
        facturePaiement2.montant = 123;

        let facturePaiement3 = new FacturePaiement();
        facturePaiement3.id = 5;
        facturePaiement3.idFacture = 4;
        facturePaiement3.idPaiement = 6;
        facturePaiement3.montant = 188;

        facturePaiement = [facturePaiement0, facturePaiement1, facturePaiement2, facturePaiement3]

        let facture0 = new Facture();
        facture0.id = 1
        facture0.total = 1200;
        facture0.facturePaiements = facturePaiement;
        facture0["montant"] = 250

        let facture1 = new Facture();
        facture1.id = 2
        facture1["montant"] = 750

        factures = [facture0, facture1]

    })

    it("getResterPayer", () => {
        let total = 1200;
        let res = comp.getResterPayer(total, facturePaiement, 155)
        expect(res).toBe(434);
    });

    it("totalMontant", () => {
        comp.factures = factures;
        let total = comp.totalMontant();
        expect(total).toEqual(1000);
    })

    it("checkValidMontant", () => {
        comp.factures = factures;
        let res = comp.checkValidMontant(0)
        expect(!res).toBeTruthy()
    })

})
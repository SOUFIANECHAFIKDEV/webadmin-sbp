import { PayByAvoirComponent } from "./pay-by-avoir.component";
import { Avoir } from "app/Models/Entities/Avoir";

describe("Facture Module - Show - paiement par avoir", () => {

    let comp: PayByAvoirComponent

    beforeEach(() => {
        comp = new PayByAvoirComponent()

        let avoir0 = new Avoir();
        avoir0.id = 14

        let avoir1 = new Avoir();
        avoir1.id = 14

        let avoir2 = new Avoir();
        avoir2.id = 14

        comp.avoirs = [avoir0, avoir1, avoir2]
    })

    it("selectAvoir", () => {
        

        comp.selectAvoir(0);

        expect(comp.avoirs[0]["checked"]).toBeTruthy()
        expect(comp.avoirs[1]["checked"]).toBeFalsy()
        expect(comp.avoirs[2]["checked"]).toBeFalsy()

    })

})
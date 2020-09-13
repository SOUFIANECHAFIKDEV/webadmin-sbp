import { InformationComponent } from "./information.component";
import { Avoir } from "app/Models/Entities/Avoir";

describe("Avoir Module - ShowComponent - Information", () => {
    let comp: InformationComponent

    beforeEach(() => {
        comp = new InformationComponent()
    })

    it("deserialzeArticles", () => {
        comp.avoir = new Avoir()
        let articles = "[{\"Reference\":\"PR0003\",\"Nom\":\"BRUMM Nettoyant\",\"Prix\":100.0,\"Tva\":10.0,\"Unite\":null,\"Categorie\":null,\"Qte\":1,\"Remise\":0},{\"Reference\":\"PR0002\",\"Nom\":\"ADHÉSIFS\",\"Prix\":120.0,\"Tva\":15.0,\"Unite\":null,\"Categorie\":null,\"Qte\":1,\"Remise\":0},{\"Reference\":\"PR0001\",\"Nom\":\"Shampooing Voiture\",\"Prix\":200.0,\"Tva\":20.0,\"Unite\":null,\"Categorie\":null,\"Qte\":1,\"Remise\":0}]"
        comp.avoir.articles = articles
        var expectedResult = JSON.parse(articles);
        var resultHave = comp.deserialzeArticles();
        expect(expectedResult).toEqual(resultHave);
    })

})
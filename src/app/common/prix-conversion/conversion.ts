export class conversion {
    GetTTcByTva(cout_horaire, cout_materiel, tva) {
        return (parseFloat(cout_horaire) + parseFloat(cout_materiel)) * (1 + (parseFloat(tva) / 100));
    }

    GetTTcByHt(Ht, tva) {
        return parseFloat(Ht) * (1 + parseFloat(tva) / 100);
    }


    calculerHt(tva, tcc) {
        return tcc / (1 + parseFloat(tva) / 100);
    }
}
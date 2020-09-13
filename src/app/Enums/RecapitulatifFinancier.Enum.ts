export enum TypeRecapitulatifFinancier {
  previsionnel = 1,
  facturation_tresorie = 2,
  tresorerieChantier = 3
}

export enum TypePrevisionnel {
  total_devis = 1,
  depensee_Aprevoir = 2,
  marge_Previsionnel = 3,
}
export enum Total_devis {
  vente_materiel = 1,
  vente_main_oveure = 2,
}
export enum DepenseAprevoir {
  achat_materiel = 1,
  achat_main_oveure = 2,
  sous_traitance = 3,
}

export enum MargePrevisionnel {
  retenueGarantier = 1,
  margeMateriel = 2,
  margeMainOeuvre = 3,
}
export enum TypeFactureTresorie {
  caFacture = 1,
  depenseeEngagees = 2,
  margeReele = 3,
}
export enum CaFacture {
  payes = 1,
  enAttentepaiement = 2,
}
export enum DepenseEngagees {
  achatsMateriels = 1,
  interventions = 2,
  sousTraitance = 3,
}

export enum DepenseAchat {
  payes = 1,
  enAttentepaiement = 2,

}

export enum DepenseSousTraitent {
  payes = 1,
  enAttentepaiement = 2,

}
export enum InterventionsousElement {
  panier = 1,
  deplacement = 2,

}
export enum MargeReelle {
  retenueGarantier = 1,
  margeMateriel = 2,
  margeMainOeuvre = 3,
}
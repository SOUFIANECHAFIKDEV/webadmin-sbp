
export class RecapitulatifFinancierModel {
  public previsionnel: PrevisionnelElementsModel[];
  public facturation_tresorie: FacturationTresorieModel[];
  public tresorerieChantier: number;
}
export class PrevisionnelElementsModel {
  public typeElements: number;
  public sum: number;
  public elements: ElementsPrevisionnelModel[];
  public pourcentage: number;
  public defference: number;
}
export class FacturationTresorieModel {
  public typeElements: number;
  public sum: number;
  public elements: ElementsFacturationTresorieModel[];
  public pourcentage: number;
  public defference: number;
}

export class ElementsPrevisionnelModel {
  public type: number;
  public sum: number;
  public pourcentage: number;
  public NbrHeure: number;
  public souselements: any;
  public defference: number;
}


export class ElementsFacturationTresorieModel {
  public type: number;
  public sum: number;
  public pourcentage: number;
  public NbrHeure: number;
  public souselements: SousElementsFacturationTresorieModel[];
}
export class SousElementsFacturationTresorieModel {
  public typeSousElement: number;
  public sum: number;
  public pourcentage: number;
  public nbrPanierOrDeplacement: number;
}
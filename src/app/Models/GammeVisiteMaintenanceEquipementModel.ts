export class GammeVisiteMaintenanceEquipementModel {
  id: number;
  nom: string;
  libelle: LibelleModel[];
}
export class LibelleModel {
  id: number;
  nom: string;
  operations: OperationModel[];
}
export class OperationModel {
  id: number;
  nom: string;

}

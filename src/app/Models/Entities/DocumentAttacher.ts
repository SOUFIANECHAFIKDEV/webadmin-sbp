import { PieceJoin } from "./PieceJoint";
import { RebriqueComponent } from "app/pages/chantier/rebrique/rubrique-list/rebrique-list.component";
import { Rubrique } from "./Rubrique";
import { Chantier } from "./Chantier";

export class DocumentAttacher {
  // id: number = 0;
  // idUser: number;
  // type: number;
  // designation: string;
  // commentaire: string;
  // date_ajout: Date = new Date();
  // date_derniere_modification: Date = new Date();
  // pieceJointes: PieceJoin;
  idRubrique: number;
  rubrique?: Rubrique;

  id: number;
  idUser: number;
  labelDocument: string;
  designation: string;
  commentaire: string;
  DateAjout: Date;
  updateAt: Date;
  pieceJointes: any;
  idChantier: number;
  chantier?: Chantier;
}
import { PieceJoin } from "./PieceJoint";

export class DocumentationChantier {
    id: number = 0;
    idUser: number;
    type: number;
    designation: string;
    commentaire: string;
    date_ajout: Date = new Date();
    date_derniere_modification: Date = new Date();
    pieceJointes: PieceJoin;
    //idRubrique: number;
}
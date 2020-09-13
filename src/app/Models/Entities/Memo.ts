import { PieceJoin } from "./PieceJoint";

export class Memo {
    idUser: number
    date: Date 
    commentaire: string
    pieceJointes: PieceJoin[] = [];
}
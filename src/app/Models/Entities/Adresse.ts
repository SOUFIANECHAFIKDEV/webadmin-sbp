import { Pays } from "./Pays";

export class Adresse {
  designation = ""
  adresse = "";
  complementAdresse = "";
  codePostal = "";
  pays: Pays = new Pays();
  departement: string;
  ville: string;
  default: boolean;
}

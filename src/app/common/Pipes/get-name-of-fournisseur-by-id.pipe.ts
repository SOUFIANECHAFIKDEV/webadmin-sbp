import { FournisseurService } from "../../services/fournisseur/fournisseur.service";
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'GetNameOfFournisseurById',
  pure: false
})
export class GetNameOfFournisseurByIdPipe implements PipeTransform {

  // userName:string = "not found";
  private userName: any = null;
  private cachedIdFournisseur = null;

  constructor(private fournisseurService: FournisseurService) { }

  transform(idFournisseur: any, args?: any): any {

    if (!idFournisseur || typeof (parseInt(idFournisseur)) != "number") {
      return null;
    }

    if (idFournisseur !== this.cachedIdFournisseur) {
      this.userName = null;
      this.cachedIdFournisseur = idFournisseur;

      this.fournisseurService.Get(idFournisseur).subscribe(fournisseur => {
        this.userName = fournisseur.nom
      });
    }

    return this.userName;
  }

}

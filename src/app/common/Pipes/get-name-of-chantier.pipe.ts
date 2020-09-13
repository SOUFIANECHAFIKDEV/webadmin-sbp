
import { Pipe, PipeTransform } from '@angular/core';
import { ChantierService } from 'app/services/chantier/chantier.service';

@Pipe({
  name: 'GetNameOfChantier',
  pure: false
})
export class GetNameOfChantierPipe implements PipeTransform {
  private name: any = null;
  private cachedIdGroupe = null;

  constructor(private chantierService: ChantierService) { }

  transform(idChantier: any, args?: any): any {

    if (!idChantier || typeof (parseInt(idChantier)) != "number") {
      return null;
    }

    if (idChantier !== this.cachedIdGroupe) {
      this.name = null;
      this.cachedIdGroupe = idChantier;

      this.chantierService.Get(idChantier).subscribe(groupe => {
        this.name = groupe.nom
      });
    }

    return this.name;
  }

}

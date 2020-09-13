
import { Pipe, PipeTransform } from '@angular/core';
import { GroupesService } from "app/services/groupe/groupe.service";

@Pipe({
  name: 'GetNameOfGroupe',
  pure: false
})
export class GetNameOfGroupePipe implements PipeTransform {
  private groupeName: any = null;
  private cachedIdGroupe = null;

  constructor(private groupesService: GroupesService) { }

  transform(idGroupe: any, args?: any): any {

    if (!idGroupe || typeof (parseInt(idGroupe)) != "number") {
      return null;
    }

    if (idGroupe !== this.cachedIdGroupe) {
      this.groupeName = null;
      this.cachedIdGroupe = idGroupe;

      this.groupesService.Get(idGroupe).subscribe(groupe => {
        this.groupeName = groupe.nom
      });
    }

    return this.groupeName;
  }

}

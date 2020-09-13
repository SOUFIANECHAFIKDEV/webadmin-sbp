import { UtilisateurService } from "./../../services/users/user.service";
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'GetNameOfUserById',
  pure: false
})
export class GetNameOfUserByIdPipe implements PipeTransform {
  // userName:string = "not found";
  private userName: any = null;
  private cachedIdUser = null;

  constructor(private utilisateurService: UtilisateurService) { }

  transform(idUser: any, args?: any): any {

    if (!idUser || typeof (parseInt(idUser)) != "number") {
      return null;
    }

    if (idUser !== this.cachedIdUser) {
      this.userName = null;
      this.cachedIdUser = idUser;

      this.utilisateurService.Get(idUser).subscribe(user => {
        this.userName = user.nom
      });
    }

    return this.userName;
  }

}

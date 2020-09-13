import { Pipe, PipeTransform } from '@angular/core';
import { UserProfile } from "app/Enums/user-profile.enum";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from 'app/app-settings/app-settings';

@Pipe({
    name: 'GetUserProfileLibelle',
    pure: false
})
export class GetUserProfileLibelle implements PipeTransform {
    private cachedIdProfile = null;
    private Libelle = "";
    constructor(private translate: TranslateService) {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
    }

    transform(idUserProfile: any, args?: any): any {

        if (!idUserProfile || typeof (parseInt(idUserProfile)) != "number") {
            return null;
        }

        if (idUserProfile !== this.cachedIdProfile) { 
            this.Libelle = null;
            this.cachedIdProfile = idUserProfile;
            for (let key in UserProfile) {
                if (key == idUserProfile.toString()) {
                    this.translate.get("profiles").subscribe(profile => {
                        const Libelle = UserProfile[parseInt(key)];
                        this.Libelle = profile[Libelle];
                    });
                }
            }
        }

        return this.Libelle;
    }

}

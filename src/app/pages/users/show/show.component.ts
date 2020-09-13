import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UtilisateurService } from 'app/services/users/user.service';
import { User } from 'app/Models/Entities/User';
import { Contact } from 'app/Models/Entities/Contact';
import { Historique } from 'app/Models/Entities/Historique';
import { AppSettings } from 'app/app-settings/app-settings';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-show',
    templateUrl: './show.component.html',
    styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {

    id;
    user: User;
    historique: Historique[] = [];

    constructor(private utilisateurService: UtilisateurService, private route: ActivatedRoute, private translate: TranslateService) { }

    ngOnInit() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        this.route.params.subscribe(params => {
            this.id = params['id'];
            this.utilisateurService.Get(this.id).subscribe(
                value => {
                    this.user = value;
                    this.historique = JSON.parse(this.user.historique) as Historique[];
                }
            )
        });
    }

}

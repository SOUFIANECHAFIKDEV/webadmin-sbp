import { Component, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';

@Component({
  selector: 'historique-emails',
  templateUrl: './historique-email.component.html',
  styleUrls: ['./historique-email.component.scss']
})
export class HistoriqueEmailComponent  {
  constructor( private translate: TranslateService,){
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

  }
  @Input('emails') emails:any[] = [];
}

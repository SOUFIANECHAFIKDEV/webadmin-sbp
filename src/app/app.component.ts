import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from './app-settings/app-settings';
import { NgbTooltip } from '@ng-bootstrap/ng-bootstrap';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html'
})
export class AppComponent {
    constructor(private translate: TranslateService) {
        translate.setDefaultLang('fr');
        translate.use(AppSettings.lang)
    }
}
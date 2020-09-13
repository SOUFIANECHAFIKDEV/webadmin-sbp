import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { AppSettings } from 'app/app-settings/app-settings';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
declare var toastr: any;

@Component({
    selector: 'app-tva-config',
    templateUrl: './tva.component.html',
    styleUrls: ['./tva.component.scss']
})
export class TvaComponent implements OnInit {
    form: any;
    loading
    constructor(
        private translate: TranslateService,
        private fb: FormBuilder,
        private parameteresService?: ParameteresService) {
        this.form = this.fb.group({
            tvaDefaut: ['']
        })
    }

    ngOnInit() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        this.GetParametrageTva();
    }

    GetParametrageTva() {
        this.parameteresService.Get(TypeParametrage.tva).subscribe(res => {
            
            const data = JSON.parse(res.contenu);
            this.form.controls['tvaDefaut'].setValue(data['tvaDefaut']);
        });
    }
    update() {
        const tvaDefaut = this.form.value.tvaDefaut;
        this.parameteresService.Update(TypeParametrage.tva, JSON.stringify({ tvaDefaut })).subscribe(res => {
            this.translate.get("labels").subscribe(text => {
                toastr.success("", text.modifierSuccess, {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
            });
            this.GetParametrageTva();
        })
    }
}
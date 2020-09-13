import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { AppSettings } from 'app/app-settings/app-settings';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
declare var toastr: any;

@Component({
    selector: 'app-numerotation-prefixe',
    templateUrl: './prix.component.html',
    styleUrls: ['./prix.component.scss']
})
export class PrixComponent implements OnInit {
    form: any;
    loading
    constructor(
        private translate: TranslateService,
        private fb: FormBuilder,
        private parameteresService?: ParameteresService) {
        this.form = this.fb.group({
            prixVente: [''],
            prixAchat: [''],
            coutPanier: [''],
            coutDeplacement: ['']
        })
    }

    ngOnInit() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        this.GetParametragePrix();
    }

    GetParametragePrix() {
        this.parameteresService.Get(TypeParametrage.prix).subscribe(res => {
            const data = JSON.parse(res.contenu);
            this.form.controls['prixVente'].setValue(data['prixVente']);
            this.form.controls['prixAchat'].setValue(data['prixAchat']);
            this.form.controls['coutPanier'].setValue(data['coutPanier']);
            this.form.controls['coutDeplacement'].setValue(data['coutDeplacement']);

        });
    }
    update() {
        const prixVente = this.form.value.prixVente;
        const prixAchat = this.form.value.prixAchat;
        const coutPanier = this.form.value.coutPanier;
        const coutDeplacement = this.form.value.coutDeplacement;
        this.parameteresService.Update(TypeParametrage.prix, JSON.stringify({ prixVente, prixAchat, coutPanier, coutDeplacement })).subscribe(res => {
            this.translate.get("labels").subscribe(text => {
                toastr.success("", text.modifierSuccess, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            });
            this.GetParametragePrix();
        })
    }
}
import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ParametrageCompteService } from 'app/services/parametragecompte/parametrage-compte.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { ParametrageCompte } from 'app/Models/Entities/ParametrageCompte';
import { TranslateService } from '@ngx-translate/core';
import { PaiementService } from 'app/services/paiement/paiement.service';
import { Historique } from 'app/Models/Entities/Historique';
import { LoginService } from 'app/services/login/login.service';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { ModereglementService } from 'app/services/modereglement/modereglement.service';
import { Modereglement } from 'app/Models/Entities/Modereglement';
import { StaticModeReglement } from 'app/Enums/StaticModeReglement.Enum';

declare var toastr: any;
declare var jQuery: any;

@Component({
  selector: 'mouvement-compte',
  templateUrl: './mouvement-compte.component.html',
  styleUrls: ['./mouvement-compte.component.scss']
})
export class MouvementCompteComponent implements OnInit {

  form
  comptes: ParametrageCompte[] = null
  @Output("refresh") refresh = new EventEmitter();
  loading = false;
  actionHistorique = new ActionHistorique()
  dateLang
  constructor(
    private fb: FormBuilder,
    private parametrageCompteService: ParametrageCompteService,
    private translate: TranslateService,
    private paiementService: PaiementService,
    private modereglementService: ModereglementService,
    private loginService: LoginService
  ) {
    this.form = this.fb.group({
      "montant": [null, [Validators.required]],
      "idCompteDebit": [null, [Validators.required]],
      "idCompteCredit": [null, [Validators.required]],
      "datePaiement": [new Date(), [Validators.required]],
      "idModePaiement": [null, [Validators.required]],
    })
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });

  }

  modesRegelement: Modereglement[] = null;
  // Récuperer la liste des modes régelements
  GetModeRegelement(search) {
    if (this.modesRegelement == null) {
      this.modereglementService.GetAll(search, 1, AppSettings.MAX_GET_DATA, "nom", "asc")
        .subscribe(
          res => {
            this.modesRegelement = res.list.filter(x => x.id != StaticModeReglement.Avoir)
          }
        )
    }
  }

  // Récuperer la liste des comptes
  GetCompte(search) {
    if (this.comptes == null) {
      this.parametrageCompteService.GetAll(search, 1, AppSettings.MAX_GET_DATA, "nom", "asc")
        .subscribe(res => {
          this.comptes = res.list
        })
    }
  }

  // Get information de form
  get f() { return this.form.controls; }

  saveMovement() {
    if (this.form.valid) {
      let values = this.form.value;
      values["datePaiement"] = AppSettings.formaterDatetime(values["datePaiement"]);
      values["idModePaiement"] = values["idModePaiement"];

      if (values["idCompteDebit"] == values["idCompteCredit"]) {
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.memeCompte, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
      } else if (values["montant"] <= 0) {
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.montantNegative, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
      } else {
        this.loading = true;
        //historique
        let historique = new Historique();
        historique.IdUser = this.loginService.getUser().id;
        historique.action = this.actionHistorique.Added;
        debugger
        this.paiementService.MovementCompteACompte(values["idCompteDebit"], values["idCompteCredit"], values["montant"], values["datePaiement"], values["idModePaiement"], JSON.stringify([historique]))
          .subscribe(res => {
            this.loading = false;
            if (res) {
              this.translate.get("list").subscribe(text => {
                this.form.reset();
                this.form.controls["datePaiement"].setValue(new Date());
                jQuery("#mouvementCompte").modal("hide")
                this.refresh.emit("")
              })
            }
          }, err => {
            this.loading = false;
            this.translate.get("errors").subscribe(text => {
              toastr.warning(text.errorServer, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            });
          })
      }
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

}

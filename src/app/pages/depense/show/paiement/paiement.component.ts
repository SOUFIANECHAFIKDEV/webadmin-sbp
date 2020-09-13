import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Depense } from 'app/Models/Entities/depense';
import { Modereglement } from 'app/Models/Entities/Modereglement';
import { ParametrageCompte } from 'app/Models/Entities/ParametrageCompte';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { StatutDepense } from 'app/Enums/StatutDepense.Enum';
import { TypePaiement } from 'app/Enums/TypePaiement.Enum';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { StaticModeReglement } from 'app/Enums/StaticModeReglement.Enum';
import { ICalcule } from 'app/calcule/ICalcule';
import { Calcule } from 'app/calcule/Calcule';
import { FactureReferenceModel } from 'app/Models/FactureReferenceModel';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginService } from 'app/services/login/login.service';
import { TranslateService } from '@ngx-translate/core';
import { ModereglementService } from 'app/services/modereglement/modereglement.service';
import { ParametrageCompteService } from 'app/services/parametragecompte/parametrage-compte.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { PaiementService } from 'app/services/paiement/paiement.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Paiement } from 'app/Models/Entities/Paiement';
import { Historique } from 'app/Models/Entities/Historique';
import { Avoir } from 'app/Models/Entities/Avoir';
import { TypeCompte } from 'app/Enums/TypeCompte.enum';
import { StatutComptabilise } from 'app/Enums/StatutComptabilise.enum';

declare var toastr: any;
declare var jQuery: any;
declare var swal: any;

@Component({
  selector: 'paiement-depense',
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.scss']
})
export class PaiementComponent implements OnInit {
  @Output() refresh = new EventEmitter();
  @Input() depense: Depense;
  form;
  dateLang; // translate datepicker
  modesRegelement: Modereglement[] = [];
  comptes: ParametrageCompte[] = [];
  actionHistorique: ActionHistorique = new ActionHistorique();
  loading = false;
  indexModified;

  statutDepense: typeof StatutDepense = StatutDepense;
  statutComptabilise: typeof StatutComptabilise = StatutComptabilise;
  typePaiement: typeof TypePaiement = TypePaiement;
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  staticModeReglement: typeof StaticModeReglement = StaticModeReglement;
  calcule: ICalcule = new Calcule();
  reference: FactureReferenceModel;
  CheckValidPrice: any;


  constructor(
    private fb?: FormBuilder,
    private loginService?: LoginService,
    private translate?: TranslateService,
    private modereglementService?: ModereglementService,
    private parametrageCompteService?: ParametrageCompteService,
    private paramteresService?: ParameteresService,
    private paiementService?: PaiementService
  ) {
    this.form = this.fb.group({
      //  "montant": [null, [Validators.required], this.CheckValidPrice.bind(this)],
      "montant": [null, [Validators.required]],

      "idCaisse": [null, [Validators.required]],
      "datePaiement": [null, [Validators.required]],
      "idModePaiement": [null, [Validators.required]],
      "description": [null],
      "createAvoir": [false]
    })
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });

    //this.GetCompte("")
    //this.GetModeRegelement("")

  }
  /**
   * 
   * Récuperer la liste des modes régelements
   */
  GetModeRegelement(search) {
    this.modereglementService.GetAll(search, 1, AppSettings.MAX_GET_DATA, "nom", "asc")
      .subscribe(
        res => {
          this.modesRegelement = res.list
        }
      )
  }
  /**
   * 
   * Récuperer la liste des comptes
   */
  GetCompte(search) {
    this.parametrageCompteService.GetAll(search, 1, AppSettings.MAX_GET_DATA, "nom", "asc")
      .subscribe(res => {
        this.comptes = res.list
      })
  }
  /**
   * Charger & clear form ajouter
   */
  chargeLists() {
    this.form.reset()
    this.indexModified = null;
    this.form.controls["description"].setValue("Paiement dépense N° " + this.depense.reference)
    this.form.controls["montant"].setValue(AppSettings.formaterNumber(this.getResterPayer()))
    this.form.controls["datePaiement"].setValue(new Date())
  }
  // Get information de form
  get f() { return this.form.controls; }


  // Calculate reste à payer
  MontantRest
  getResterPayer() {
    if (this.depense && this.depense.total != undefined && this.depense.paiements != undefined) {
      this.MontantRest = this.depense.total ? this.depense.total - this.depense.paiements.reduce((x, y) => x + y.montant, 0) : 0;

      //return this.depense.total - this.depense.paiements.reduce((x, y) => x + y.montant, 0)
      return this.MontantRest;
    } else {
      return 0;
    }
  }
  CompareMontantInDb(montant: number, montantInDB: number) {

    const reste = montant - montantInDB;
    return (reste > 0 && reste < 0.01) ? montantInDB : montant
  }

  // Ajouter payement
  async savePaiement() {

    if (this.form.valid) {
      let values = this.form.value;
      values["datePaiement"] = AppSettings.formaterDatetime(values["datePaiement"]);
      values = AppSettings.ConvertEmptyValueToNull(values);

      let paiement: Paiement = values;
      // paiement.comptabilise = StatutComptabilise.Non
      paiement.type = TypePaiement.PAYER
      paiement.historique = this.getHistorique()
      //let facturePaiement = new FacturePaiement()
      paiement.idDepense = this.depense.id
      paiement.montant = this.CompareMontantInDb(values['montant'], this.getResterPayer());
      if (values["idModePaiement"] == StaticModeReglement.Avoir) {
        paiement.type = TypePaiement.PAR_AVOIR;
      }

      this.paiementService.Add(paiement).subscribe(res => {

        if (res) {
          this.successfulAdd(res.avoir)
        } else {
          this.errorMontantIncorrect()
        }
      }, err => {
        this.errorServer()
      })
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAllPaiement, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }
  /**
   * 
   * Paiemenet par avoir  
   */
  createPaiementAvoir(avoir: Avoir) {
    this.loading = true;
    let paiement = new Paiement();
    paiement.montant = avoir.total * (-1);
    paiement.datePaiement = new Date(AppSettings.formaterDatetime(new Date().toString()))
    paiement.description = "Paiement depense N° " + this.depense.reference
    paiement.historique = this.getHistorique()
    paiement.idModePaiement = this.staticModeReglement.Avoir
    paiement.idDepense = this.depense.id
    paiement.idAvoir = avoir.id
    paiement.type = TypePaiement.PAR_AVOIR;
    this.paiementService.Add(paiement).subscribe(
      value => {
        this.loading = false;
        if (value) {
          this.refresh.emit("")
          this.successfulAdd()
        } else {
          this.errorMontantIncorrect()
        }
      }, err => {
        this.loading = false,
          this.errorServer()
      }
    )
  }
  onChangeMoyenPaiement(value) {

    if (value == StaticModeReglement.Avoir) {
      this.form.controls['idCaisse'].setValue(null)
      this.form.controls['idCaisse'].setValidators([])
      this.form.controls['idCaisse'].updateValueAndValidity()
    } else if (value == StaticModeReglement.Espece) {
      var caisse = this.comptes.filter(x => x.type == TypeCompte.caisse)[0];
      if (caisse != null) {
        this.form.controls['idCaisse'].setValue(caisse.id.toString())
      }
    } else {
      this.form.controls['idCaisse'].setValidators([Validators.required])
      this.form.controls['idCaisse'].updateValueAndValidity()
    }
  }

  // supprimer paiement
  removePaiement(index) {
    // let paiement = this.facture.facturePaiements[index].paiement;
    let paiement = this.depense.paiements[index];
    this.translate.get("paiement.delete").subscribe(text => {
      swal({
        title: text.title,
        text: (paiement.type == TypePaiement.PAYER_GROUPE ? text.questionGroupe : (paiement.type == TypePaiement.PAR_AVOIR ? text.questionAvoirDelete : text.question)),
        icon: "warning",
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: "",
            closeModal: true
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: "",
            closeModal: true
          }
        }
      }).then(isConfirm => {
        if (isConfirm) {

          this.loading = true;
          this.paiementService.Delete(paiement.id).subscribe(res => {
            if (res) {
              this.loading = false;
              swal(text.success, "", "success");
              this.refresh.emit("")
            }
          }, err => {
            this.loading = false;
            swal(text.failed, "", "warning");
          })
        } else {
          toastr.success(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        }
      });
    });
  }



  // get historique
  getHistorique() {
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    return JSON.stringify([historique]);
  }
  // Successful ajoute
  successfulAdd(avoir?: Avoir) {
    this.refresh.emit("")
    this.translate.get("paiement").subscribe(text => {
      jQuery("#ajouterPaiement").modal("hide");
      toastr.success(text.success, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      if (avoir != null && avoir.id != null) {
        toastr.success(text.avoirCreated + avoir.reference, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      }
    })
  }

  // Error server
  errorServer() {

    this.translate.get("errors").subscribe(text => {
      toastr.warning(text.errorServer, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
    })
  }

  // Montant incorrect
  errorMontantIncorrect() {

    this.translate.get("errors").subscribe(text => {
      toastr.warning(text.invalid, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      //setTimeout(() => { location.reload(); }, 1000)
    })
  }

  // Charger les données dans la form de modification
  chargerModifierPaiement(index) {
    this.GetCompte('');
    this.GetModeRegelement('');
    this.indexModified = index;
    let paiement = this.depense.paiements[index];
    this.form.controls["description"].setValue(paiement.description)
    this.form.controls["montant"].setValue(AppSettings.formaterNumber(paiement.montant))
    this.form.controls["idCaisse"].setValue(paiement.idCaisse.toString())
    this.form.controls["idModePaiement"].setValue(paiement.idModePaiement.toString())
    var datePaiement = new Date(paiement.datePaiement.toString())
    this.form.controls["datePaiement"].setValue(datePaiement)
    jQuery("#ajouterPaiement").modal("show");
  }

  // Mettre à jour paiement
  modifierPaiement() {
    if (this.form.valid) {
      this.loading = true

      let paiementSelected = this.depense.paiements[this.indexModified]

      let values = this.form.value;
      values["datePaiement"] = AppSettings.formaterDatetime(values["datePaiement"]);
      values = AppSettings.ConvertEmptyValueToNull(values);

      let paiement: Paiement = values;
      paiement.id = paiementSelected.id
      paiement.comptabilise = paiementSelected.comptabilise
      paiement.historique = paiementSelected.historique
      paiement.type = paiementSelected.type


      paiement.montant = paiement.montant;
      paiement.idDepense = paiementSelected.idDepense;


      this.paiementService.Update(paiement.id, paiement).subscribe(
        res => {
          this.loading = false;
          if (res) {
            this.refresh.emit("")
            this.translate.get("paiement").subscribe(text => {
              jQuery("#ajouterPaiement").modal("hide");
              toastr.success(text.modifierSuccess, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            })
          } else {
            this.errorMontantIncorrect()
          }
        },
        err => {
          this.loading = false;
          this.translate.get("errors").subscribe(text => {
            toastr.warning(text.errorServer, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          })
        }
      )
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAllPaiement, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }


}

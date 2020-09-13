import { Component, OnInit, Output, EventEmitter, Input } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { ModereglementService } from "app/services/modereglement/modereglement.service";
import { Modereglement } from "app/Models/Entities/Modereglement";
import { ParametrageCompte } from "app/Models/Entities/ParametrageCompte";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { Paiement } from "app/Models/Entities/Paiement";
import { Historique } from "app/Models/Entities/Historique";
import { LoginService } from "app/services/login/login.service";
import { ActionHistorique } from "app/Enums/ActionHistorique.Enum";
import { PaiementService } from "app/services/paiement/paiement.service";
import { Facture } from "app/Models/Entities/Facture";
import { StatutFacture } from "app/Enums/StatutFacture.Enum";
import { FacturePaiement } from "app/Models/Entities/FacturePaiement";
import { Avoir } from "app/Models/Entities/Avoir";
import { StatutAvoir } from "app/Enums/StatutAvoir.Enum";
import { Calcule } from "app/calcule/Calcule";
import { ICalcule } from "app/calcule/ICalcule";
import { TypePaiement } from "app/Enums/TypePaiement.Enum";
import { StaticModeReglement } from "app/Enums/StaticModeReglement.Enum";
import { ParametrageCompteService } from "app/services/parametragecompte/parametrage-compte.service";
import { TypeCompte } from "app/Enums/TypeCompte.enum";
import { FactureReferenceModel } from "app/Models/FactureReferenceModel";
import { ParameteresService } from "app/services/parameteres/parameteres.service";
import { TypeNumerotation } from "app/Enums/TypeNumerotation.Enum";
import { PrestationsModule, Data } from "app/Models/Entities/Lots";
import { StatutComptabilise } from "app/Enums/StatutComptabilise.enum";
import { StatutChantier } from "app/Enums/StatutChantier.Enum";
import { ChantierService } from "app/services/chantier/chantier.service";

declare var toastr: any;
declare var jQuery: any;
declare var swal: any;

@Component({
  selector: "paiement-facture",
  templateUrl: "./paiement.component.html",
  styleUrls: ["./paiement.component.scss"]
})
export class PaiementComponent implements OnInit {
  @Output() refresh = new EventEmitter();
  @Input() facture: Facture;
  form;
  dateLang; // translate datepicker
  modesRegelement: Modereglement[] = null;
  comptes: ParametrageCompte[] = null;
  actionHistorique: ActionHistorique = new ActionHistorique();
  loading = false;
  indexModified;
  statutFacture: typeof StatutFacture = StatutFacture;
  statutComptabilise: typeof StatutComptabilise = StatutComptabilise

  typePaiement: typeof TypePaiement = TypePaiement;
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  staticModeReglement: typeof StaticModeReglement = StaticModeReglement;
  calcule: ICalcule = new Calcule();
  reference: FactureReferenceModel;
  initAvoir = false;
  constructor(
    private fb?: FormBuilder,
    private loginService?: LoginService,
    private translate?: TranslateService,
    private modereglementService?: ModereglementService,
    private parametrageCompteService?: ParametrageCompteService,
    private paramteresService?: ParameteresService,
    private chantierService?: ChantierService,
    private paiementService?: PaiementService
  ) {
    this.form = this.fb.group({
      "montant": [null, [Validators.required], this.CheckValidPrice.bind(this)],
      "idCaisse": [null, [Validators.required]],
      "datePaiement": [null, [Validators.required]],
      "idModePaiement": [null, [Validators.required]],
      "description": [null],
      "createAvoir": [false]
    })
  }
  ngOnInit(): void {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
    // this.GetCompte("");
    // this.GetModeRegelement("");
  }
  // Récuperer la liste des modes régelements
  GetModeRegelement(search) {
    if (this.modesRegelement == null) {
      this.modereglementService.GetAll(search, 1, AppSettings.MAX_GET_DATA, "nom", "asc")
        .subscribe(
          res => {
            this.modesRegelement = res.list
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
  // Charger & clear form ajouter
  chargeLists() {
    this.GetCompte("");
    this.GetModeRegelement("");
    this.form.reset()
    this.indexModified = null;
    this.form.controls["description"].setValue("Paiement facture N° " + this.facture.reference)
    this.form.controls["montant"].setValue(AppSettings.formaterNumber(this.getResterPayer()))
    this.form.controls["datePaiement"].setValue(new Date());
  }

  // Get information de form
  get f() { return this.form.controls; }

  restPaye
  // Calculate reste à payer
  getResterPayer() {
    if (this.facture && this.facture.total != undefined && this.facture.facturePaiements != undefined) {
      this.restPaye = this.facture.total - this.facture.facturePaiements.reduce((x, y) => x + y.montant, 0)
      return this.restPaye;
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

      this.loading = true;
      let values = this.form.value;
      values["datePaiement"] = AppSettings.formaterDatetime(values["datePaiement"]);
      values = AppSettings.ConvertEmptyValueToNull(values);

      let paiement: Paiement = values;
      paiement.comptabilise = StatutComptabilise.Non
      paiement.type = TypePaiement.PAYER
      paiement.historique = this.getHistorique()
      let facturePaiement = new FacturePaiement()
      facturePaiement.idFacture = this.facture.id
      facturePaiement.montant = this.CompareMontantInDb(values['montant'], this.getResterPayer());
      paiement.facturePaiements = [facturePaiement]
      if (values["idModePaiement"] == StaticModeReglement.Avoir) {
        paiement.type = TypePaiement.PAR_AVOIR;
        paiement.avoir = await this.createAvoir(this.facture, values['montant']);
      }
      paiement.montant = this.CompareMontantInDb(values['montant'], this.getResterPayer());

      this.paiementService.Add(paiement).subscribe(res => {
        this.loading = false;
        if (res) {
          this.successfulAdd(res.avoir)
        } else {
          this.errorMontantIncorrect()
        }
      }, err => {
        this.loading = false;
        this.errorServer()
      })
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAllPaiement, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }
  // supprimer paiement
  removePaiement(index) {
    let paiement = this.facture.facturePaiements[index].paiement;
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
              if (this.facture.status == this.statutFacture.Cloture && this.facture.chantier.statut == StatutChantier.Termine) {
                this.retourStatutChantier(this.facture)
              } else {
                this.refresh.emit("")
              }
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

  retourStatutChantier(facture: Facture) {

    //this.chantierService.changeStatut({idChantier : facture.chantier.id,statutChantier : StatutChantier.Accepte  })
    this.translate.get("paiement.retourChantier").subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
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
        debugger
        if (isConfirm) {
          debugger
          this.loading = true;
          this.chantierService.changeStatut({ idChantier: facture.chantier.id, statutChantier: StatutChantier.Accepte }).subscribe(res => {
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
          this.refresh.emit("")
          toastr.success(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        }
      });
    });
  }


  // Charger les données dans la form de modification
  chargerModifierPaiement(index) {
    debugger
    this.GetCompte('');
    this.GetModeRegelement('');
    this.indexModified = index;
    let paiement = this.facture.facturePaiements[index]
    this.form.controls["description"].setValue(paiement.paiement.description)
    this.form.controls["montant"].setValue(AppSettings.formaterNumber(paiement.paiement.montant))
    this.form.controls["idCaisse"].setValue(paiement.paiement.idCaisse.toString())
    this.form.controls["idModePaiement"].setValue(paiement.paiement.idModePaiement.toString())
    var datePaiement = new Date(paiement.paiement.datePaiement.toString())
    this.form.controls["datePaiement"].setValue(datePaiement)
    jQuery("#ajouterPaiement").modal("show");
  }

  // Mettre à jour paiement
  modifierPaiement() {
    if (this.form.valid) {
      this.loading = true

      let paiementSelected = this.facture.facturePaiements[this.indexModified]

      let values = this.form.value;
      values["datePaiement"] = AppSettings.formaterDatetime(values["datePaiement"]);
      values = AppSettings.ConvertEmptyValueToNull(values);

      let paiement: Paiement = values;
      paiement.id = paiementSelected.paiement.id
      paiement.comptabilise = paiementSelected.paiement.comptabilise
      paiement.historique = paiementSelected.paiement.historique
      paiement.type = paiementSelected.paiement.type
      paiement.idSociete = paiementSelected.paiement.idSociete

      paiementSelected.montant = paiement.montant;
      paiement.facturePaiements = [paiementSelected];

      this.paiementService.Update(paiementSelected.paiement.id, paiement).subscribe(
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


  // Vérifier si la valeur de montant saisi est valide
  CheckValidPrice(control: FormControl) {
    let montant = parseFloat(control.value)
    if (montant > 0) {
      let promise = new Promise((resolve, reject) => {
        let montantPaiementModifier = this.indexModified != null ? this.facture.facturePaiements[this.indexModified].montant : 0
        let resPayer = montantPaiementModifier + this.facture.total - this.facture.facturePaiements.reduce((x, y) => x + y.montant, 0);
        if (AppSettings.formaterNumber(montant) <= AppSettings.formaterNumber(resPayer)) {
          resolve(null)
        } else {
          resolve({ CheckValidPrice: true })
        }
      });
      return promise;
    } else {
      let promise = new Promise((resolve, reject) => { resolve({ CheckValidPrice: true }) });
      return promise;
    }
  }


  /**
 * return a reference for the new insertion
 */


  generateReferenceAvoir(): Promise<string> {

    return new Promise((reslove, reject) => {
      this.paramteresService.Generate(this.typeNumerotation.avoir as number).subscribe(
        res => {
          reslove(res['data'] as string);
        },
        err => {
          reject(err);
        }
      );
    });

  }

  // Creation avoir
  async createAvoir(facture: Facture, montant) {
    let avoir: Avoir = new Avoir();
    avoir.dateCreation = new Date();
    avoir.dateEcheance = facture.dateEcheance;
    avoir.status = StatutAvoir.Utilise;
    avoir.reference = await this.generateReferenceAvoir();
    avoir.idChantier = facture.idChantier
    avoir.total = montant * (-1);
    avoir.totalHt = montant * (-1);
    avoir.tva = '[]';
    avoir.remise = 0;
    avoir.tvaGlobal = null;
    avoir.typeRemise = '€'
    avoir.puc = 0,
      avoir.retenueGarantie = 0
    avoir.prorata = 0;
    avoir.infoClient = facture.idClient;
    avoir.infoClient = facture.infoClient;


    //Prestations
    let article = new PrestationsModule()
    article.qte = 1
    article.type = 1
    article.data = new Data();
    article.data.prixHt = montant * (-1);
    article.data.nom = "Paiement par avoir de la facture " + facture.reference
    article.data.designation = "Paiement par avoir de la facture " + facture.reference
    article.data.tva = 0;
    article.remise = 0
    article.data.typeRemise = '€'
    article.data.totalHT = montant * (-1);
    article.data.totalTTC = montant * (-1);
    article.data.cout_vente = 0;
    article.data.cout_materiel = 0;
    article.data.nomber_heure = 0;
    avoir.prestations = JSON.stringify([article]);
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    avoir.historique = JSON.stringify([historique]);
    avoir.memos = JSON.stringify([]);
    avoir.remise = 0
    avoir.typeRemise = facture.typeRemise
    avoir.object = facture.object
    avoir.conditionRegelement = facture.conditionRegelement;
    avoir.note = facture.note
    return avoir;
  }

  // Paiement par avoir 
  createPaiementAvoir(avoir: Avoir) {

    this.loading = true;
    let paiement = new Paiement()
    paiement.montant = avoir.total * (-1);
    paiement.datePaiement = new Date(AppSettings.formaterDatetime(new Date().toString()))
    paiement.description = "Paiement facture N° " + this.facture.reference
    paiement.historique = this.getHistorique()
    paiement.idModePaiement = StaticModeReglement.Avoir
    paiement.comptabilise = StatutComptabilise.Non

    let facturePaiement = new FacturePaiement()
    facturePaiement.idFacture = this.facture.id
    facturePaiement.montant = avoir.total * (-1)
    paiement.facturePaiements = [facturePaiement]

    paiement.type = TypePaiement.PAR_AVOIR
    paiement.idAvoir = avoir.id

    this.paiementService.Add(paiement).subscribe(value => {
      this.loading = false;
      if (value) {
        this.refresh.emit("")
        this.successfulAdd()
      }
      else {
        this.errorMontantIncorrect()
      }
    }, err => {
      this.loading = false;
      this.errorServer()
    });

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
      setTimeout(() => { location.reload(); }, 1000)
    })
  }

  // get historique
  getHistorique() {
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    return JSON.stringify([historique]);
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


}

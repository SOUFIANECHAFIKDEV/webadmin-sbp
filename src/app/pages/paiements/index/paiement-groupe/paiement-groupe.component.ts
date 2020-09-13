import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FactureService } from 'app/services/facture/facture.service';
import { Facture } from 'app/Models/Entities/Facture';
import { AppSettings } from 'app/app-settings/app-settings';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModereglementService } from 'app/services/modereglement/modereglement.service';
import { ParametrageCompteService } from 'app/services/parametragecompte/parametrage-compte.service';
import { Modereglement } from 'app/Models/Entities/Modereglement';
import { ParametrageCompte } from 'app/Models/Entities/ParametrageCompte';
import { Paiement } from 'app/Models/Entities/Paiement';
import { TypePaiement } from 'app/Enums/TypePaiement.Enum';
import { Historique } from 'app/Models/Entities/Historique';
import { LoginService } from 'app/services/login/login.service';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { PaiementService } from 'app/services/paiement/paiement.service';
import { FacturePaiement } from 'app/Models/Entities/FacturePaiement';
import { StaticModeReglement } from 'app/Enums/StaticModeReglement.Enum';
import { TypeCompte } from 'app/Enums/TypeCompte.enum';
import { ClientService } from 'app/services/client/client.service';
import { Client } from 'app/Models/Entities/Client';


declare var toastr: any;
declare var jQuery: any;

@Component({
  selector: 'paiement-groupe',
  templateUrl: './paiement-groupe.component.html',
  styleUrls: ['./paiement-groupe.component.scss']
})
export class PaiementGroupeComponent implements OnInit {

  @Output("refresh") refresh = new EventEmitter();

  // Ajouter paiement
  form
  modesRegelement: Modereglement[] = null;
  comptes: ParametrageCompte[] = null;
  paiement: Paiement
  actionHistorique = new ActionHistorique()
  dateLang
  isClient = true;



  // choix de client
  idClient;
  idChantier
  // choix franchisé


  // choix des factures
  search = ""
  factures: Facture[] = []
  finished = true;
  page = 1;
  totalPages = 0;
  montant = 0;
  totalMontantFacture = 0

  loading = false;
  clients: Client[] = []
  constructor(
    private fb?: FormBuilder,
    private factureService?: FactureService,
    private translate?: TranslateService,
    private modereglementService?: ModereglementService,
    private parametrageCompteService?: ParametrageCompteService,
    private loginService?: LoginService,
    private clientService?: ClientService,
    private paiementService?: PaiementService
  ) {
    this.form = this.fb.group({
      "montant": [null, [Validators.required]],
      "idCaisse": [null, [Validators.required]],
      "datePaiement": [new Date(), [Validators.required]],
      "idModePaiement": [null, [Validators.required]],
      "description": ["Paiement factures"],
    })
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
  }

  /**
  * Pour Récupérer la liste des Clients
  */
  getClients(search) {
    this.clientService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc").subscribe((res) => {
      this.clients = res.list;
    });

  }

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

  // Save paiement
  savePaiement() {
    if (this.form.valid) {
      let values = this.form.value;
      values["datePaiement"] = AppSettings.formaterDatetime(values["datePaiement"]);
      values = AppSettings.ConvertEmptyValueToNull(values);
      this.paiement = values;
      this.paiement.comptabilise = 0;
      this.paiement.type = TypePaiement.PAYER_GROUPE
      let historique = new Historique();
      historique.IdUser = this.loginService.getUser().id;
      historique.action = this.actionHistorique.Added;
      this.paiement.historique = JSON.stringify([historique])
      this.paiement.facturePaiements = []
      this.montant = this.paiement.montant
      this.idChantier = null
      jQuery("#choixClient").modal("show")
      jQuery("#ajouterPaiement").modal("hide")

    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }
  /**
   * 
   * @param info choisir chantier
   */

  // choisirChantier(info: { idChantier: number, idFournisseur: number }): void {
  //   this.idChantier = info.idChantier;
  //   this.factures = []
  //   this.GetFactures()
  //   jQuery("#choixFacture").modal("show")

  // }

  choisirClient(id) {
    this.idClient = id;
    console.log("idClient", this.idClient)
    this.factures = []
    this.GetFactures()
    jQuery("#choixFacture").modal("show")
  }
  /**
   * Liste des facture par chantier
   */
  GetFactures() {

    this.factureService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, 'dateEcheance', 'asc', [StatutFacture.Encours, StatutFacture.Enretard], null, null, null, this.idClient)
      .subscribe(res => {
        this.totalPages = res.totalPages
        let newFactures = res.list.filter(value => this.factures.filter(x => x.id == value.id).length == 0);
        newFactures.forEach(
          item => {
            let restPayer = this.getResterPayer(item.total, item.facturePaiements);
            let totalFacture = this.totalMontant();
            let restMontant = AppSettings.formaterNumber(this.montant) - AppSettings.formaterNumber(totalFacture)
            if (restMontant > 0) {
              item["montant"] = (AppSettings.formaterNumber(restMontant) - AppSettings.formaterNumber(restPayer) < 0 ? restMontant : restPayer)
              item["checked"] = true
            }
            this.factures.push(item);
          }
        )
      })
  }

  // Calcule reste à payer aprés l'ajoute de montant 
  getResterPayer(total, facturePaiements, montant = 0) {
    if (total != null && facturePaiements != null) {
      return total - facturePaiements.reduce((x, y) => x + y.montant, 0) - montant
    } else {
      return 0;
    }
  }

  // Recherche dans les factures
  searchFacture() {
    this.factures = this.factures.filter(x => x["checked"] == true)
    this.page = 1;
    this.totalPages = 0;
    this.GetFactures()
  }

  // Event scroll dans la liste des factures
  onScroll() {
    this.finished = false;
    if (this.totalPages <= this.page) {
      this.finished = true;
    } else {
      this.page++;
      this.GetFactures();
    }
  }

  // calcule total des montants des factures selectioné
  totalMontant() {
    return this.factures.reduce((x, y) => x + (y['montant'] == null ? 0 : y['montant']), 0)
  }

  // Vérifier si la montant saisir dans facture est valide 
  checkValidMontant(index) {
    let facture = this.factures[index];
    if (facture['montant'] == null || facture['montant'] <= 0 || AppSettings.formaterNumber(this.getResterPayer(facture.total, facture.facturePaiements, facture['montant'])) < 0) {
      this.factures[index]['invalid'] = true;
      return true;
    }
    this.factures[index]['invalid'] = false;
    return false;
  }

  // Sauvgarder facture
  save() {
    let factureSelectione = this.factures.filter(x => x['checked']);
    if (factureSelectione.filter(x => x['invalid']).length > 0) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    } else if (AppSettings.formaterNumber(this.totalMontant()) > AppSettings.formaterNumber(this.montant)) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.montantSup, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    } else if (AppSettings.formaterNumber(this.totalMontant()) < AppSettings.formaterNumber(this.montant)) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.montantInf, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    } else if (AppSettings.formaterNumber(this.totalMontant()) == AppSettings.formaterNumber(this.montant)) {
      this.loading = true;
      factureSelectione.forEach(facture => {
        let facturePaiement = new FacturePaiement()
        facturePaiement.idFacture = facture.id
        facturePaiement.montant = facture['montant']
        this.paiement.facturePaiements.push(facturePaiement)
      })
      this.paiementService.Add(this.paiement).subscribe(res => {
        this.loading = false;
        if (res) {
          this.translate.get("list").subscribe(text => {
            this.form.reset();
            this.form.controls["datePaiement"].setValue(new Date());
            toastr.success(text.success, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            jQuery("#choixFacture").modal("hide")
            this.refresh.emit("")
          })
        } else {
          this.errorMontantIncorrect()
        }
      }, err => {
        this.loading = false;
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.errorServer, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      })
    }
  }

  onChangeMoyenPaiement(value) {
    if (value == StaticModeReglement.Espece) {
      var caisse = this.comptes.filter(x => x.type == TypeCompte.caisse)[0];
      if (caisse != null) {
        this.form.controls['idCaisse'].setValue(caisse.id.toString())
      }
    }
  }


  // Montant incorrect
  errorMontantIncorrect() {
    this.translate.get("errors").subscribe(text => {
      toastr.warning(text.montantNegative, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      setTimeout(() => { location.reload(); }, 1000)
    })
  }


  onFactureCheck(isChecked: boolean, indexFacture: number): void {
    // onFactureCheck
    if (isChecked == true) {
      this.factures[indexFacture]['montant'] = 0;
    }
  }

}

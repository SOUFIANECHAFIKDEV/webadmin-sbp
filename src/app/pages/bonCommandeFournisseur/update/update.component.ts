import { Component, OnInit, ViewChild } from '@angular/core';
import { TableArticleComponent } from 'app/common/table-article/table-article.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Client } from 'app/Models/Entities/Client';
import { StatutBonCommandeFournisseur } from 'app/Enums/StatutBonCommandeFournisseur.Enum';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { BonCommandeFournisseur } from 'app/Models/Entities/BonCommandeFournisseur';
import { Prestation } from 'app/Models/Entities/Prestation';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { Adresse } from 'app/Models/Entities/Adresse';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { TranslateService } from '@ngx-translate/core';
import { ClientService } from 'app/services/client/client.service';
import { FactureService } from 'app/services/facture/facture.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { LoginService } from 'app/services/login/login.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { BonCommandeFournisseurService } from 'app/services/bonCommandeFournisseur/bonCommandeFournisseur.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Historique } from 'app/Models/Entities/Historique';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';

declare var toastr: any;

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  @ViewChild(TableArticleComponent)
  tableArticleComponent: TableArticleComponent;
  form: FormGroup;
  clients: Client[] = [];
  statutBonCommandeFournisseur: typeof StatutBonCommandeFournisseur = StatutBonCommandeFournisseur;
  actionHistorique: ActionHistorique = new ActionHistorique();
  bonCommandeFournisseur: BonCommandeFournisseur;
  id: number;
  articles: Prestation[] = [];
  chantiers: Chantier[] = [];
  fournisseurs: Fournisseur[] = []
  dateLang: any;
  prestations: any;
  articlesInfo: any = {};
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  emitter: any = {};
  client: Client = new Client();
  adresseFacturation: Adresse = new Adresse();
  adresses: Adresse[] = [];
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    translate: 'yes',
  }
  processing: boolean = false;
  idChantier: number = null;
  constructor(
    private translate: TranslateService,
    private bonCommandeFournisseurService: BonCommandeFournisseurService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private chantierService: ChantierService,
    private fournisseurService: FournisseurService,
    private loginService: LoginService,
  ) {
    this.form = this.fb.group({
      reference: [null, [Validators.required]],
      dateCreation: [null, [Validators.required]],
      dateExpiration: [null, [Validators.required]],
      idChantier: [null, [Validators.required]],
      idFournisseur: [null, [Validators.required]],
      objet: [null],
      note: [null],
      conditionsReglement: [null],
      status: [null],

    });
  }

  async ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.bonCommandeFournisseurService.Get(this.id).subscribe(res => {
        this.bonCommandeFournisseur = res;
        this.getChantiers('', this.bonCommandeFournisseur.idChantier);
        this.getFournisseurs('', this.bonCommandeFournisseur.idFournisseur);
        this.setData();

      });
    });

    this.idChantier = await this.getIdChantier();
  }

  getIdChantier(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(params => resolve(params["idChantier"]))
    });
  }

  GetNameOfChantier(idChantier) {

    const result = (this.chantiers as any[]).filter(c => c.id == idChantier);
    return result.length > 0 ? result[0].nom : '';
  }

  getChantiers(search, id?: any) {
    this.chantierService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.chantiers = res.list;
        this.form.controls['idChantier'].setValue(id == null ? null : id.toString());
        this.processing = false;
      });

  }

  /**
   * get info for fournisseur
   */
  getFournisseurs(search, id?: any) {
    this.fournisseurService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.fournisseurs = res.list;
        this.form.controls['idFournisseur'].setValue(id == null ? null : id.toString());
        this.processing = false;
      });
  }

  setData() {
    this.form.controls['reference'].setValue(this.bonCommandeFournisseur.reference);
    this.form.controls["dateCreation"].setValue(new Date(this.bonCommandeFournisseur.dateCreation));
    this.form.controls["dateExpiration"].setValue(new Date(this.bonCommandeFournisseur.dateExpiration));
    this.form.controls['objet'].setValue(this.bonCommandeFournisseur.objet);
    this.form.controls['note'].setValue(this.bonCommandeFournisseur.note);
    this.form.controls['conditionsReglement'].setValue(this.bonCommandeFournisseur.conditionsReglement);
    this.form.controls['status'].setValue(this.bonCommandeFournisseur.status.toString());
    this.articles = JSON.parse(this.bonCommandeFournisseur.articles);
  }
  /**
   * return resultat prestations
   */
  getDataFromArticlesComponet(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.emitter.getDateToSave(res => {
        resolve(res);
      });
    });
  }

  // Get information de form
  get f() {
    return this.form.controls;
  }
  /**
   * Create Body Request
   */
  createBodyRequest(status): BonCommandeFournisseur {
    const formValue = this.form.value;
    const bonCommandeFournisseur: BonCommandeFournisseur = new BonCommandeFournisseur();
    bonCommandeFournisseur.reference = formValue.reference;
    bonCommandeFournisseur.idChantier = formValue.idChantier;
    bonCommandeFournisseur.idFournisseur = formValue.idFournisseur;
    bonCommandeFournisseur.status = status;
    bonCommandeFournisseur.memos = '[]';
    let dateCreation: any = AppSettings.formaterDatetime(formValue.dateCreation);
    bonCommandeFournisseur.dateCreation = dateCreation;
    let dateExpiration: any = AppSettings.formaterDatetime(formValue.dateExpiration);
    bonCommandeFournisseur.dateExpiration = dateExpiration
    bonCommandeFournisseur.objet = formValue.objet;
    bonCommandeFournisseur.note = formValue.note;
    bonCommandeFournisseur.conditionsReglement = formValue.conditionsReglement;
    bonCommandeFournisseur.articles = this.prestations.prestation;
    bonCommandeFournisseur.tva = this.prestations.tva;
    bonCommandeFournisseur.totalHt = this.prestations.totalHt;
    bonCommandeFournisseur.total = this.prestations.totalTtc;
    bonCommandeFournisseur.tvaGlobal = this.prestations.tvaGlobal;
    bonCommandeFournisseur.devis = this.bonCommandeFournisseur.devis;
    bonCommandeFournisseur.idDevis = this.bonCommandeFournisseur.idDevis;
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    bonCommandeFournisseur.historique = JSON.stringify([historique]);
    return bonCommandeFournisseur;
  }

  /**
   * 
   * @param status 
   */
  checkFormIsValid(): boolean {
    (this.form.valid)
    let valid = true;
    for (let key in this.form.controls) {
      if (this.form.controls[key].errors != null) {
        valid = false;
      }
    }
    return valid;
  }
  /**
   * update bon commande fournisseur
   * @param status  bc fournoisseur
   */
  async update(status) {

    const compareDate = this.compareDate(
      this.form.value.dateExpiration,
      this.form.value.dateCreation
    );
    if (!compareDate) {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.datesIntervention, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
      return;
    }
    this.prestations = await this.getDataFromArticlesComponet();
    if (this.checkFormIsValid() && this.prestations != '[]') {
      const createBody = this.createBodyRequest(status);
      this.bonCommandeFournisseurService.Update(this.id, createBody).subscribe(
        res => {
          if (res) {
            this.processing = true;
            this.translate.get('updateBonCommande').subscribe(text => {
              toastr.success(text.msg, text.title, {
                positionClass: 'toast-top-center',
                containerId: 'toast-top-center',
              });
              this.navigateToDetailBonCommande();
              // this.router.navigate(['/bonCommandeFournisseur/detail', res.id]);
            });
          }
        },
        err => {
          this.translate.get('errors').subscribe(text => {
            toastr.warning(text.serveur, '', {
              positionClass: 'toast-top-center',
              containerId: 'toast-top-center',
            });
          }, () => {
            this.processing = false;
          });
        });
    } else {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.fillAll, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
    }
  }

  compareDate(date1, date2) {
    //Note: 00 is month i.e. January
    var dateOne = new Date(date1); //Year, Month, Date
    var dateTwo = new Date(date2); //Year, Month, Date
    if (dateOne > dateTwo) {
      return true;
    } else {
      return false;
    }
  }

  navigateToBonCommandeList() {
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/commandes_devis/` : `/bonCommandeFournisseur`;
    this.router.navigate([url]);
  }
  navigateToDetailBonCommande() {
    //chantiers/82/documents/commandes_devis/detail/233
    let url = this.idChantier != null ? `/chantiers/${this.idChantier}/documents/commandes_devis/detail/${this.bonCommandeFournisseur['id']}` : `/bonCommandeFournisseur/detail/${this.bonCommandeFournisseur['id']}`;
    this.router.navigate([url]);
  }

}

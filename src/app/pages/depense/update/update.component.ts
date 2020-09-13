import { Component, OnInit, ViewChild } from '@angular/core';
import { TableArticleDepenseComponent } from 'app/common/table-article-depense/table-article-depense.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StatutDepense } from 'app/Enums/StatutDepense.Enum';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { Prestation } from 'app/Models/Entities/Prestation';
import { Chantier } from 'app/Models/Entities/Chantier';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { LoginService } from 'app/services/login/login.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { DepenseService } from 'app/services/depense/depense.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { Depense } from 'app/Models/Entities/depense';
import { Historique } from 'app/Models/Entities/Historique';
import { AngularEditorConfig } from '@kolkov/angular-editor';

declare var toastr: any;

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  @ViewChild(TableArticleDepenseComponent)
  tableArticleComponent: TableArticleDepenseComponent;
  form: FormGroup;
  statutDepense: typeof StatutDepense = StatutDepense;
  actionHistorique: ActionHistorique = new ActionHistorique();
  id: number;
  articles: Prestation[] = [];
  chantiers: Chantier[] = [];
  fournisseurs: Fournisseur[] = []
  dateLang: any;
  prestations: any;
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  emitter: any = {};
  processing: boolean = false;
  depense: Depense;

  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    translate: 'yes',
  }
  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private depenseService: DepenseService,
    private chantierService: ChantierService,
    private fournisseurService: FournisseurService,
    private loginService: LoginService,
    private paramteresService: ParameteresService
  ) { }

  ngOnInit() {
    this.processing = true;
    //set the language used in the component
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });

    //build the creation Form
    this.buildCreationForm();
    this.route.params.subscribe(params => {
      this.id = params['id'];
      this.depenseService.Get(this.id).subscribe(res => {
        this.depense = res;
        this.getChantiers('', this.depense.idChantier);
        this.getFournisseurs('', this.depense.idFournisseur);

        this.setData();

      });

    });
  }

  /**
 * build the creation Form
 */
  buildCreationForm(): void {
    this.form = this.fb.group({
      reference: [null, [Validators.required]],
      categorie: [null],
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
  /**
   *  get info for  chantier
   */
  getChantiers(search, id?: any) {
    this.chantierService
      .GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, 'nom', 'asc')
      .subscribe(async res => {
        this.processing = true;

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
        this.processing = true;

        this.fournisseurs = res.list;
        this.form.controls['idFournisseur'].setValue(id == null ? null : id.toString());

        this.processing = false;
      });
  }

  setData() {

    this.form.controls['reference'].setValue(this.depense.reference);
    this.form.controls['categorie'].setValue(this.depense.categorie);
    this.form.controls["dateCreation"].setValue(new Date(this.depense.dateCreation));
    this.form.controls["dateExpiration"].setValue(new Date(this.depense.dateExpiration));
    this.form.controls['objet'].setValue(this.depense.objet);
    this.form.controls['note'].setValue(this.depense.note);
    this.form.controls['conditionsReglement'].setValue(this.depense.conditionsReglement);
    this.articles = JSON.parse(this.depense.prestations);
  }

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

  createBodyRequest(status,prestations): Depense {

    const formValue = this.form.value;
    const depense: Depense = new Depense();
    depense.reference = formValue.reference;
    depense.categorie = formValue.categorie;
    depense.idChantier = formValue.idChantier;
    depense.idFournisseur = formValue.idFournisseur;
    depense.status = status;
    depense.objet = formValue.objet;
    depense.note = formValue.note;
    depense.conditionsReglement = formValue.conditionsReglement;
    depense.memos = '[]';
    let dateCreation: any = AppSettings.formaterDatetime(formValue.dateCreation);
    depense.dateCreation = dateCreation;
    let dateExpiration: any = AppSettings.formaterDatetime(formValue.dateExpiration);
    depense.dateExpiration = dateExpiration
    depense.prestations = prestations.prestation;
    depense.tva = prestations.tva;
    depense.totalHt = prestations.totalHt;
    depense.total = prestations.totalTtc;
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    depense.historique = JSON.stringify([historique]);
    return depense;
  }

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
    const prestations = await this.getDataFromArticlesComponet();
    if (this.form.valid && prestations.prestation != '[]') {
      const createBody = this.createBodyRequest(status,prestations);
      this.depenseService.Update(this.id, createBody).subscribe(
        res => {
          if (res) {
            this.processing = true;
            this.translate.get('update').subscribe(text => {
              //   this.IncremenetRefernce();
              toastr.success(text.msg, text.title, {
                positionClass: 'toast-top-center',
                containerId: 'toast-top-center',
              });
              this.router.navigate(['/depense/detail', res.id]);
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

}

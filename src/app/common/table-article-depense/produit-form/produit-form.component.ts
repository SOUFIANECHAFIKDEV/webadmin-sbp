import { Component, OnInit, Output, Input, EventEmitter, OnChanges } from '@angular/core';
import { Tva } from 'app/Models/Entities/Tva';
import { Categorie } from 'app/Models/Entities/Categorie';
import { Unite } from 'app/Models/Entities/Unite';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { conversion } from 'app/common/prix-conversion/conversion';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Produit } from 'app/Models/Entities/Produit';
import { ArticleType } from 'app/Models/article-type';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ProduitService } from 'app/services/produit/produit.service';
import { LoginService } from 'app/services/login/login.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { FournisseurService } from '../../../services/fournisseur/fournisseur.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { PrixParDefault } from 'app/Models/prix-par-default';
import { Historique } from 'app/Models/Entities/Historique';
declare var toastr: any;
@Component({
  selector: 'app-produit-form',
  templateUrl: './produit-form.component.html',
  styleUrls: ['./produit-form.component.scss']
})
export class ProduitFormComponent implements OnInit, OnChanges {
  public ListeTva: Tva[];
  public ListeUnite: Unite[];
  public ListeCategorie: Categorie[];
  public PrixParFournisseur = [];
  public FournisseurList: Fournisseur[];
  public form;
  public actionHistorique: ActionHistorique = new ActionHistorique();
  public conversion = new conversion();
  public editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    placeholder: 'Description',
  };
  public addInDb: boolean = true;
  public produit: Produit = null;
  @Output('OnSave') OnSave = new EventEmitter();
  @Input('reload') reload: { createForm };
  public articleType: ArticleType = new ArticleType();
  typeRemiseGloabl = '€';
  initialisation = {
    unite: false,
    categorie: false,
    //tva: false,
    fournisseur: false
  };

  constructor(
    private fb?: FormBuilder,
    private translate?: TranslateService,
    private produitService?: ProduitService,
    private FournisseurService?: FournisseurService,
    private loginService?: LoginService,
    private parameteresService?: ParameteresService

  ) { }

  initForm() {
    this.form = this.fb.group({
      reference: [null, [Validators.required], this.CheckUniqueReference.bind(this)],
      nom: [null, [Validators.minLength(2), Validators.required]],
      description: [null],
      designation: [null],
      nomber_heure: [null],
      cout_materiel: [null],
      cout_vente: [null],
      tva: [null],
      unite: [null],
      categorie: [null],
      qte: [null],
      remise: [null],
      prix_fournisseur: [null],

    });
  }
  ngOnInit() {
    this.initForm();
    //définir la langue utilisée dans les texts affichée
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    //intialisations
    this.setDataInForm(null);
  }
  ngOnChanges() {
    this.reload.createForm = this.setDataInForm.bind(this);
  }

  usedForAdd = false;

  setDataInForm(article: { data: Produit; qte: number; type: number; remise: number } | any) {

    if (article != null && article.data != null) {
      this.form.controls['reference'].setValue(article.data.reference)
      this.form.controls['nom'].setValue(article.data.nom)
      this.form.controls['description'].setValue(article.data.description)
      this.form.controls['designation'].setValue(article.data.designation)
      this.form.controls['nomber_heure'].setValue(article.data.nomber_heure)
      this.form.controls['cout_materiel'].setValue(article.data.cout_materiel)
      this.form.controls['cout_vente'].setValue(article.data.cout_vente)
      this.form.controls['tva'].setValue(article.data.tva)
      this.form.controls['unite'].setValue(article.data.unite)
      this.form.controls['categorie'].setValue(article.data.categorie)
      this.form.controls['qte'].setValue(article.data.qte)
      this.form.controls['remise'].setValue(article.data.remise)
      this.form.controls['prix_fournisseur'].setValue(article.data.prix_fournisseur)

      this.PrixParFournisseur = [
        {
          id: 0,
          IdProduit: article.data.id != undefined ? article.data.id : article.data.Id,
          idFournisseur:
            article.data.id_fournisseur != undefined
              ? article.data.id_fournisseur
              : article.data.Id_fournisseur,
          default: true,
          prix:
            article.data.prix_fournisseur != undefined
              ? article.data.prix_fournisseur
              : article.data.Prix_fournisseur,
        },
      ];

      this.produit = article.data;
      this.usedForAdd = false;
    }
  }



  /** creation d'un référence de la formulaire de creation*/
  get f() {
    return this.form.controls;
  }

  /**vérifier que le référence est unique dans la base de donnée*/
  CheckUniqueReference(control: FormControl): Promise<{}> {
    let promise = new Promise((resolve, reject) => {
      this.produitService.CheckUniqueReference(control.value).subscribe(res => {
        if (
          control.value != '' &&
          (this.produit == null ? true : control.value != this.produit.reference)
        ) {
          if (res == true) {
            resolve({ CheckUniqueReference: true });
          } else {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
    return promise;
  }

  /**récupérer la liste des unité de la base de données*/
  getListeUnite(): void {
    if (!this.initialisation.unite) {
      this.produitService.getListeUnite().subscribe(Unite => {
        this.ListeUnite = Unite.result;
        this.initialisation.unite = true
      });
    }
  }

  /**récupérer la liste des catégorie de la base de données*/
  getListeCategorie(): void {
    if (!this.initialisation.categorie) {
      this.produitService.getListeCategorie().subscribe(Categorie => {
        this.ListeCategorie = Categorie.result;
        this.initialisation.categorie = true;
      });
    }
  }

  /*--------------------------------------------------
    formater l'objet qui contient les information qui nous voulons ajouter
    -------------------------------------------------*/
  formaterProduitBody(formValues: any) {
    //ajouter l'historique
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    historique.action = this.actionHistorique.Added;
    formValues['Id'] = this.produit == null ? 0 : this.produit.id;

    formValues['Historique'] = '[]';
    formValues['FichesTechniques'] = '[]';
    formValues['Labels'] = '[]';

    //ajouter le Prix Par Fournisseur
    formValues['Id_fournisseur'] =
      this.PrixParFournisseur.length == 0
        ? null
        : parseInt(this.PrixParFournisseur[0].idFournisseur);
    formValues['Prix_fournisseur'] =
      this.PrixParFournisseur.length == 0 ? null : parseFloat(this.PrixParFournisseur[0].prix);

    formValues['prixHt'] = this.TotalHt();
    return formValues;
  }

  save() {
    if (this.checkFormIsValid() && this.PrixParFournisseur.length == 1) {
      let formValues = this.form.value;
      formValues = this.formaterProduitBody(formValues);
      let article: { data: Produit; qte: number; type: number; remise: number } = {
        data: formValues,
        qte: formValues.qte,
        remise: formValues.remise,
        type: this.articleType.produit,
      };
      this.translate.get('updateproduit').subscribe(text => {
        toastr.success(text.msg, text.title, {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
      // }
      this.PrixParFournisseur = [];
      this.OnSave.emit(article);
      this.setDataInForm(null);
    } else {
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.fillAll, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
    }
  }
  checkFormIsValid(): boolean {

    let valid = true;
    for (let key in this.form.controls) {
      if (this.form.controls[key].errors != null) {
        valid = false;
      }
    }
    return valid;
  }

  /*--------------------------------------------------
      récupérer la liste des Fournisseur de la base de données
    --------------------------------------------------*/
  GetFournisseurList() {
    if (!this.initialisation.fournisseur) {
      this.FournisseurService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'nom', 'asc').subscribe(res => {
        this.FournisseurList = res.list;
        this.initialisation.fournisseur = true;
      });
    }
  }

  /*--------------------------------------------------
    si le Prix Par Fournisseur est ajouter ou supprimer ou modifier 
    le 'composant' responsable de 'crud' les Prix Par Fournisseur retourner la nouvelle liste de ces Prix
    => il faut les ajouter dans un variable de type tableau Qu'il a ajouer dans l'objet qui nous envoyer au serveur
    -------------------------------------------------*/
  getPrixParFournisseurList(List) {
    this.PrixParFournisseur = List;
  }

  // Récupuerer tva par defaut
  GetParametrageTva() {
    // if (!this.initialisation.tva) {
    //   this.parameteresService.Get(TypeParametrage.tva).subscribe(res => {
    //     const data = JSON.parse(res.contenu);
    //     //this.form.controls['tva'].setValue(parseInt(data['tvaDefaut']));
    //     this.initialisation.tva = true;
    //   });
    // }
  }

  calculate_cout_horaire(): any {
    return parseFloat(this.form.value.nomber_heure) * parseFloat(this.form.value.cout_vente);
  }

  prixTtc() {
    const tva = this.form.controls.tva.value / 100 + 1;
    const TotalHt = this.TotalHt();
    return TotalHt * tva;
  }

  TotalHt() {
    let totalHt = this.calculate_cout_horaire() + this.form.value.cout_materiel;
    let remise = 0;
    if (this.form.value.remise != 0) {
      if (this.typeRemiseGloabl == '€') {
        remise = this.form.value.remise;
      } else {
        remise = totalHt * (this.form.value.remise / 100);
      }
    }
    let result = totalHt - remise;
    return isNaN(result) ? 0 : result;
  }

  getCouteVenteFromParamerage() {
    if (this.form.value['cout_vente'] == 0) {
      this.parameteresService.Get(TypeParametrage.prix).subscribe(res => {
        let PrixParDefault: PrixParDefault = JSON.parse(res.contenu);
        this.form.controls['cout_vente'].setValue(PrixParDefault.prixVente);
      });
    }
  }

}

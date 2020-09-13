import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { AppSettings } from "app/app-settings/app-settings";
import { TranslateService } from "@ngx-translate/core";
import { ProduitService } from '../../../services/produit/produit.service';
import { Tva } from '../../../Models/Entities/Tva';
import { Unite } from '../../../Models/Entities/Unite';
import { Categorie } from '../../../Models/Entities/Categorie';
import { ActionHistorique } from "./../../../Enums/ActionHistorique.Enum";
import { Historique } from "app/Models/Entities/Historique";
import { Router } from "@angular/router";
import { LabelService } from "app/services/labels/labels.service";
import { FournisseurService } from "../../../services/fournisseur/fournisseur.service";
import { Fournisseur } from "../../../Models/Entities/Fournisseur"
import { LoginService } from 'app/services/login/login.service';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { AngularEditorConfig } from '@kolkov/angular-editor';
// import { ParametrageDocumentService } from 'app/services/parametragedocument/parametrage-document.service';
import { conversion } from 'app/common/prix-conversion/conversion';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { PrixParDefault } from 'app/Models/prix-par-default';
import { PrixParFournisseur_response, Validation_response } from 'app/Models/prixParFournisseur';

declare var toastr: any;

@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})

export class AddComponent implements OnInit {

  public ListeTva: Tva[];
  public ListeUnite: Unite[];
  public ListeCategorie: Categorie[];
  public tagsSelected: { value: string, origine: boolean }[] = [];
  public form = null;
  public actionHistorique: ActionHistorique = new ActionHistorique();
  public allTagsList = [];
  public conversion = new conversion();
  public editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '25rem',
    placeholder: 'Description',
  };
  public loadData: any = {};
  public processing: boolean = false;

  constructor(
    private fb?: FormBuilder,
    private translate?: TranslateService,
    private produitService?: ProduitService,
    private router?: Router,
    private labelService?: LabelService,
    private FournisseurService?: FournisseurService,
    private loginService?: LoginService,
    private parameteresService?: ParameteresService
    // private parametrageDocumentService?: ParametrageDocumentService
  ) {
    //intialisations
    this.createForm();
  }

  ngOnInit() {
    //définir la langue utilisée dans les texts affichée
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    //intialisations
    this.getListeUnite();
    this.getListeCategorie();
    this.GetAllTags();
    this.GetParametrageTva();
    this.getCouteVenteFromParamerage();
  }

  /*--------------------------------------------------
   création du formulaire de creation d'un nouveau produit 
  -------------------------------------------------*/
  createForm() {
    this.form = this.fb.group({
      Reference: [null, [Validators.required], this.CheckUniqueReference.bind(this)],
      Nom: [null, [Validators.minLength(2), Validators.required]],
      Description: [""],
      Designation: [""],
      Nomber_heure: [0],
      Cout_materiel: [0],
      Cout_vente: [0],
      Tva: [0],
      Unite: [null],
      Categorie: [null],
      Labels: [null]
    });
  }

  /*--------------------------------------------------
   creation d'un référence de la formulaire de creation
  -------------------------------------------------*/
  get f() { return this.form.controls; }


  /*--------------------------------------------------
   vérifier que le référence est unique dans la base de donnée
  -------------------------------------------------*/
  CheckUniqueReference(control: FormControl): Promise<{}> {
    if (control.value != "") {
      let promise = new Promise((resolve, reject) => {
        this.produitService
          .CheckUniqueReference(control.value)
          .subscribe(res => {
            if (res == true) {
              resolve({ CheckUniqueReference: true });
            } else {
              resolve(null);
            }
          });
      });
      return promise;
    }
  }

  /*--------------------------------------------------
   récupérer la liste des unité de la base de données
  -------------------------------------------------*/
  getListeUnite(): void {
    this.produitService.getListeUnite().subscribe(Unite => {
      this.ListeUnite = Unite.result;
    });
  }

  /*--------------------------------------------------
   récupérer la liste des catégorie de la base de données
  -------------------------------------------------*/
  getListeCategorie(): void {

    this.produitService.getListeCategorie().subscribe(Categorie => {
      this.ListeCategorie = Categorie.result;
    });
  }

  /*--------------------------------------------------
  formater l'objet qui contient les information qui nous voulons ajouter
  -------------------------------------------------*/
  async formaterProduitBody(formValues: any) {
    debugger
    //prix par fournisseur
    const prixParFournisseurList = await this.getPrixParFournisseurList();
    if (!prixParFournisseurList.validation.isValid) {
      return false
    }
    formValues["prixParFournisseur"] = prixParFournisseurList.list;

    //ajouter l'historique
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;;
    historique.action = this.actionHistorique.Added;
    formValues["Historique"] = JSON.stringify([historique]);
    formValues["Id"] = 0;
    formValues["FichesTechniques"] = '[]';

    //ajouter les labels
    formValues["Labels"] = [];
    this.tagsSelected.forEach(tag => {
      if (!tag.origine) {
        this.labelService.Add(tag.value).subscribe(res => { });
      }
      formValues["Labels"].push(tag.value);
    });

    formValues["Labels"] = JSON.stringify(formValues["Labels"]);
    formValues["prixHt"] = this.TotalHt();
  }


  getPrixParFournisseurList(): Promise<PrixParFournisseur_response> {
    return new Promise((resolve, reject) => {
      this.loadData.return("getList", (response: PrixParFournisseur_response) => {
        resolve(response);
      });
    });
  };


  /*--------------------------------------------------
   ajouter un nouveau produit
  -------------------------------------------------*/
  async add() {
    if (this.form.valid) {
      let formValues = this.form.value;

      if (await this.formaterProduitBody(formValues) == false) {
        return;
      }

      //envoyer la demande d'ajout d'un nouveau produit au serveur
      this.produitService.Add(formValues).subscribe(res => {
        //si la process est été fait avec succès
        if (res) {

          //affiche un message de succés
          this.translate.get("add").subscribe(text => {
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          });
          //puis redirection a la page de le nouveau produit créé
          this.router.navigate(["/produits/detail", res.id]);
        }
      });
      //si la process est n'été pas fait avec succès
    } else {
      //affiche un message d'échec
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  /*--------------------------------------------------
    récupérer la liste des labels(tags) de la base de données pour le proposer a l'utilisatuer
  --------------------------------------------------*/
  GetAllTags() {
    this.labelService
      .GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'desc')
      .subscribe(Response => {
        //formater la réponse pour faciliter la manipulation
        Response.list.forEach(tag => {
          this.allTagsList.push({ value: tag.label, origine: true });
        })
      });
  }

  /*--------------------------------------------------
  si une label(tag) est ajouter ou supprimer ou modifier 
  le 'composant' responsable de 'crud' les labels(tags) retourner la nouvelle liste de ces labels(tags)
  => il faut les ajouter dans un variable de type tableau Qu'il a ajouer dans l'objet qui nous envoyer au serveur
  -------------------------------------------------*/
  onTagsChange(Tags: [{ value: string, origine: boolean }]) {
    this.tagsSelected = Tags;
  }


  // Récupuerer tva par defaut 
  GetParametrageTva() {

    this.parameteresService.Get(TypeParametrage.tva).subscribe(res => {
      const data = JSON.parse(res.contenu);
      this.form.controls['Tva'].setValue(parseFloat(data['tvaDefaut']));
    });
  }

  calculate_cout_horaire(): any {

    return (this.form.value.Nomber_heure) * (this.form.value.Cout_vente);
  }

  prixTtc(cout_materiel: number, tva: number) {
    if (this.calculate_cout_horaire() != null && cout_materiel != null) {
      return ((this.calculate_cout_horaire() + cout_materiel) * (1 + tva / 100)).toFixed(2)
    } else {
      return 0;
    }
  }

  TotalHt() {
    return (this.calculate_cout_horaire() + this.form.value.Cout_materiel).toFixed(2)
  }

  getCouteVenteFromParamerage() {
    this.parameteresService.Get(TypeParametrage.prix).subscribe(
      (res) => {
        let PrixParDefault: PrixParDefault = JSON.parse(res.contenu);
        this.form.controls["Cout_vente"].setValue(PrixParDefault.prixVente);
      });
  }
}
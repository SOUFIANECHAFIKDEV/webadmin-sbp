import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { AppSettings } from "app/app-settings/app-settings";
import { TranslateService } from "@ngx-translate/core";
import { ProduitService } from '../../../services/produit/produit.service';
import { Tva } from '../../../Models/Entities/Tva';
import { Unite } from '../../../Models/Entities/Unite';
import { Categorie } from '../../../Models/Entities/Categorie';
import { ActionHistorique } from "./../../../Enums/ActionHistorique.Enum";
import { Historique } from "app/Models/Entities/Historique";
import { ActivatedRoute, Router } from "@angular/router";
import { Memo } from "app/Models/Entities/Memo";
import { LabelService } from "app/services/labels/labels.service";
import { FournisseurService } from "../../../services/fournisseur/fournisseur.service";
import { Fournisseur } from "../../../Models/Entities/Fournisseur"
import { Produit } from 'app/Models/Entities/Produit';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { conversion } from 'app/common/prix-conversion/conversion';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { PrixParDefault } from 'app/Models/prix-par-default';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { PrixParFournisseur, PrixParFournisseur_response } from 'app/Models/prixParFournisseur';
declare var toastr: any;
@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  public id;
  public ListeTva: Tva[];
  public ListeUnite: Unite[];
  public ListeCategorie: Categorie[];
  public allTagsList = [];
  public newTags = [];
  public produit: Produit;
  public PrixParFournisseur: PrixParFournisseur[];
  public form;
  public actionHistorique: ActionHistorique = new ActionHistorique();
  public historiques: Historique[] = [];
  public memos: Memo[] = [];
  public memo: Memo = new Memo();
  public tagsSelected: { value: string, origine: boolean }[] = [];
  public loadData: any = {};
  public processing: boolean = false;
  @ViewChild('prix') public prix;
  @ViewChild('nombreMaximum') public nombreMaximum;
  @ViewChild('numberMinimum') public numberMinimum;
  constructor(
    private fb?: FormBuilder,
    private translate?: TranslateService,
    private produitService?: ProduitService,
    private router?: Router,
    private route?: ActivatedRoute,
    private labelService?: LabelService,
    private FournisseurService?: FournisseurService,
    private parameteresService?: ParameteresService
  ) {
    this.form = this.fb.group({
      Reference: [null, [Validators.required], this.CheckUniqueReference.bind(this)],
      Nom: [null, [Validators.minLength(2), Validators.required]],
      Description: [""],
      Designation: [""],
      Tva: [null],
      Unite: [null],
      Categorie: [null],
      Labels: [null],
      Nomber_heure: [0],
      Cout_materiel: [0.00],
      cout_vente: [0.00]
    });
  }
  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getListeUnite();
    this.getListeCategorie();
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.GetProduit(this.id);

    })
    this.GetAllTags();
    this.getCouteVenteFromParamerage();
  }


  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '25rem',
    //  placeholder: 'Enter text here...',
    translate: 'yes',

  }
  /*-----------------------------------------------------------*/

  /*-----------------------------------------------------------*/
  getListeUnite(): void {
    this.produitService.getListeUnite().subscribe(Unite => {
      this.ListeUnite = Unite.result;
    });
  }
  /*-----------------------------------------------------------*/
  getListeCategorie(): void {
    this.produitService.getListeCategorie().subscribe(Categorie => {
      this.ListeCategorie = Categorie.result;
    });
  }
  /*-----------------------------------------------------------*/
  GetProduit(id: number) {
    this.produitService.Get(id).subscribe(produit => {
      this.produit = produit;
      this.PrixParFournisseur = this.produit.prixParFournisseur;
      JSON.parse(produit.labels).forEach(tag => {
        this.newTags.push({ value: tag, origine: false });
      });

      this.SetData(produit);

    });
  }
  /*-----------------------------------------------------------*/
  CheckUniqueReference(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.produitService.CheckUniqueReference(control.value).subscribe(res => {

        if (res == true && this.form.value.Reference != this.produit.reference) {
          resolve({ CheckUniqueReference: true });
        } else {
          resolve(null);
        }
      });
    });
    return promise;
  }
  /*-----------------------------------------------------------*/
  get f() { return this.form.controls; }
  /*-----------------------------------------------------------*/
  update() {
    debugger
    if (this.form.valid) {
      this.translate.get("update").subscribe(async text => {

        let produit = this.form.value;
        produit["id"] = this.id;
        produit["historique"] = JSON.stringify(this.historiques);
        produit["fichesTechniques"] = JSON.stringify(this.memos);
        produit["labels"] = [];

        this.tagsSelected.forEach(tag => {
          if (!tag.origine) {
            this.labelService.Add(tag.value).subscribe(res => {

              (res);
            });
          }
          produit["labels"].push(tag.value);
        });

        produit["labels"] = JSON.stringify(produit["labels"]);

        const prixParFournisseurList = await this.getPrixParFournisseurList();
        // if (!this.PrixParFournisseurListIsValid(prixParFournisseurList.validation)) return false;
        if (!prixParFournisseurList.validation.isValid) {
          return false
        }

        produit["prixParFournisseur"] = prixParFournisseurList.list;



        produit["prixHt"] = this.TotalHt();
        this.produitService.Update(this.id, produit).subscribe(
          res => {
            if (res) {
              toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
              this.router.navigate(["/produits/detail", res.id]);
            }
          }
        );


      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  getPrixParFournisseurList(): Promise<PrixParFournisseur_response> {
    return new Promise((resolve, reject) => {
      this.loadData.return("getList", (response: PrixParFournisseur_response) => {
        resolve(response);
      });
    });
  };

  /*-----------------------------------------------------------*/
  SetData(produit: Produit) {
    this.form.controls["Reference"].setValue(produit.reference);
    this.form.controls["Nom"].setValue(produit.nom);
    this.form.controls["Description"].setValue(produit.description);
    this.form.controls["Designation"].setValue(produit.designation);
    this.form.controls["Categorie"].setValue(produit.categorie);
    this.form.controls["Labels"].setValue(produit.labels);
    this.form.controls["Unite"].setValue(produit.unite);
    this.form.controls["Tva"].setValue(produit.tva);
    this.form.controls["Nomber_heure"].setValue(produit.nomber_heure);
    this.form.controls["Cout_materiel"].setValue(produit.cout_materiel);
    this.form.controls["cout_vente"].setValue(produit.cout_vente);
    this.form.controls["prixHt"] = this.TotalHt();
    this.historiques = JSON.parse(produit.historique) as Historique[];
    this.memos = JSON.parse(produit.fichesTechniques) as Memo[];
  }
  /*-----------------------------------------------------------*/
  onTagsChange(Tags: [{ value: string, origine: boolean }]) {
    this.tagsSelected = Tags;
  }
  /*-----------------------------------------------------------*/
  GetAllTags() {
    this.labelService
      .GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'desc')
      .subscribe(Response => {
        Response.list.forEach(tag => {
          this.allTagsList.push({ value: tag.label, origine: true });
        })
      });
  }

  /*-----------------------------------------------------------*/

  /*----------------*/
  // Change prix ttc
  conversion = new conversion();

  // prixTtc(cout_horaire: number, cout_materiel: number, tva: number) {
  //   if (cout_horaire != null && cout_materiel != null) {
  //     return this.conversion.GetTTcByTva(cout_horaire, cout_materiel, tva)
  //   } else {
  //     return 0;
  //   }
  // }
  calculate_cout_horaire(): any {
    return parseFloat(this.form.value.Nomber_heure) * parseFloat(this.CoutVenteDefault);
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
  CoutVenteDefault: any = 0;
  getCouteVenteFromParamerage() {
    this.parameteresService.Get(TypeParametrage.prix).subscribe(
      (res) => {
        let PrixParDefault: PrixParDefault = JSON.parse(res.contenu)
        this.CoutVenteDefault = PrixParDefault.prixVente;
      });
  }

  // Récupuerer tva par defaut 
  // GetParametrageTva() {
  //   this.parameteresService.Get(TypeParametrage.tva).subscribe(res => {
  //     
  //     const data = JSON.parse(res.contenu);
  //     this.form.controls['Tva'].setValue(parseInt(data['tvaDefaut']));
  //   });
  // }
}

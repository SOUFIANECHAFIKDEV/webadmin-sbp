import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { ProduitService } from 'app/services/produit/produit.service';
import { ProduitListModel } from 'app/Models/ProduitListModel';
import { conversion } from "app/common/prix-conversion/conversion";
import { Produit } from 'app/Models/Entities/Produit';
import { IFormType } from './IFormType.enum';
import { Lots, LotProduits } from 'app/Models/Entities/Lots';
import { TranslateService } from "@ngx-translate/core";
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { LotsService } from 'app/services/lots/lots.service';
declare var toastr: any;
declare var jQuery: any;
@Component({
  selector: 'lots-from',
  templateUrl: './lotsFrom.component.html',
  styleUrls: ['./lotsFrom.component.scss']
})
export class lotsFromComponent implements OnInit, OnChanges {
  @Input('type') type;
  @Input('defaultData') defaultData: Lots;
  @Output('OnSave') OnSave = new EventEmitter();
  @Input('emitter') emitter: { initialiser };
  // lotName = "";
  // description = "";
  produits: ProduitListModel;
  formType: typeof IFormType = IFormType;
  search: string = "";
  labels: any;
  produitsSelectionneeProvisoirement: Produit[] = [];
  // produitsSelectionnee: Produit[] = [];
  loading = false;
  form
  constructor(private fb?: FormBuilder, private produitService?: ProduitService, private translate?: TranslateService, private lotsService?: LotsService) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("labels").subscribe(labels => {
      this.labels = labels;
    });
    this.form = this.fb.group({
      lotName: ["", [Validators.required, Validators.minLength(3)], this.CheckUniqueReference.bind(this)],
      description: [null],
    });
  }

  CheckUniqueReference(control: FormControl) {
    let promise = new Promise((resolve, reject) => {
      this.lotsService
        .CheckUniqueReference(control.value)
        .subscribe(res => {
          if (res == true && (this.defaultData == null ? true : (control.value != this.defaultData.nom))) {
            resolve({ CheckUniqueReference: true });
          } else {
            resolve(null);
          }
        });
    });
    return promise;
  }
  clearform() {
    this.form.reset();
  }
  async ngOnChanges() {


    this.emitter.initialiser = this.initialiser.bind(this);
    await this.initialiser();
  }

  async initialiser() {

    if (this.form != undefined) {
      this.form.reset();
    }

    // this.form.controls["lotName"].setValue("");
    // this.form.controls["description"].setValue("");
    this.form = this.fb.group({
      lotName: ["", [Validators.required, Validators.minLength(3)], this.CheckUniqueReference.bind(this)],
      description: [null],
    });

    this.produitsSelectionneeProvisoirement = []
    this.produits = new ProduitListModel();
    this.form.controls["lotName"].setValue(this.defaultData == null ? "" : this.defaultData.nom);
    this.form.controls["description"].setValue(this.defaultData == null ? "" : this.defaultData.description);
    if (this.type != IFormType.preview) {
      this.produits = await this.getProduits();
    }

    await this.setProduitFromDefaultDataToProduitTmp();

  }

  async setProduitFromDefaultDataToProduitTmp(): Promise<void> {

    //récuperer les ids des produit du lot séléctionner 
    // const idproduits: number[] = this.defaultData == null ? [] : JSON.parse(this.defaultData.produits as string);
    /*this.defaultData.lotProduits.forEach(P => {
      P.produit
    });*/

    /** inerer tout les informations des produites selectionner dans @var produitsSelectionneeProvisoirement */
    if (this.defaultData == null) {
      return;
    }
    debugger
    console.log(this.defaultData.lotProduits)
    this.defaultData.lotProduits.forEach((lotProduits: LotProduits) => {
      if (this.type == IFormType.preview) {
        let produit = lotProduits.idProduitNavigation;
        produit.qte = lotProduits.qte;
        this.produitsSelectionneeProvisoirement.push(produit);
      } else {
        let produit = this.produits.list.filter(P => P.id == lotProduits.idProduit)[0];
        produit.qte = lotProduits.qte;
        this.produitsSelectionneeProvisoirement.push(produit);
      }
    });

    /** garder dans la liste global des produits sauf les produits non déja sélectionner */
    if (this.type != IFormType.preview) {
      this.produitsSelectionneeProvisoirement.forEach((produit: Produit) => {
        this.produits.list = this.produits.list.filter(P => P.id != produit.id)
      });
    }

  }

  /**récuperer la list des produits a partir du base de donée */
  getProduits(): Promise<ProduitListModel> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      this.produitService.GetAll(
        this.search,
        1,
        AppSettings.MAX_GET_DATA,
        'reference', 'asc', null, []
      ).subscribe((res: ProduitListModel) => {



        // this.produits = res;
        resolve(res)

        this.loading = false;
      }, err => {
        reject(err);
        (err);
      });
    });
  }

  /**
   * Sélectionnez un produit ou désélectionner
   * @param index l'indice du produit dans les deux tableau @var produitTmp et @var produits
   * @param id id du produit dans la base de données
   */
  addProduit(index: number, value?): void {
    /** si non retiré à partir du @var produits el l'ajouter dans @var produitTmp*/
    let produit = this.produits.list[index];
    let qte = (produit.qte == NaN || produit.qte == undefined) ? 0 : produit.qte;
    produit.qte = parseInt(value) > 0 ? qte + parseInt(value) : (qte > 0 ? (qte - parseInt(value)) : 0);
    // this.produitsSelectionnee.unshift(produit);
    this.produitsSelectionneeProvisoirement.unshift(produit);
    this.produits.list.splice(index, 1);
  }

  removeProduit(index) {
    // let produit = this.produitsSelectionnee[index];
    let produit = this.produitsSelectionneeProvisoirement[index];
    produit.qte = 0;
    this.produits.list.unshift(produit);
    this.produitsSelectionneeProvisoirement.splice(index, 1);
    // const id = this.produitsSelectionnee[index].id;
    // this.produitsSelectionneeProvisoirement = this.produitsSelectionneeProvisoirement.filter(P => P.id != id);
    // this.produitsSelectionneeProvisoirement.map(p => {
    //   if (p.id == id) {
    //     p.qte = 0;
    //   }
    // });
    // this.produitsSelectionnee.splice(index, 1);
  }

  changetQte(index, qte, type?: boolean) {

    let produit = this.produitsSelectionneeProvisoirement[index];
    if (qte == "") {
      produit.qte = 0;
      return;
    }
    if ((produit.qte == 1 && parseInt(qte) < 0) || parseInt(qte) == 0) {
      this.removeProduit(index);
      return;
    }
    produit.qte = type ? parseInt(qte) : produit.qte + parseInt(qte);
    return;
  }

  async searche() {

    // this.setProduitFromDefaultDataToProduitTmp();
    this.produits = await this.getProduits();
    // this.produitsSelectionneeProvisoirement = this.produitsSelectionnee;
    /*let produitProvisoire: Produit[] = [];
    this.produitsSelectionneeProvisoirement.forEach(produit => {
      if (produit.nom.search(this.search) != -1 || produit.reference.search(this.search) != -1) {
        produitProvisoire.push(produit);
      }
    });*/
    // this.produitsSelectionneeProvisoirement = produitProvisoire;
    /** garder dans la liste global des produits sauf les produits non déja sélectionner */
    this.produitsSelectionneeProvisoirement.forEach((produit: Produit) => {
      this.produits.list = this.produits.list.filter(P => P.id != produit.id)
    });

  }

  /**
   * créer l'objet du 'lot' et le retourner
   */
  submit(): void {


    if (this.form.value.lotName.length >= 3 && this.produitsSelectionneeProvisoirement.length > 0) {
      let lotProduits: { idProduit: number, qte: number }[] = [];
      this.produitsSelectionneeProvisoirement.forEach(produit => {
        lotProduits.push({ idProduit: produit.id, qte: produit.qte });
      });
      // this.form.controls["lotName"].setValue("");
      // this.form.controls["description"].setValue("");
      const lot: Lots = {
        id: this.defaultData == null ? 0 : this.defaultData.id,
        nom: this.form.value.lotName,
        description: this.form.value.description,
        lotProduits: lotProduits
      }
      this.form.controls["lotName"].setValue("");
      this.form.controls["description"].setValue("");
      this.produitsSelectionneeProvisoirement = [];
      this.defaultData = null;
      // this.pageNamber = 1;
      // this.pageSize = 10;
      jQuery("#lotsModel").modal("hide");
      this.OnSave.emit(lot);
    } else {
      this.translate.get("lotFromValidationErrorMsg").subscribe(text => {
        toastr.warning(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }
  }

  /** 
   *  vérifier si un produit est déja sélectionnée, 
   * par verifie si il exisists dans le tableau @var produitTmp 
   * */
  checkProduitIsSelectedOrNot(idProduit: number): boolean {
    try {
      return this.produitsSelectionneeProvisoirement.filter(P => P.id == idProduit).length > 0 ? true : false;
    } catch (ex) {
      return false;
    }
  }

  /** retourner le titre du 'pop up' qui contient la formulaire selon le type d'operation (visualisation/ajout/modification) */
  getmodelName() {
    if (this.type == IFormType.add) {
      return `${this.labels.add} ${this.labels.lot}`;
    }
    if (this.type == IFormType.preview) {
      return `${this.labels.afficher} ${this.labels.lot}`;
    }
    if (this.type == IFormType.update) {
      return `${this.labels.modifier} ${this.labels.lot}`;
    }
  }

  /** vérifier si les champs obligatoir est déja rempli */
  validate(): boolean {
    //les conditions : 
    //1- sélectionner un produit au minimum
    //2- et le nom du 'lot' contient trois caractères au minimum
    return this.produitsSelectionneeProvisoirement.length > 0 && this.form.valid
  }

  /** 
 * calculer le coût horaire pour calculer le prix ttc
 * le coût horaire = le nomber des heures * le cout du vente
 */
  calculate_cout_horaire(nomber_heure, cout_vente): number {
    return parseFloat(nomber_heure) * parseFloat(cout_vente);
  }

  /**
   * calculer le prix ttc 
   * le prix ttc  = (le coût horaire + le coût des materiels) * la valeur du tva
   */
  prixTtc(produit): number | 0 {
    if (produit == undefined) return;
    return produit.prixHt * ((produit.tva / 100) + 1);
  }


  /*--------------------------------------------------
   creation d'un référence de la formulaire de creation
  -------------------------------------------------*/
  get f() { return this.form.controls; }
}
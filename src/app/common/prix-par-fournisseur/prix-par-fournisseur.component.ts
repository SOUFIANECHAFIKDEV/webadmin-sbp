import { Component, OnInit, Input, OnChanges, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { PrixParFournisseur, PrixParFournisseur_TypeOfForm, PrixParFournisseur_response, PrixParFournisseur_validation, Validation_response } from './../../Models/prixParFournisseur';
import { TranslateService } from "@ngx-translate/core";
import * as _ from 'lodash';
import { FormBuilder, Validators } from '@angular/forms';
import { AppSettings } from 'app/app-settings/app-settings';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
declare var swal: any;
declare var jQuery: any;
declare var toastr: any;

@Component({
  selector: 'prix-par-fournisseur',
  templateUrl: './prix-par-fournisseur.component.html',
  styleUrls: ['./prix-par-fournisseur.component.scss']
})
export class PrixParFournisseurComponent implements OnInit, OnChanges {
  //inputs
  @Input('PrixParFournisseur') public ListPrixParFournisseur: PrixParFournisseur[] = [];
  public listFournisseurs: Fournisseur[] = [];
  listFournisseursNotModified: Fournisseur[] = [];
  @Input('idProduit') idProduit = -1;
  @Input("readOnly") readOnly: boolean = false;
  @Input('size') size = "small";
  @Input('getList') getList: { return };
  @Input('validation') validation: PrixParFournisseur_validation = new PrixParFournisseur_validation();

  form: any = null;
  typeOfForm: PrixParFournisseur_TypeOfForm = null;
  TypeOfFormEnum: typeof PrixParFournisseur_TypeOfForm = PrixParFournisseur_TypeOfForm;
  ListformLabels: { type: PrixParFournisseur_TypeOfForm, labels: { title: string, btnSave: string, btnClose: string } }[] = [];
  formLabels: { title: string, btnSave: string, btnClose: string } = null;
  updateUserIndex: number = null;
  swalWarningConfig = (text: any) => {
    return {
      title: text.title,
      text: text.question,
      icon: "warning",
      buttons: {
        cancel: {
          text: text.cancel,
          value: null,
          visible: true,
          className: "",
          closeModal: false
        },
        confirm: {
          text: text.confirm,
          value: true,
          visible: true,
          className: "",
          closeModal: false
        }
      }
    };
  };

  constructor(
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    private fournisseurService?: FournisseurService,
  ) { }

  ngOnInit() {
    //select default language of the componenet
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    //set traduction of form label
    this.setFormLabels();
    //create the form
    this.form = this.formBuilder.group({
      prix: [null, [Validators.required]],
      idFournisseur: [null, [Validators.required]],
      default: [null]
    });
  }

  async  ngOnChanges() {
    if(this.getList != undefined){
      this.getList.return = await this.emit.bind(this);
    }
  }

  async emit(operation, callback): Promise<void> {
    debugger
    switch (operation) {
      case 'getList':
        this.returnDataToSave(callback);
        break;
      case 'reload':
        await this.reload();
        break;
    }
  }

  async  reload(): Promise<void> {
    console.log("reload");
    this.listFournisseurs = null;
    this.updateUserIndex = null;
    this.form.reset();
    await this.getFournisseurList();
  }

  /**
   * @summary set traduction of form label
   */
  setFormLabels() {
    this.translate.get("PrixParFournisseur.labels").subscribe(labels => {
      this.ListformLabels = [
        {
          type: this.TypeOfFormEnum.add,
          labels: {
            title: labels['model_add_title'],
            btnSave: labels['ajouterPrixParFournisseur_btn'],
            btnClose: labels['btn_Close']
          }
        },
        {
          type: this.TypeOfFormEnum.update,
          labels: {
            title: labels['model_update_title'],
            btnSave: labels['modifierPrixParFournisseur_btn'],
            btnClose: labels['btn_Close']
          }
        }
      ]
    });
  }

  /**
   * @summary get traduction of label | this function is called from html
   */
  getFormLabels(): { title: string, btnSave: string, btnClose: string } {
    return this.ListformLabels.filter(x => x.type == this.typeOfForm)[0].labels;
  }

  spliceUpdated() {
    if (this.updateUserIndex != null) {
      const i = this.findIndex(this.ListPrixParFournisseur[this.updateUserIndex].idFournisseur);
      if (i != -1) {
        this.removeFromlistFournisseurs(i);
        this.updateUserIndex = null
      }
    }
  }

  async openAddForm(): Promise<void> {
    debugger
    await this.getFournisseurList();

    this.spliceUpdated();
    //check
    this.checkIfDefaultCheckBoxIsDisabled();



    //clean the form
    this.form.reset();
    //set type of form
    this.typeOfForm = PrixParFournisseur_TypeOfForm.add;
    //
    this.formLabels = this.getFormLabels();
    //show the form
    jQuery("#PopUpForm").modal("show");
    jQuery("#PopUpForm").modal("hide");
    jQuery("#PopUpForm").modal("show");
    // this.form.controls['idFournisseur'].setValue(null);
  }

  async openEditForm(prixParFournisseur: PrixParFournisseur, index: number): Promise<void> {
    debugger
    await this.getFournisseurList();

    this.spliceUpdated();

    if (this.listFournisseurs.filter(x => x.id == prixParFournisseur.fournisseur.id).length == 0) {
      this.pushInlistFournisseurs(prixParFournisseur.fournisseur);
    }

    //set the index of the price
    this.updateUserIndex = index;


    //check
    this.checkIfDefaultCheckBoxIsDisabled();
    //clean the form
    this.form.reset();
    //set type of form
    this.typeOfForm = PrixParFournisseur_TypeOfForm.update;
    //
    this.formLabels = this.getFormLabels();
    //init data for update
    this.form.controls['prix'].setValue(prixParFournisseur['prix']);
    this.form.controls['idFournisseur'].setValue(prixParFournisseur['idFournisseur']);
    this.form.controls['default'].setValue(prixParFournisseur['default']);
    //show the form
    jQuery("#PopUpForm").modal("show");
  }

  saveData(): void {
    debugger
    if (!this.checkFormValidation()) return;
    switch (this.typeOfForm) {
      case this.TypeOfFormEnum.add:
        this.add();
        break;
      case this.TypeOfFormEnum.update:
        this.edit();
        break;
    }
  }

  add(): void {
    debugger
    const prixParFournisseur: PrixParFournisseur = {
      id: null,
      IdProduit: this.idProduit,
      idFournisseur: this.form.value.idFournisseur,
      prix: this.form.value.prix,
      default: this.form.value.default,
      fournisseur: this.listFournisseurs[this.findIndex(this.form.value.idFournisseur)]
    }
    this.pushInPrixParFournisseur(prixParFournisseur);
    this.removeFromlistFournisseurs(this.findIndex(prixParFournisseur.idFournisseur));

    jQuery("#PopUpForm").modal("hide");
  }

  edit(): void {
    debugger
    this.ListPrixParFournisseur[this.updateUserIndex].prix = this.form.value.prix;
    this.ListPrixParFournisseur[this.updateUserIndex].idFournisseur = this.form.value.idFournisseur;
    this.ListPrixParFournisseur[this.updateUserIndex].default = this.form.value.default;

    this.ListPrixParFournisseur[this.updateUserIndex].fournisseur = this.listFournisseurs[this.findIndex(this.form.value.idFournisseur)];
    this.removeFromlistFournisseurs(this.findIndex(this.form.value.idFournisseur));

    this.updateUserIndex = null;
    jQuery("#PopUpForm").modal("hide");
  }

  remove(index: number): void {
    this.translate.get("PrixParFournisseur.delete").subscribe(async text => {
      await this.getFournisseurList();
      swal(this.swalWarningConfig(text)).then(isConfirm => {
        if (isConfirm) {
          this.pushInlistFournisseurs(this.ListPrixParFournisseur[index].fournisseur);
          this.removeFromPrixParFournisseur(index);
          this.updateUserIndex = null;
          swal(text.success, "", "success");
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }

  pushInlistFournisseurs(fournisseur: Fournisseur): void {
    const id = fournisseur.id;
    if (this.listFournisseurs.filter(x => id == x.id).length == 0) {
      this.listFournisseurs.unshift(fournisseur);
    }
  }

  pushInPrixParFournisseur(prixParFournisseur: PrixParFournisseur): void {
    const id = prixParFournisseur.idFournisseur;
    if (this.ListPrixParFournisseur.filter(x => id == x.idFournisseur).length == 0) {
      this.ListPrixParFournisseur.unshift(prixParFournisseur);
    }
  }

  removeFromlistFournisseurs(index: number): void {
    const id = this.listFournisseurs[index].id;
    if (this.listFournisseurs.filter(x => id == x.id).length != 0) {
      this.listFournisseurs.splice(index, 1);
    }
  }

  removeFromPrixParFournisseur(index: number): void {
    const id = this.ListPrixParFournisseur[index].idFournisseur;
    if (this.ListPrixParFournisseur.filter(x => id == x.idFournisseur).length != 0) {
      this.ListPrixParFournisseur.splice(index, 1);
    }
  }


  returnDataToSave(callback): void {
    // create empty body of response
    let response: PrixParFournisseur_response = {
      list: [],
      validation: {
        defaultPrice: false,
        nbOfPrices: false,
        isValid: false
      }
    }

    //check if the list have one default price at less
    const defaultPrice = this.validation.defaultPriceRequired ? (this.ListPrixParFournisseur.filter(x => x.default == true).length == this.validation.nbDefaultPrice) : true;
    if (defaultPrice == false) {
      this.dispalyMsgError();
      callback(response);
      return;
    }

    //select the number of prices
    const nbOfPrices = this.ListPrixParFournisseur.length >= this.validation.NbOfPricesRequired;
    if (nbOfPrices == false) {
      this.dispalyMsgError();
      callback(response);
      return;
    }

    //conver id founisseur to intiger
    this.ListPrixParFournisseur = this.ListPrixParFournisseur.map(element => {
      element.idFournisseur = parseInt(element.idFournisseur.toString());
      element.default = element.default ? 1 : 0;
      element.fournisseur = null;
      return element;
    });

    // create the body of response
    response = {
      list: this.ListPrixParFournisseur,
      validation: {
        defaultPrice,
        nbOfPrices,
        isValid: defaultPrice && nbOfPrices
      }
    }

    //return response
    callback(response);
  }

  checkIfDefaultCheckBoxIsDisabled(): void {
    if (this.updateUserIndex != null && this.ListPrixParFournisseur[this.updateUserIndex].default) {
      this.form.get('default').enable();
    } else {
      const length = this.ListPrixParFournisseur.filter(x => x.default == true).length;
      if (length >= this.validation.nbDefaultPrice) {
        this.form.get('default').disable();
      } else {
        this.form.get('default').enable();
      };
    }
  }

  checkFormValidation(): boolean {
    this.form.controls['idFournisseur'].setValue(this.form.value.idFournisseur == "null" ? null : this.form.value.idFournisseur);
    if (this.form.invalid) {
      this.form.touched = true;
      return false;
    } else {

      return true;
    }
  }


  dispalyMsgError(): void {
    this.translate.get("PrixParFournisseur.errors").subscribe(text => {
      toastr.warning(text.required, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
    })
  }
  /** ---------------------
   * @summary hide the form
     ---------------------- */
  closeForm() {
    jQuery("#PopUpForm").modal("hide");
  }

  findIndex(id: number | string): number {
    id = typeof (id) == "string" ? parseInt(id) : id;
    const ids: number[] = this.listFournisseurs.map(x => {
      if (x != undefined) {
        return x.id
      }
    });
    return ids.indexOf(id);
  }
  /*--------------------------------------------------
      récupérer la liste des Fournisseur de la base de données
    --------------------------------------------------*/
  getFournisseurList() {
    return new Promise((resolve, reject) => {
      if (this.listFournisseurs != null && this.listFournisseurs.length != 0) {
        resolve()
      } else {
        // this.processing = true;
        this.fournisseurService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'nom', 'asc').subscribe(res => {
          this.listFournisseurs = res.list;
          if (this.ListPrixParFournisseur.length != 0) {
            if (this.ListPrixParFournisseur[0].fournisseur == null) {
              this.ListPrixParFournisseur.map(element => {
                const ii = this.findIndex(element.idFournisseur);
                element.fournisseur = this.listFournisseurs[ii];
                this.removeFromlistFournisseurs(ii);
              });
            } else {
              this.ListPrixParFournisseur.map(element => {
                const ii = this.findIndex(element.idFournisseur);
                this.removeFromlistFournisseurs(ii);
              });
            }

          }
          resolve();
        });
      }
    });
  }

  get f() { return this.form.controls; }
}
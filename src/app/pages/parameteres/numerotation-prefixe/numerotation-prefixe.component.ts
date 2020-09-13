import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { FormBuilder, Validators } from '@angular/forms';
import { ParametereModel } from "../../../Models/ParametereModel";
import { Numerotation, Parametrage } from 'app/Models/Entities/Numerotation';
import { FormatDateParametrage } from 'app/Enums/FormatDateParametrage.enum';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
declare var toastr: any;
declare var jQuery: any;


@Component({
  selector: 'app-numerotation-prefixe',
  templateUrl: './numerotation-prefixe.component.html',
  styleUrls: ['./numerotation-prefixe.component.scss']
})
export class NumerotationPrefixeComponent implements OnInit {

  form;
  typeNumerotation: typeof TypeNumerotation = TypeNumerotation;
  formatDateParametrage: typeof FormatDateParametrage = FormatDateParametrage
  numPrefixClientFournisseur: ParametereModel[];
  numPrefixDocument: ParametereModel[];
  modelName = "";
  numerotationSelected: Numerotation
  loading = false;

  constructor(private translate: TranslateService, private parameteresService: ParameteresService, private fb: FormBuilder) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.InitData()
  }

  InitData() {

    this.loading = true;
    this.numPrefixClientFournisseur = [];
    this.numPrefixDocument = [];
    this.translate.get("labels").subscribe(async labels => {

      /* Get Code Client */
      /* this.parameteresService.Generate(this.typeNumerotation.client).subscribe(res => {
         this.numPrefixClientFournisseur.push(new ParametereModel((this.typeNumerotation.client as number), res['data'], labels.client))
       }, err => {
         this.numPrefixClientFournisseur.push(new ParametereModel((this.typeNumerotation.client as number), null, labels.client))
       });*/

      this.numPrefixClientFournisseur.push(await this.getNumPrefix(this.typeNumerotation.client, labels.client));

      /* Get Code agent */
      this.numPrefixClientFournisseur.push(await this.getNumPrefix(this.typeNumerotation.agent, labels.agent));
      /*this.parameteresService.Generate(this.typeNumerotation.agent).subscribe(res => {
        this.numPrefixClientFournisseur.push(new ParametereModel((this.typeNumerotation.agent as number), res['data'], labels.agent))
      }, err => {
        this.numPrefixClientFournisseur.push(new ParametereModel((this.typeNumerotation.agent as number), null, labels.agent))
      });*/

      /* Get Code fournisseur */
      this.numPrefixClientFournisseur.push(await this.getNumPrefix(this.typeNumerotation.fournisseur, labels.fournisseur));



      /* Get Code Devis */
      this.numPrefixDocument.push(await this.getNumPrefix(this.typeNumerotation.devis, labels.devis));

      /* Get Code Facture */
      this.numPrefixDocument.push(await this.getNumPrefix(this.typeNumerotation.facture, labels.facture));
      /* Get Code Avoir */
      this.numPrefixDocument.push(await this.getNumPrefix(this.typeNumerotation.avoir, labels.avoir));
      /* Get Code Fiche Intervention*/
      this.numPrefixDocument.push(await this.getNumPrefix(this.typeNumerotation.fiche_intervention, labels.fiche_intervention));

      /* Get Code Bon Commande Fournisseur */
      this.numPrefixDocument.push(await this.getNumPrefix(this.typeNumerotation.boncommande_fournisseur, labels.boncommande_fournisseur));
      /* Get Code Fiche Intervention maintenance*/
      this.numPrefixDocument.push(await this.getNumPrefix(this.typeNumerotation.fiche_interventionMaintenance, labels.fiche_interventionMaintenance));

      setTimeout(() => {
        this.sortList(this.numPrefixClientFournisseur);
        this.sortList(this.numPrefixDocument);
        this.loading = false;
      }, 1500)

    });
  }

  getNumPrefix(typeNumerotation, labels): Promise<any> {
    return new Promise((resolve, reject) => {
      this.parameteresService.Generate(typeNumerotation).subscribe(res => {
        // this.numPrefixClientFournisseur.push();
        resolve(new ParametereModel((typeNumerotation as number), res['data'], labels))
      }, err => {
        resolve(new ParametereModel((typeNumerotation as number), null, labels))
        // this.numPrefixClientFournisseur.push()
      });
    });

  }
  numerotaionList: Numerotation[]
  selectNumerotationtoUpdate(i, type) {


    if (type == this.typeNumerotation.client || type == this.typeNumerotation.fournisseur || type == this.typeNumerotation.agent) {
      var item = this.numPrefixClientFournisseur[i];
      this.form = this.fb.group({
        "racine": ['', [Validators.required]],
        "compteur": ['', [Validators.required]],
        "longeurCompteur": ['', [Validators.required]]
      })
      this.item(item, type);
    } else {
      var item = this.numPrefixDocument[i];
      this.form = this.fb.group({
        "racine": ['', []],
        "formatDate": ['', [Validators.required]],
        "compteur": ['', [Validators.required]],
        "longeurCompteur": ['']
      })
      this.item(item, type);
    }




  }

  item(item, type) {

    this.modelName = item.name + (item.code ? " : " + item.code : "")
    this.parameteresService.Get(TypeParametrage.numerotaion).subscribe((res: Parametrage) => {
      this.numerotaionList = JSON.parse(res.contenu);
      this.numerotationSelected = this.numerotaionList.filter(N => N.Type == type)[0];
      this.form.controls["racine"].setValue(this.numerotationSelected.Racine);
      this.form.controls["compteur"].setValue(this.numerotationSelected.Compteur);
      this.form.controls["longeurCompteur"].setValue(this.numerotationSelected.LongeurCompteur);
      if (type != this.typeNumerotation.client && type != this.typeNumerotation.fournisseur && type != this.typeNumerotation.agent || type != this.typeNumerotation.devis || type == this.typeNumerotation.fiche_intervention || type == this.typeNumerotation.facture || type == this.typeNumerotation.avoir || type == this.typeNumerotation.boncommande_fournisseur || type == this.typeNumerotation.fiche_interventionMaintenance) {
        this.form.controls["formatDate"].setValue(this.numerotationSelected.FormatDate);

      }
    })
  }

  update() {

    // type contenu
    if (this.form.valid) {
      this.translate.get("labels").subscribe(text => {
        let values = this.form.value;
        this.numerotaionList.forEach((num, index) => {
          if (num.Type == this.numerotationSelected.Type) {
            this.numerotaionList[index] = {
              Type: this.numerotationSelected.Type,
              Compteur: values['compteur'],
              FormatDate: values['formatDate'],
              LongeurCompteur: values['longeurCompteur'],
              Racine: values['racine']
            }
          }
        });

        this.parameteresService.Update(TypeParametrage.numerotaion, JSON.stringify(this.numerotaionList)).subscribe(
          res => {
            toastr.success("", text.modifierSuccess, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            jQuery("#updateParamter").modal("hide");
            this.InitData();
          }, err => {
            toastr.error("", text.error, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          }
        )
      });
    }
  }

  GenerateExampleCode() {
    let exampleCode = "";
    let values = this.form.value;
    if (values.racine != "" && values.racine != null) {
      exampleCode += values.racine
    }
    if (values.formatDate != "" && values.formatDate != null && values.formatDate != this.formatDateParametrage.PasDate) {
      const date = new Date();
      if (values.formatDate == this.formatDateParametrage.Annee) {
        exampleCode += date.getFullYear().toString()
      } else if (values.formatDate == this.formatDateParametrage.AnneeMois) {
        exampleCode += date.getFullYear().toString() + (date.getMonth() + 1).toString()
      }
    }
    exampleCode += this.pad(values.compteur == null ? "" : values.compteur, values.longeurCompteur);
    return exampleCode;
  }

  pad(num, size) {
    var s = num + "";
    while (s.length < size) s = "0" + s;
    return s;
  }

  sortList(arr: ParametereModel[]) {
    arr.sort((obj1, obj2) => {
      if (obj1.name > obj2.name) {
        return 1;
      }

      if (obj1.name < obj2.name) {
        return -1;
      }

      return 0;
    });
  }
}

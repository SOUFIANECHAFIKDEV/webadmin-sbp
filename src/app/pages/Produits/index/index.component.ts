import { Component, OnInit } from "@angular/core";
import { ProduitService } from './../../../services/produit/produit.service';
import { ProduitListModel } from "../../../Models/ProduitListModel";
import { DataTableDirective } from "angular-datatables";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { LabelService } from "app/services/labels/labels.service";
import { ShowCrudInProduitModule } from "../../../common/Helpers/ShowCrudInProduitModule";
import { Produit } from "../../../Models/Entities/Produit";
import { Label } from "../../../Models/Entities/Label";
import { LabelShowModel } from "../../../Models/LabelShowModel";
import { conversion } from "app/common/prix-conversion/conversion";

import { UserProfile } from "app/Enums/user-profile.enum";
import { LoginService } from "app/services/login/login.service";
import { Router } from "@angular/router";

declare var swal: any;
declare var toastr: any;
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {
  public dtElement: DataTableDirective;
  public Produits: ProduitListModel;
  public selectedLables: LabelShowModel[] = [];
  public labelsList: LabelShowModel[] = [];
  public labelSearch: string[] = [];
  public searchQuery: string = '';
  public pageNamber: number = 1;
  public pageSize: number = 10;
  public showCrud: boolean = true;
  public showAction: number = null;
  public id;
  public produit: Produit;
  produits: Produit;
  profile
  processing: boolean = false;

  typeProfile: typeof UserProfile = UserProfile;
  constructor(
    private produitService?: ProduitService,
    private translate?: TranslateService,
    private labelService?: LabelService,
    private router?: Router,
    private loginService?: LoginService
  ) { }

  ngOnInit() {

    this.profile = this.loginService.getUser()["idProfile"];
    (this.profile)
    // if (this.profile != this.typeProfile.franchise) {
    //   this.getFranchisees();
    // }

    //définir la langue a utiliser
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    //récupérer la list des produit
    this.GetAll(this.searchQuery, this.pageNamber, this.pageSize, 'reference', 'asc', this.labelSearch);

    //récupérer la list des labels
    this.GetAllLabels();

  }

  GetAll(search, pNumber, pSize, cSort, sDir, label): void {
    this.processing = true;

    if(label.length == 1 && label[0] == ""){
      label = [];
    }

    this.produitService.GetAll(search, pNumber, pSize, cSort, sDir, null, label).subscribe(Response => {
      Response.list = this.parseProduitLabels(Response.list);
      this.Produits = Response;
      this.processing = false;
    }, err => this.translate.get("errors").subscribe(errors => {
      if (this.processing) {
        this.processing = false;
        toastr.warning(errors.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      }
    }));
  }



  public parseProduitLabels(list: Produit[]): Produit[] {
    list.forEach(produit => {
      produit.labels = JSON.parse(produit.labels);
    });
    return list;
  }


  //boucle synchrone (helper)
  async asyncForEach(array: any[], callback: any): Promise<any> {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index], index, array)
    }
  }

  GetAllLabels() {
    this.labelService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'asc').subscribe(labels => {
      this.labelsList = this.formaterLabels(labels.list);
    });
  }

  formaterLabels(list: Label[]): LabelShowModel[] {
    let labelsList: LabelShowModel[] = [];
    list.forEach((label, index) => {
      labelsList.push({ id: index, name: label.label, disabled: false });
    });
    return labelsList;
  }

  filterParLabel(): void {
    this.formatLabelsPourFilterDesParduitParLabel(this.selectedLables).then((res: string[]) => {
      this.labelSearch = res;
      this.GetAll(this.searchQuery, this.pageNamber, this.pageSize, 'reference', 'asc', this.labelSearch);
    });
  }

  formatLabelsPourFilterDesParduitParLabel(selectedLablesList: LabelShowModel[]): Promise<string[]> {
    return new Promise((resolve) => {
      let selectedLables: string[] = [];
      if (selectedLablesList.length != 0) {
        selectedLablesList.forEach(element => {
          selectedLables.push(element.name)
        });
      } else {
        selectedLables = ['']
      }
      resolve(selectedLables);
    });
  }

  searchByQuery(query: string): void {
    if (query.length > 0 && query.length < 3) return
    this.searchQuery = query;
    this.GetAll(this.searchQuery, this.pageNamber, this.pageSize, 'reference', 'asc', this.labelSearch)
  }

  chagePageNamber(pageNamber: number): void {
    this.pageNamber = pageNamber;
    this.GetAll(this.searchQuery, this.pageNamber, this.pageSize, 'reference', 'asc', this.labelSearch);
  }

  changePageSize(size: number): void {
    this.pageSize = size;
    this.GetAll(this.searchQuery, this.pageNamber, this.pageSize, 'reference', 'asc', this.labelSearch);
  }

  delete(id: number): void {
    this.translate.get("list.delete").subscribe(text => {
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
        if (isConfirm) {
          this.envoyerDemandeSuppressionAuServeur(id, text);
        } else {
          toastr.success(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        }
      });
    });
  }

  envoyerDemandeSuppressionAuServeur(id: number, text: any): void {

    this.produitService.Delete(id).subscribe(res => {
      if (res) {
        swal(text.success, "", "success");
        this.GetAll(this.searchQuery, this.pageNamber, this.pageSize, 'reference', 'asc', this.labelSearch);
      } else {

        swal(text.ImpossibleDeSuppression, "", "error");
        //swal(text.error, "", "error");
      }
    });
  }

  swalAlertConfig(text: any): object {
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
  }

  compareDates(a1: string, a2: string): boolean {
    var date1 = new Date(a1);
    var date2 = new Date(a2);
    /*-----------------------*/
    var fDate, lDate, cDate;
    fDate = new Date(date1);
    lDate = new Date(date2);
    cDate = Date.now();
    /*-----------------------*/
    if ((cDate <= lDate && cDate >= fDate)) {
      return true;
    }
    return false;
    /*-----------------------*/
  }

  conversion = new conversion()
  // prixTtc(cout_horaire: number, cout_materiel: number, tva: number) {
  //   if (cout_horaire != null && cout_materiel != null) {
  //     return this.conversion.GetTTcByTva(cout_horaire, cout_materiel, tva)
  //   }
  // }
  prixTtc(produit): number | 0 {
    if (produit == undefined) return;
    return produit.prixHt * ((produit.tva / 100) + 1);
  }
  /**
    * double clique pour passer au details de produit
    */
  preventSingleClick = false;
  timer: any;
  doubleClick(idProduit) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.router.navigate(['/produits/detail', idProduit]);
  }
}


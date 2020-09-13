import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { BonCommandeFournisseurService } from "app/services/bonCommandeFournisseur/bonCommandeFournisseur.service";
import { BonCommandeFournisseurListModel } from "app/Models/Entities/BonCommandeFournisseur";
import { ChantierService } from "app/services/chantier/chantier.service";
import { FournisseurService } from "app/services/fournisseur/fournisseur.service";
import { StatutBonCommandeFournisseur } from "app/Enums/StatutBonCommandeFournisseur.Enum";
import { Router } from "@angular/router";
import { NgSelectComponent } from "@ng-select/ng-select";

declare var swal: any;
declare var toastr: any;

@Component({
  selector: "app-boncommane-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"]
})
export class IndexComponent implements OnInit {
  @Input("statut") statut;
  @Input("idChantier") idChantier = null;
  @Input("CallFromOutside") CallFromOutside = false;
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  BonCommandeFournisseur: BonCommandeFournisseurListModel;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang = {};
  i = 0;
  total;
  BonCommandeFournisseurTableColumns: any = [];
  checkedColumns: any = [];
  pageLength: number = AppSettings.SIZE_PAGE;
  processing: boolean = false;
  initPage = 0;
  chantier = null;
  idFournisseur = null;
  listChantiers: any = null;
  dateLang;
  listStatus: any = [];
  dateMinimal: Date;
  dateMaximal: Date;
  statutBCFournisseur: typeof StatutBonCommandeFournisseur = StatutBonCommandeFournisseur
  listFournisseurs = null;

  constructor(
    private bonCommandeFournisseurService: BonCommandeFournisseurService,
    private translate: TranslateService,
    private previousRouteService: PreviousRouteService,
    private chantierService: ChantierService,
    private fournisseurService: FournisseurService,
    private router: Router,
  ) { }

  async ngOnInit() {

    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    let transalation = await this.getTranslationByKey('datePicker');
    this.dateLang = transalation;
    this.translate.get("labels").subscribe(labels => {
      this.BonCommandeFournisseurTableColumns = [labels.reference, labels.status, labels.dateCreation, labels.dateExpiration, labels.chantier, labels.fournisseur, labels.total, labels.action]
    });
    const transaltions = await this.getTranslationByKey('labels');

    this.listStatus.push({ value: this.statutBCFournisseur.Brouillon, name: transaltions.brouillon });
    this.listStatus.push({ value: this.statutBCFournisseur.Encours, name: transaltions.encours });
    this.listStatus.push({ value: this.statutBCFournisseur.Facturee, name: transaltions.facture });
    this.listStatus.push({ value: this.statutBCFournisseur.Annule, name: transaltions.annule });
  }

  GetAll(search, pNumber, pSize, cSort, sDir) {
    this.bonCommandeFournisseurService
      .GetAll(search, pNumber, pSize, cSort, sDir)
      .subscribe(Response => {
        this.BonCommandeFournisseur = Response;
      });
  }

  InitDataTable() {

    this.processing = true;
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem("module_fournisseur_info"));
    this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
    let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();

    if (previousUrl.includes("/BonCommandeFournisseur/detail") || previousUrl.includes("/BonCommandeFournisseur/modifier")) {
      if (oldChoices && oldChoices.start != null) this.initPage = oldChoices.start;
    }

    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      displayStart: this.initPage,
      serverSide: true,
      processing: false,
      search: { search: oldChoices && oldChoices.search != null ? oldChoices.search : "" },
      data: [],
      order: order,
      language: this.dataTablesLang,
      //columnDefs: [{ orderable: false, targets: 6 }],
      columnDefs: [{ orderable: false, targets: 7 }, { orderable: false, targets: 2 }],

      ajax: (dataTablesParameters: any, callback) => {
        this.saveChoices(dataTablesParameters.length,
          dataTablesParameters.search.value,
          dataTablesParameters.order[0].column,
          dataTablesParameters.order[0].dir,
          dataTablesParameters.start);

        this.bonCommandeFournisseurService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.dateMinimal != null ? AppSettings.formaterDatetime(this.dateMinimal.toString()) : null,
            this.dateMaximal != null ? AppSettings.formaterDatetime(this.dateMaximal.toString()) : null,
            this.idChantier,
            this.idFournisseur,
            this.statut,
          )
          .subscribe(data => {
            this.BonCommandeFournisseur = data;
            this.GetInitParameters();
            if (this.i == 0) {
              this.total = data.totalItems;
              this.i++;
            }
            callback({
              recordsTotal: this.total,
              recordsFiltered: data.totalItems,
              data: []
            });
            this.processing = false;
          }, err => this.translate.get("errors").subscribe(errors => {
            if (this.processing) {
              this.processing = false;
              toastr.warning("errors.serveur", "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            }
          }));

      },
      columns: [
        { data: "reference" },
        { data: "statut" },
        { data: "dateCreation" },
        { data: "dateExpiration" },
        { data: "chantier" },
        { data: "fournisseur" },
        { data: 'total' },
        { data: "action" }
      ]
    };
  }

  delete(id) {
    this.translate.get("list.deletebonCommande").subscribe(text => {
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
      }).then(isConfirm => {
        if (isConfirm) {
          this.bonCommandeFournisseurService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, "", "success");
              this.rerender();
            } else {
              swal(text.ImpossibleDeSuppression, "", "error");
            }
          });
        } else {

          swal(text.cancel, "", "error");
        }
      });
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.InitDataTable();
      this.dtTrigger.next();
      this.rerender();
    }, 500);
    setTimeout(() => {
      this.processing = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  getDataTablesTrans() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("dataTablesBonCommandeFournisseur").subscribe((text: string) => {
      this.dataTablesLang = text;
      this.InitDataTable();
    });
  }

  SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
    localStorage.setItem("module_BonCommandeFournisseur_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_BonCommandeFournisseur_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
  }

  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_BonCommandeFournisseur_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }

  /**
   * get chantier
   */
  @ViewChild('selecteChantiers') selecteChantiers: NgSelectComponent;
  getChantiers() {
    debugger
    if (this.listChantiers == null) {
      this.processing = true;
      this.chantierService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC', null).subscribe(res => {
        this.listChantiers = res.list;
      }, err => {

      }, () => {
        this.processing = false;
        this.selecteChantiers.isOpen = true;
      });
    }
  }

  @ViewChild('selecteFournisseurs') selecteFournisseurs: NgSelectComponent;
  getFournisseurs() {
    debugger
    if (this.listFournisseurs == null) {
      this.processing = true;
      this.fournisseurService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC').subscribe(res => {
        this.listFournisseurs = res.list;
      }, err => {
        this.processing = false;
        this.selecteFournisseurs.isOpen = true;
      });
    }
  }


  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation);
      });
    });
  }

  navigateToCreationComponent() {
    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/commandes_devis/ajouter` : `/bonCommandeFournisseur/ajouter`;
    this.router.navigate([url]);
  }

  navigateToEditComponent(idBCFournisseur: number): void {

    console.log("id bc ", idBCFournisseur)
    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/commandes_devis/modifier/${idBCFournisseur}` : `/bonCommandeFournisseur/modifier/${idBCFournisseur}`;
    this.router.navigate([url])
  }

  navigateToDetailComponent(idBCFournisseur: number) {

    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/commandes_devis/detail/${idBCFournisseur}` : `/bonCommandeFournisseur/detail/${idBCFournisseur}`;
    this.router.navigate([url]);
  }

  navigateTo(target: string, params: any): void {
    switch (target) {
      case 'add':
        this.navigateToCreationComponent();
        break;
      case 'edit':
        this.navigateToEditComponent(params['idBCFournisseur']);
        break;
      case 'detail':
        this.navigateToDetailComponent(params['idBCFournisseur']);
        break;
    }
  }

  /**
   * double clique pour passer au details de bc fournisseur
   */
  preventSingleClick = false;
  timer: any;
  delay: Number;

  doubleClick(bcFournisseur) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.navigateToDetailComponent(bcFournisseur.id)
  }
}
import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Depense } from 'app/Models/Entities/depense';
import { DepenseListModel } from 'app/Models/DepenseListModel';
import { Subject } from 'rxjs';
import { StatutDepense, CategorieDepense } from 'app/Enums/StatutDepense.Enum';
import { AppSettings } from 'app/app-settings/app-settings';
import { TranslateService } from '@ngx-translate/core';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { FactureService } from 'app/services/facture/facture.service';
import { LoginService } from 'app/services/login/login.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { DepenseService } from 'app/services/depense/depense.service';
import { FournisseurService } from 'app/services/fournisseur/fournisseur.service';
import { StatutComptabilise } from 'app/Enums/StatutComptabilise.enum';
import { Chantier } from 'app/Models/Entities/Chantier';
import { NgSelectComponent } from '@ng-select/ng-select';
import { Router } from '@angular/router';

declare var swal: any;
declare var toastr: any;

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  Depenses: DepenseListModel;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang = {};
  tableColumns: any[];
  dateLang;

  // tableColumns: any[];
  statutDepense: typeof StatutDepense = StatutDepense;
  statutComptabilise: typeof StatutComptabilise = StatutComptabilise;
  categorieDepense: typeof CategorieDepense = CategorieDepense;

  listStatus: any = [];
  pageLength = AppSettings.SIZE_PAGE;
  initPage = 0;
  processing: boolean = false;

  checkedColumns: any = [];
  dateMinimal: Date;
  dateMaximal: Date;
  status;
  oldChoices: any;
  i = 0;
  total;
  depense = null;
  listDepenses: any = [];
  idProfile;
  listChantiers: Chantier[] = null;
  listFournisseurs
  @Input("statut") statut;
  @Input("orderBy") orderBy;
  @Input("nameModule") nameModule;
  @Input("idChantier") idChantier = null;
  @Input("idFournisseur") idFournisseur = null;
  @Input("CallFromOutside") CallFromOutside = false;

  constructor(
    private translate?: TranslateService,
    private previousRouteService?: PreviousRouteService,
    private loginService?: LoginService,
    private chantierService?: ChantierService,
    private depenseService?: DepenseService,
    private router?: Router,
    private fournisseurService?: FournisseurService,
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    //
    let transalation = await this.getTranslationByKey('dataTablesDepense');
    this.dataTablesLang = transalation;
    //
    transalation = await this.getTranslationByKey('datePicker');
    this.dateLang = transalation;
    //
    this.tableColumns = await this.setTableColumns();
    //
    this.idProfile = this.loginService.getUser()["idProfile"];

    const transaltions = await this.getTranslationByKey('labels');
    this.listStatus.push({ value: this.statutDepense.Brouillon, name: transaltions.brouillon });
    this.listStatus.push({ value: this.statutDepense.Encours, name: transaltions.encours });
    this.listStatus.push({ value: this.statutDepense.Cloture, name: transaltions.cloturee });
    this.listStatus.push({ value: this.statutDepense.Enretard, name: transaltions.enretard });
    this.listStatus.push({ value: this.statutDepense.Annule, name: transaltions.annulee });

  }

  GetAll(search, pNumber, pSize, cSort, sDir) {

    this.depenseService
      .GetAll(search, pNumber, pSize, cSort, sDir)
      .subscribe(Response => {
        this.Depenses = Response;
      });
  }

  async setTableColumns(): Promise<any[]> {
    const transalation = await this.getTranslationByKey('labels'); return [transalation.reference, transalation.status, transalation.dateCreation,
    transalation.dateExpiration, transalation.chantier, transalation.fournisseur, transalation.total, transalation.categorie, transalation.action]

  }

  InitDataTable() {

    this.processing = true;
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem("module_depense_info"));
    this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
    let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes("/depense/detail") || previousUrl.includes("/depense/modifier")) {
      if (oldChoices && oldChoices.start != null) this.initPage = oldChoices.start;
    }

    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      serverSide: true,
      processing: false,
      displayStart: this.initPage,
      search: { search: oldChoices && oldChoices.search != null ? oldChoices.search : "" },
      order: order,
      language: this.dataTablesLang,
      //    paramOrder = [{ orderable: false, targets: 12 }]
      columnDefs: [{ orderable: false, targets: 8 }, { orderable: false, targets: 2 }],
      ajax: (dataTablesParameters: any, callback) => {
        this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir, dataTablesParameters.start);
        this.depenseService
          .GetAll(

            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.statut,
            this.idChantier,
            this.idFournisseur
          )
          .subscribe(data => {
            this.Depenses = data;
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
              toastr.warning(errors.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            }
          }));

      },
      columns: this.getColumns()
    };
  }

  getColumns() {
    return [
      { data: 'reference' },
      { data: 'status' },
      { data: 'dateCreation' },
      { data: 'dateExpiration' },
      { data: 'chantier' },
      { data: 'fournisseur' },
      { data: 'total' },
      { data: 'categorie' },
      { data: 'action' }];
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.GetInitParameters()
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
    if (this.dtElement.dtInstance == undefined) return;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
    localStorage.setItem("module_depense_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_depense_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
  }

  filterParStatut() {
    this.rerender();
  }

  ngOnChanges() {
    if (!this.processing) {
      this.rerender();
    }
  }

  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_depense_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }
  /**
   * list des chantiers
   */
  @ViewChild('selecteChantier') selecteChantier: NgSelectComponent;
  getChantiers(openListOptions: boolean) {
    debugger
    if (this.listChantiers == null) {
      this.processing = true;
      this.chantierService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC', null).subscribe(res => {
        console.log(res)
        this.listChantiers = res.list
      }, error => {
        this.translate.get('errors').subscribe(text => {
          toastr.warning(text.serveur, '', {
            positionClass: 'toast-top-center',
            containerId: 'toast-top-center',
          });
        })
      }, () => {
        this.processing = false;
        if (openListOptions) {
          this.selecteChantier.isOpen = true;
        }

      });
    }
  }
  /**
   * list des fournisseurs
   */
  @ViewChild('selecteFournisseurs') selecteFournisseurs: NgSelectComponent;
  getFournisseurs(openListOptions) {
    if (this.listChantiers == null) {
      this.processing = true;
      this.fournisseurService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC').subscribe(res => {
        this.listFournisseurs = res.list
      }, error => {
        this.translate.get('errors').subscribe(text => {
          toastr.warning(text.serveur, '', {
            positionClass: 'toast-top-center',
            containerId: 'toast-top-center',
          });
        })
      }, () => {
        this.processing = false;
        if (openListOptions) {
          this.selecteFournisseurs.isOpen = true;
        }

      });
    }
  }

  delete(id) {

    this.translate.get('list.delete').subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
        icon: 'warning',
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: '',
            closeModal: true,
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: '',
            closeModal: true,
          },
        },
      }).then(isConfirm => {
        if (isConfirm) {
          this.depenseService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, '', 'success');
              this.rerender();
            }
          });
        } else {
          toastr.success(text.failed, text.title, {
            positionClass: 'toast-top-center',
            containerId: 'toast-top-center',
          });
        }
      });
    });
  }

  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation);
      });
    });
  }

  /**
     * double clique pour passer au details de depense
     */
  preventSingleClick = false;
  timer: any;
  delay: Number;

  doubleClick(depense) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.router.navigate(['/depense/detail', depense.id]);
  }

}

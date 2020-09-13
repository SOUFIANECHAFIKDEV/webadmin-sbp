import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { Subject } from 'rxjs';
import { DataTableDirective } from 'angular-datatables';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
import { AvoirService } from 'app/services/avoir/avoir.service';
import { AvoirListModel } from 'app/Models/AvoirsListModel';
import { LoginService } from 'app/services/login/login.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { StatutComptabilise } from 'app/Enums/StatutComptabilise.enum';
import { infoClientModel } from 'app/Models/Entities/Avoir';
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
  avoirs: AvoirListModel;
  dtOptions: DataTables.Settings
  statutAvoir: typeof StatutAvoir = StatutAvoir;
  dataTablesLang
  dateLang
  avoirTableColumns: any[];
  listStatus: any = [];
  pageLength = AppSettings.SIZE_PAGE;
  initPage = 0;
  loading = false;
  dtTrigger: Subject<any> = new Subject();
  checkedColumns: any = [];
  dateMinimal: Date
  dateMaximal: Date
  statut
  oldChoices: any;
  i = 0;
  total;
  //statutComptabilise: typeof StatutComptabilise = StatutComptabilise
  chantier = null;
  idClient = null;
  listChantiers: any = [];
  processing: boolean = false;
  statutComptabilise: typeof StatutComptabilise = StatutComptabilise


  constructor(
    private translate?: TranslateService,
    private previousRouteService?: PreviousRouteService,
    private avoirService?: AvoirService,
    private loginService?: LoginService,
    private router?: Router,
    private chantierService?: ChantierService
  ) { }

  ngOnInit() {
    let currentUser = this.loginService.getUser()
    //this.isFranchise = (currentUser['idProfile'] == UserProfile.franchise)
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
    this.translate.get("labels").subscribe(labels => {
      this.avoirTableColumns = [labels.reference, labels.statut, labels.client, labels.dateCreation, labels.dateEcheance, labels.totalTTC, labels.actions];
      this.listStatus.push({ value: StatutAvoir.Brouillon, name: labels.brouillon });
      this.listStatus.push({ value: StatutAvoir.Encours, name: labels.encours });
      this.listStatus.push({ value: StatutAvoir.Utilise, name: labels.utilise });
      this.listStatus.push({ value: StatutAvoir.Expire, name: labels.expire });
    });
    this.getChantierService();
  }
  getChantierService() {
    this.chantierService
      .GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC', null)
      .subscribe(res => {
        this.listChantiers = res.list;
      });
  }

  /**
    * double clique pour passer au details d avoir 
    */
  preventSingleClick = false;
  timer: any;
  delay: Number;

  doubleClick(avoir) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.router.navigate(['/avoirs/detail', avoir.id]);
  }

  GetNameOfChantier(idChantier) {
    const result = (this.listChantiers as any[]).filter(c => c.id == idChantier);
    return result.length > 0 ? result[0].nom : '';
  }
  InitDataTable() {
    this.processing = true;
    // recupérer old paramétere
    this.getOldChoice();
    this.pageLength = !this.oldChoices || this.oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(this.oldChoices.page_length);
    let order = !this.oldChoices || this.oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(this.oldChoices.sort), this.oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes("/avoirs/detail") || previousUrl.includes("/avoirs/modifier")) {
      if (this.oldChoices && this.oldChoices.start != null) this.initPage = this.oldChoices.start;
    }

    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      serverSide: true,
      processing: false,
      displayStart: this.initPage,
      order: order,
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 6 }, { orderable: false, targets: 2 }],
      ajax: (dataTablesParameters: any, callback) => {

        setTimeout(() => {
          this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir, dataTablesParameters.start);
        }, 1000)

        this.avoirService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.statut != null ? [this.statut] : [],
            this.dateMinimal != null ? AppSettings.formaterDatetime(this.dateMinimal.toString()) : null,
            this.dateMaximal != null ? AppSettings.formaterDatetime(this.dateMaximal.toString()) : null,
            this.chantier,
            this.idClient
          )
          .subscribe(data => {
            this.avoirs = data;
            this.GetInitParameters();
            if (this.i == 0) {
              this.total = data.totalItems;
              this.i++;
            }
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
      columns: [
        { data: "reference" },
        { data: "statut" },
        { data: "client" },
        { data: "dateCreation" },
        { data: "dateEcheance" },
        { data: "total" },
        { data: "action" }
      ]
    };
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
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
      setTimeout(() => {
        this.getOldChoice()
        if (this.oldChoices && this.oldChoices.search != null && this.oldChoices.search != '') {
          var table = $('#avoirTable').DataTable();
          table.search(this.oldChoices.search).draw();
        }
      }, 500)
    });
  }

  getDataTablesTrans() {
    this.translate.get("dataTables").subscribe((text: string) => {
      this.dataTablesLang = text;
    });
  }

  SetCheckedColmuns(arr) {
    localStorage.setItem("module_avoir_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_avoir_colmuns"));
    this.checkedColumns = (data == null ? [false, false, false, false, false, false, false] : data)
  }

  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_avoir_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }

  getOldChoice() {
    this.oldChoices = JSON.parse(localStorage.getItem("module_avoir_info"));
  }

  indexChangeDateMinimal = 0;
  changeDateMinimal() {
    if (this.dateMinimal != null) {
      this.rerender();
      this.indexChangeDateMinimal = 0;
    } else if (this.indexChangeDateMinimal == 0) {
      this.rerender();
      this.indexChangeDateMinimal++;
    }
  }

  indexChangeDateMaximal = 0;
  changeDateMaximal() {
    if (this.dateMaximal != null) {
      this.rerender();
      this.indexChangeDateMaximal = 0;
    } else if (this.indexChangeDateMaximal == 0) {
      this.rerender();
      this.indexChangeDateMaximal++;
    }
  }

  delete(id) {
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
          this.avoirService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, "", "success");
              this.rerender();
            }
          });
        } else {
          toastr.success(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        }
      });
    });
  }
  loadClient(clientInfo) {
    let infoClient: infoClientModel = new infoClientModel();
    infoClient = JSON.parse(clientInfo);
    return infoClient == null ? '' : infoClient.nom;

  }

}

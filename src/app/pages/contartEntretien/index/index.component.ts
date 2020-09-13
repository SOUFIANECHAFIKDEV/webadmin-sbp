import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ContratEntretienListModel } from 'app/Models/ContratEntretienListModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { Subject } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { ContratEntretienService } from 'app/services/contratEntretien/contrat-entretien.service';
import { Router } from '@angular/router';
import { Client } from 'app/Models/Entities/Client';
import { Dropdown } from 'app/custom-module/primeng/primeng';
import { ClientService } from 'app/services/client/client.service';
import { NgSelectComponent } from '@ng-select/ng-select';
import { StatutContratEntretien } from 'app/Enums/StatutContratEntretien.Enum';
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
  contratEntretiens: ContratEntretienListModel;
  dtOptions: DataTables.Settings;
  dataTablesLang;
  dateLang;
  tableColumns: any[];
  pageLength = AppSettings.SIZE_PAGE;
  initPage = 0;
  processing: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  checkedColumns: any = [];
  oldChoices: any;
  i = 0;
  total;
  dateMinimal: Date;
  dateMaximal: Date;

  statut = null;
  listStatus: any = null;
  clients: Client[] = null;
  idClient = null;
  statutcontratEntretien: typeof StatutContratEntretien = StatutContratEntretien;
  constructor(
    private translate: TranslateService,
    private previousRouteService: PreviousRouteService,
    private contratEntretienService: ContratEntretienService,
    private clientService: ClientService,
    private router: Router,
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    let transalation = await this.getTranslationByKey('dataTables');
    this.dataTablesLang = transalation;
    transalation = await this.getTranslationByKey('datePicker');
    this.dateLang = transalation;
    this.translate.get('labels').subscribe(labels => {
      this.tableColumns = [
        labels.client,
        labels.statut,
        labels.dateDebut,
        labels.dateFin,
        labels.actions,
      ]
    })
    //  this.getClients();
  }
  InitDataTable() {
    this.processing = true;
    // recupérer old paramétere
    this.getOldChoice();
    this.pageLength =
      !this.oldChoices || this.oldChoices.page_length == null
        ? AppSettings.SIZE_PAGE
        : parseInt(this.oldChoices.page_length);
    let order =
      !this.oldChoices || this.oldChoices.sort == null
        ? [[0, 'asc']]
        : [[parseInt(this.oldChoices.sort), this.oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes('/contartEntretiens/detail') || previousUrl.includes('/contartEntretiens/modifier')) {
      if (this.oldChoices && this.oldChoices.start != null) this.initPage = this.oldChoices.start;
    }
    debugger
    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true,
      processing: false,
      displayStart: this.initPage,
      order: order,
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 4 }, { orderable: false, targets: 2 }],

      ajax: (dataTablesParameters: any, callback) => {
        setTimeout(() => {
          this.saveChoices(
            dataTablesParameters.length,
            dataTablesParameters.search.value,
            dataTablesParameters.order[0].column,
            dataTablesParameters.order[0].dir,
            dataTablesParameters.start
          );
        }, 1000);

        console.log("statut", this.statut)
        this.contratEntretienService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.statut,
            this.dateMinimal != null ? AppSettings.formaterDatetime(this.dateMinimal.toString()) : null,
            this.dateMaximal != null ? AppSettings.formaterDatetime(this.dateMaximal.toString()) : null,
            this.idClient,

          )
          .subscribe(data => {
            this.contratEntretiens = data;
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
              data: [],
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
        { data: 'client' },
        { data: 'status' },
        { data: 'dateDebut' },
        { data: 'dateFin' },
        { data: 'action' },
      ],
    };
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.GetInitParameters();
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
        this.getOldChoice();
        if (this.oldChoices && this.oldChoices.search != null && this.oldChoices.search != '') {
          var table = $('#contratEntretienTable').DataTable();
          table.search(this.oldChoices.search).draw();
        }
      }, 500);
    });
  }
  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem('module_contratEntretien_info'));
    this.checkedColumns = data == null ? [false, false, false, false] : data
  }
  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem(
      'module_contratEntretien_info', JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start })
    )
  }
  getOldChoice() {
    this.oldChoices = JSON.parse(localStorage.getItem('module_contratEntretien_info'));
  }

  getDataTablesTrans() {
    this.translate.get('dataTables').subscribe((text: string) => {
      this.dataTablesLang = text;
    });
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

  @ViewChild('selecteStatus') selecteStatus: NgSelectComponent;
  async getlistStatus() {
    if (this.listStatus == null) {
      const transaltions = await this.getTranslationByKey('labels');
      this.listStatus = [];
      this.listStatus.push({ value: StatutContratEntretien.Brouillon, name: transaltions.brouillon });
      this.listStatus.push({ value: StatutContratEntretien.Encours, name: transaltions.encours });
      this.listStatus.push({ value: StatutContratEntretien.Enattente, name: transaltions.enattente });
      this.listStatus.push({ value: StatutContratEntretien.Termine, name: transaltions.termine });
      this.listStatus.push({ value: StatutContratEntretien.Annule, name: transaltions.annulee });
      this.selecteStatus.isOpen = true;
    }
  }
  @ViewChild('selecteClients') selecteClients: NgSelectComponent;
  getClients() {
    if (this.clients == null) {
      this.processing = true;
      this.clientService.GetAll('', 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "desc").subscribe(res => {
        console.log(res)
        this.clients = res.list
      }, error => {
        this.translate.get('errors').subscribe(text => {
          toastr.warning(text.serveur, '', {
            positionClass: 'toast-top-center',
            containerId: 'toast-top-center',
          });
        })
      }, () => {
        this.processing = false;
        this.selecteClients.isOpen = true;
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
          this.contratEntretienService.Delete(id).subscribe(res => {
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
  doubleClick(id) {
    this.router.navigate(['/contratentretiens/detail', id])
  }
}

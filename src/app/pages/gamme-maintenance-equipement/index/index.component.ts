import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { GammeMaintenanceEquipementService } from 'app/services/gammemaintenanceequipement/gammemaintenanceequipement.service';
import { Router } from '@angular/router';
import { DataTableDirective } from 'angular-datatables';
import { GammeMaintenanceEquipementListModel } from 'app/Models/GammeMaintenanceEquipementListModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { Subject } from 'rxjs';

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
  gammeMaintenanceEquipements: GammeMaintenanceEquipementListModel;
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


  constructor(private translate: TranslateService,
    private previousRouteService: PreviousRouteService,
    private gammmeMiantenanceEquipementService: GammeMaintenanceEquipementService,
    private router: Router) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get('labels').subscribe(labels => {
      this.tableColumns = [
        labels.nom,
        labels.actions
      ]
    })
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
    if (previousUrl.includes('/equipements/detail') || previousUrl.includes('/equipements/modifier')) {
      if (this.oldChoices && this.oldChoices.start != null) this.initPage = this.oldChoices.start;
    }

    this.dtOptions = {
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true,
      processing: false,
      displayStart: this.initPage,
      order: order,
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 1 }],
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
        this.gammmeMiantenanceEquipementService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
          ).subscribe(data => {
            debugger
            this.gammeMaintenanceEquipements = data;
            this.GetInitParameters();
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
          })
          )
      },
      columns: [
        { data: 'nom' },
        { data: 'action' },
      ]

    }

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
          var table = $('#factureTable').DataTable();
          table.search(this.oldChoices.search).draw();
        }
      }, 500);
    });
  }

  getDataTablesTrans() {
    this.translate.get('dataTables').subscribe((text: string) => {
      this.dataTablesLang = text;
    })
  }
  SetCheckedColmuns(arr) {
    localStorage.setItem('module_facture_colmuns', JSON.stringify(arr));
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem('module_facture_colmuns'));
    this.checkedColumns = data == null ? [false, false, false, false, false, false, false] : data;
  }
  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem(
      'module_facture_info',
      JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start })
    );
  }

  getOldChoice() {
    this.oldChoices = JSON.parse(localStorage.getItem('module_facture_info'));
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
          this.gammmeMiantenanceEquipementService.Delete(id).subscribe(res => {
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

  /**
 * double clique pour passer au details de facture
 */
  preventSingleClick = false;
  timer: any;
  doubleClick(idEquipement) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.router.navigate(['/gammemaintenanceequipements/detail', idEquipement])
  }

}

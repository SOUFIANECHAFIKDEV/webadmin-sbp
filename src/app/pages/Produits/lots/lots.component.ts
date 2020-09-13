import { Component, ViewChild, OnInit } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { LotsService } from 'app/services/lots/lots.service';
import { Lots } from 'app/Models/Entities/Lots';
import { LotsListModel } from 'app/Models/LotsListModel';
import { TranslateService } from "@ngx-translate/core";
import { DataTableDirective } from 'angular-datatables';
declare var swal: any;
declare var toastr: any;
declare var jQuery: any;
import { Subject } from "rxjs";
import { IFormType } from './lots-form/IFormType.enum';


@Component({
  selector: 'app-lots',
  templateUrl: './lots.component.html',
  styleUrls: ['./lots.component.scss']
})
export class lotsComponent implements OnInit {
  pageLength = AppSettings.SIZE_PAGE;
  initPage = 0;
  dataTablesLang;
  dtOptions: DataTables.Settings;
  lots: LotsListModel;
  i = 0;
  total;
  lotsTableColumns: any = [];
  @ViewChild(DataTableDirective)

  dtElement: DataTableDirective;
  dtTrigger: Subject<any> = new Subject();
  checkedColumns: any = [];
  processing:boolean = false;
  formType: typeof IFormType = IFormType;
  public formConfig = {
    type: null,
    defaultData: null
  }
  emitter: any = {};

  initialiser(){ 
    this.emitter.initialiser();
  }
  constructor(
    private previousRouteService: PreviousRouteService,
    private lotsService: LotsService,
    private translate: TranslateService,
  ) {

  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get("labels").subscribe(labels => {
      this.lotsTableColumns = [labels.nom, labels.action]
    });
  }

  InitDataTable() {
    this.processing = true;
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem("module_lots_info"));
    this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
    let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes("/lots/detail") || previousUrl.includes("/lots/modifier")) {
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
      columnDefs: [{ orderable: false, targets: 1 }],
      ajax: (dataTablesParameters: any, callback) => {
        this.lotsService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
          )
          .subscribe(data => {
            this.lots = data;

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
        { data: "nom" },
        { data: "action" }
      ]
    };
  }

  getDataTablesTrans() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("dataTables").subscribe((text: string) => {
      
      this.dataTablesLang = text;
      this.InitDataTable();
    });
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
          this.lotsService.Delete(id).subscribe(res => {
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

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.InitDataTable();
      this.dtTrigger.next();
      this.rerender();
    }, 100);
    setTimeout(() => {
      this.processing = false;
    }, 500);
  }

  setformConfig(defaultData, type) {
    this.formConfig.defaultData = defaultData;
    this.formConfig.type = type;
  }

  OnSave(lot: Lots) {
    
    if (this.formConfig.type == IFormType.add) {
      this.add(lot);
    }
    if (this.formConfig.type == IFormType.update) {
      this.update(lot);
    }
  }

  add(lot: Lots) {
    this.lotsService.Add(lot).subscribe(res => {
      this.translate.get("add").subscribe(text => {
        this.rerender();
        jQuery("#lotsModel").modal("hide");
        toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }, err => {
      this.translate.get("add").subscribe(text => {
        toastr.danger(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    });
  }

  update(lot: Lots) {
    this.lotsService.Update(lot.id, lot).subscribe(res => {
      this.translate.get("update").subscribe(text => {
        this.rerender();
        jQuery("#lotsModel").modal("hide");
        toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }, err => {
      this.translate.get("update").subscribe(text => {
        toastr.danger(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    });
  }
}

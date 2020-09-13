import { Component, OnInit, ViewChild } from "@angular/core";
import { LabelService } from "app/services/labels/labels.service";
import { LabelListModel } from "../../../Models/LabelsListModel";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
declare var swal: any;
declare var toastr: any;

@Component({
  selector: 'app-labels',
  templateUrl: './labels.component.html',
  styleUrls: ['./labels.component.scss']
})
export class LabelsComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  Labels: LabelListModel;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang = {};
  i = 0;
  total;
  labelTableColumns: any = [];
  checkedColumns: any = [];
  pageLength: number = AppSettings.SIZE_PAGE;
  loading = true;
  formConfig = {
    operation: 'add',
    value: {
      label: ''
    }
  };
  idSociete
  recordsTotal;
  recordsFiltered ;

  constructor(
    private labelService: LabelService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get("labels").subscribe(labels => {
      this.labelTableColumns = [labels.label, labels.nombreDeFois, labels.actions]
      this.dataTablesLang['searchPlaceholder'] = labels.label
    });
  }

  GetAll(search, pNumber, pSize, cSort, sDir) {
    this.labelService
      .GetAll(search, pNumber, pSize, cSort, sDir)
      .subscribe(Response => {
        this.Labels = Response;
      });
  }

  InitDataTable() {
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem("module_label_info"));
    this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
    let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      search: { search: oldChoices && oldChoices.search != null ? oldChoices.search : "" },
      data: [],
      order: order,
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 2 }],
      ajax: (dataTablesParameters: any, callback) => {
        if((dataTablesParameters.search.value != '' && dataTablesParameters.search.value.length <3) || dataTablesParameters.search.value == ' ')
        {
            callback({
            recordsTotal: this.recordsTotal,
            recordsFiltered: this.recordsFiltered,
            data: []
            });
            return;
        }
        this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir);
        this.labelService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column]
              .data,
            dataTablesParameters.order[0].dir
          )
          .subscribe(data => {
            this.Labels = data;
            this.GetInitParameters();
            if (this.i == 0) {
              this.total = data.totalItems;
              this.i++;
            }
            this.recordsTotal = this.total;
            this.recordsFiltered = data.totalItems;
            callback({
              recordsTotal: this.total,
              recordsFiltered: data.totalItems,
              data: []
            });
          });
      },
      columns: [
        { data: "label" },
        { data: "nombreDeFois" },
        { data: "action" }
      ]
    };
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
          this.labelService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, "", "success");
              this.rerender();
            } else {
              swal(text.error, "", "error");
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
      this.loading = false;
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
    this.translate.get("dataTables").subscribe((text: string) => {
      this.dataTablesLang = text;
    });
    this.InitDataTable();
  }

  SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
    localStorage.setItem("module_label_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_label_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
  }

  saveChoices(length, search, sort, dir) {
    localStorage.setItem("module_label_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir }));
  }

  FormSubmit(output) {
    
    switch (this.formConfig.operation) {
      case 'add':
        this.add(output.body)
        break;
      case 'update':
        this.update(output)
        break;
    }
  }

  update(output: { id: number, body: { label: string } }) {
    
    this.labelService.Update(output.id, output.body.label).subscribe(res => {
      if (res) {
        this.rerender();
        this.formConfig.value.label = '';
        this.translate.get("form").subscribe(text => {
          toastr.success(text.edit.success, '', {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
        });
      } else {
        this.translate.get("form").subscribe(text => {
          toastr.warning(text.alreadyExists, '', {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
        });
      }
    });
  }

  add(body: any) {
    
    //label
    this.labelService.Add(body.label).subscribe(res => {
      if (res) {
        this.rerender();
        this.formConfig.value.label = '';
        this.translate.get("form").subscribe(text => {
          toastr.success(text.addd.success, text.addd.title ,{ positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      } else {
        this.translate.get("form").subscribe(text => {
          toastr.warning(text.alreadyExists, '',{ positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }
    });
  }
}

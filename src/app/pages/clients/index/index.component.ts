import { Component, OnInit, ViewChild, AfterViewInit } from "@angular/core";
import { ClientService } from "./../../../services/client/client.service";
import { ClientListModel } from "../../../Models/ClientListModel";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { Router } from "@angular/router";
declare var swal: any;
declare var toastr: any;

@Component({
  selector: "app-index",
  templateUrl: "./index.component.html",
  styleUrls: ["./index.component.scss"]
})
export class IndexComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  Clients: ClientListModel;
  dtOptions: DataTables.Settings;
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang;
  i = 0;
  total;
  clientTableColumns: any = [];
  checkedColumns: any = [];
  pageLength = AppSettings.SIZE_PAGE;
  initPage = 0;
  typec = [];
  processing: boolean = false;
  constructor(
    private clientService: ClientService,
    private translate: TranslateService,
    private router: Router,
    private previousRouteService: PreviousRouteService
  ) {
    // this.InitDataTable();
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get("labels").subscribe(labels => {
      this.clientTableColumns = [labels.codeclient, labels.nom, labels.action]
    });
  }


  GetAll(search, pNumber, pSize, cSort, sDir) {
    this.clientService
      .GetAll(search, pNumber, pSize, cSort, sDir)
      .subscribe(Response => {
        this.Clients = Response;
      });
  }

  InitDataTable() {
    this.processing = true;
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem("module_client_info"));
    this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
    let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes("/clients/detail") || previousUrl.includes("/clients/modifier")) {
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
      columnDefs: [{ orderable: false, targets: 2 }],
      ajax: (dataTablesParameters: any, callback) => {
        (dataTablesParameters)
        this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir, dataTablesParameters.start);
        this.clientService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
          )
          .subscribe(data => {
            this.Clients = data;
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
      columns: [
        { data: "codeclient" },
        { data: "nom" },
        { data: "action" }
      ]
    };
  }

  // delete(id) {
  //   this.translate.get("list.delete").subscribe(text => {
  //     swal({
  //       title: text.title,
  //       text: text.question,
  //       icon: "warning",
  //       buttons: {
  //         cancel: {
  //           text: text.cancel,
  //           value: null,
  //           visible: true,
  //           className: "",
  //           closeModal: false
  //         },
  //         confirm: {
  //           text: text.confirm,
  //           value: true,
  //           visible: true,
  //           className: "",
  //           closeModal: false
  //         }
  //       }
  //     }).then(isConfirm => {
  //       if (isConfirm) {
  //         this.clientService.Delete(id).subscribe(res => {
  //           if (res) {
  //             swal(text.success, "", "success");
  //             this.rerender();
  //           } else {
  //             swal(text.ImpossibleDeSuppression, "", "error");
  //           }
  //         });
  //       } else {
  //         swal(text.cancel, "", "error");
  //       }
  //     });
  //   });
  // }
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
          this.clientService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, "", "success");
              this.rerender();
            } else {
              swal(text.ImpossibleDeSuppression, "", "error");
            }
          });
        } else {
          toastr.success(text.failed, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        }
      });
    });
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.GetInitParameters()
      this.InitDataTable();
      this.dtTrigger.next();
      this.rerender();
    }, 500);
    setTimeout(() => {
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
      this.InitDataTable();
    });
  }


  SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
    localStorage.setItem("module_client_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_client_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
  }

  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_client_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }

  /**
 * double clique pour passer au details de client
 */
  preventSingleClick = false;
  timer: any;
  delay: Number;

  doubleClick(client) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.router.navigate(['/clients/detail', client.id]);
  }
}

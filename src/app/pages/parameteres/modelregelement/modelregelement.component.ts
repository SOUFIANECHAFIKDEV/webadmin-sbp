import { Component, OnInit, ViewChild } from "@angular/core";
import { ModereglementService } from "app/services/modereglement/modereglement.service";
import { ModereglementListModel } from "app/Models/ModereglementListModel";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { Router } from "@angular/router";
import { FormBuilder, Validators } from '@angular/forms';
import { StaticModeReglement } from "app/Enums/StaticModeReglement.Enum";
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;
@Component({
  selector: 'app-modelregelement',
  templateUrl: './modelregelement.component.html',
  styleUrls: ['./modelregelement.component.scss']
})
export class ModelregelementComponent implements OnInit {
  
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  Modereglement: ModereglementListModel;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang = {};
  i = 0;
  total;
  modeTableColumns: any = [];
  checkedColumns: any = [];
  pageLength: number = AppSettings.SIZE_PAGE;
  loading = true;

  form;
  form1;
  id;
  recordsTotal;
  recordsFiltered ;

  public nomcomplet: any;
  public abreviation: any;

  staticModeRegelement: typeof StaticModeReglement = StaticModeReglement;

  constructor(
    private modereglementService: ModereglementService,
    private translate: TranslateService,
    private router: Router,
    private fb: FormBuilder
  ) {
  this.form = this.fb.group({
      Nom: ["", Validators.required]
    }
  )}

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get("labels").subscribe(labels => {
      this.modeTableColumns = [labels.Nom,labels.action]
    });
  }

  GetAll(search, pNumber, pSize, cSort, sDir) {
    this.modereglementService
      .GetAll(search, pNumber, pSize, cSort, sDir)
      .subscribe(Response => {
        this.Modereglement = Response;
      });
  }



  
  InitDataTable() {
 
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      data: [],
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 1 }],
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
        localStorage.setItem("module_mode_pageLength", dataTablesParameters.length);
        this.modereglementService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column]
              .data,
            dataTablesParameters.order[0].dir
          )
          .subscribe(data => {
            this.Modereglement = data;
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
        { data: "nom" ,width: "60%"},
        { data: "action",width: "40%" }
      ]
    };
  }

  annuler(){
        this.form.controls["nom"].setValue(" ");  
  }
  add() {
    if (this.form.valid) {
      this.translate.get("listm.add").subscribe(text => {
        let values = this.form.value;
        values = AppSettings.ConvertEmptyValueToNull(values);
        this.modereglementService.Add(values).subscribe(res => {
          if (res) {
            this.form.reset();
            toastr.success(text.msg, text.categorie.title,{ positionClass: 'toast-top-center', containerId: 'toast-top-center' });
             jQuery("#add").modal("hide");
            
              this.rerender();
          
          }
        });
      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
      })
    }
  }
  delete(id) {
    this.translate.get("listm.delete").subscribe(text => {
      swal({
        title: text.title,
        text: text.categorie.question,
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
          this.modereglementService.Delete(id).subscribe(res => {
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
    this.translate.get("dataTables").subscribe((text: string) => {
      this.dataTablesLang = text;
      this.translate.get("listm").subscribe(labels => {
        this.dataTablesLang['searchPlaceholder'] = labels.search
      });
    });
  }

  SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
    localStorage.setItem("module_mode_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_mode_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
    data = JSON.parse(localStorage.getItem("module_mode_pageLength"));
    this.pageLength = data == null ? AppSettings.SIZE_PAGE : data
  }


  updatemode(id) {   
     
    this.id=id;
    let category = this.Modereglement.list.filter(x=> x.id == id)[0]
    this.form = this.fb.group({
      Nom: [category.nom, Validators.required],
     
    })
  
  }
  update() {
    
    if (this.form.valid) {
      this.translate.get("listm.update").subscribe(text => {
        let values = this.form.value;
        values = AppSettings.ConvertEmptyValueToNull(values)
        values["id"] = this.id;
        this.modereglementService.Update(this.id, values).subscribe(res => {
          if (res) {
            toastr.success(text.msg, text.categorie.title,{ positionClass: 'toast-top-center', containerId: 'toast-top-center' });
             jQuery("#update").modal("hide");
               this.rerender();
          }
        });
      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
      })
    }
  }


  get f() { return this.form.controls; }

  
}


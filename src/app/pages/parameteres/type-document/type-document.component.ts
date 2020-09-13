import { Component, OnInit, ViewChild } from "@angular/core";
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { TypeParametrage } from "app/Enums/TypeParametrage.Enum";
import { TypeDocument } from "app/Models/Entities/TypeDocument";

import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { Parametrage } from "app/Models/Entities/Numerotation";
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;


@Component({
  selector: 'app-type-document',
  templateUrl: './type-document.component.html',
  styleUrls: ['./type-document.component.scss']
})
export class TypeDocumentComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang = {};
  i = 0;
  total;
  typedocumentTableColumns: any = [];
  checkedColumns: any = [];
  pageLength: number = AppSettings.SIZE_PAGE;
  loading = true;
  id;
  nom;
  recordsTotal;
  recordsFiltered;
  public nomcomplet: any;
  public abreviation: any;
  form;
  form1;
  data: Parametrage;
  parametrage: Parametrage
  typeAction = "add"

  constructor(private fb?: FormBuilder, private parameteresService?: ParameteresService,
    private translate?: TranslateService, ) {
    this.form = this.fb.group({
      nom: ["", Validators.required],

    })
  }
  add() {

  }
  get f() { return this.form.controls; }
  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();

    this.translate.get("labels").subscribe(labels => {
      this.typedocumentTableColumns = [labels.Nom, labels.action]
    });
  }
  typedocuments: TypeDocument[];
  async InitDataTable() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      data: [],
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 1 }],
      ajax: (dataTablesParameters: any, callback) => {

        if ((dataTablesParameters.search.value != '' && dataTablesParameters.search.value.length < 3) || dataTablesParameters.search.value == ' ') {
          callback({
            recordsTotal: this.recordsTotal,
            recordsFiltered: this.recordsFiltered,
            data: []
          });
          return;
        }
        localStorage.setItem("module_typedocument_pageLength", dataTablesParameters.length);
        this.parameteresService
          .Get(

            TypeParametrage.typedocument
          )
          .subscribe(async data => {
            const contenu: TypeDocument[] = JSON.parse(data.contenu);
            const typedocuments: TypeDocument[] = [];
            contenu.forEach(cat => {
              const check = cat.nom.search(dataTablesParameters.search.value);
              if (check != -1) {
                typedocuments.push(cat);
              }
            })

            this.typedocuments = typedocuments;

            this.GetInitParameters();
            if (this.i == 0) {
              this.total = this.typedocuments.length;
              this.i++;
            }

            this.recordsTotal = this.total;
            this.recordsFiltered = dataTablesParameters.length;
            callback({
              recordsTotal: this.total,
              recordsFiltered: dataTablesParameters.length,
              data: []
            });
          });
      },
      columns: [
        { data: "nom" },
        { data: "action" },
      ]
    };
  }
  annuler() {
    this.form.controls["nom"].setValue(" ");

  }


  selectMaxId(contenu: any[]): Promise<number> {
    return new Promise((resolve, reject) => {
      let maxId = 1;
      contenu.forEach(item => {
        maxId = item.id > maxId ? item.id : maxId;
      });
      resolve(maxId);
    })
  }

  addtype() { 

    if (this.form.valid) {

      this.translate.get("typedocument.add").subscribe(text => {
        this.parameteresService.Get(TypeParametrage.typedocument).subscribe(async data => {
          const dataContent = JSON.parse(data.contenu);
          dataContent.push({
            id: /*dataContent.length == 0 ? 1 : dataContent[dataContent.length - 1].id */ await this.selectMaxId(dataContent) + 1,
            nom: this.form.value.nom,
            isFixed: false
          })
          data.contenu = JSON.stringify(dataContent);

          this.parameteresService.Update(TypeParametrage.typedocument, data.contenu).subscribe(res => {
            if (res) {
              this.form.reset();
              toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
              jQuery("#add").modal("hide");

              this.rerender();

            }
          });
        });

      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }


  currentId
  selectTypeDocumentUpdate(typedocument) {

    this.currentId = typedocument.id;
    this.form.controls.nom.setValue(typedocument.nom);

  }

  update() {
    
    if (this.form.valid) {
      this.translate.get("typedocument.update").subscribe(text => {
        this.parameteresService.Get(TypeParametrage.typedocument).subscribe(data => {
          
          let dataContent = JSON.parse(data.contenu);
          dataContent.forEach(element => {
            if (element.id === this.currentId) {
              element.nom = this.form.value.nom;
            }
          });

          data.contenu = JSON.stringify(dataContent);

          this.parameteresService.Update(TypeParametrage.typedocument, data.contenu).subscribe(res => {
            if (res) {
              toastr.success(text.msg, text.typedocument.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
              jQuery("#update").modal("hide");
              // this.getdataa();
              this.rerender();

            }
          });
        });

      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }


  delete(typedocument) {

    this.translate.get("typedocument.delete").subscribe(text => {

      // this.parameteresService.Get(TypeParametrage.typedocument).subscribe(data => {

      // let dataContent = JSON.parse(data.contenu);
      // dataContent.splice(dataContent.indexOf(typedocument.id), 1)
      // data.contenu = JSON.stringify(dataContent);

      let dataContent = this.typedocuments.filter(tp => tp.id != typedocument.id);
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
          this.parameteresService.Update(TypeParametrage.typedocument, JSON.stringify(dataContent)).subscribe(res => {
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

      // });
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
      this.translate.get("typedocument").subscribe(labels => {
        this.dataTablesLang['searchPlaceholder'] = labels.search
      });
    });
    this.InitDataTable();
  }
  SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
    localStorage.setItem("module_typedocument_colmuns", JSON.stringify(arr))
  }
  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_typedocument_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
    data = JSON.parse(localStorage.getItem("module_typedocument_pageLength"));
    this.pageLength = data == null ? AppSettings.SIZE_PAGE : data
  }



}

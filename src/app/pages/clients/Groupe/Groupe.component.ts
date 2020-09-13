import { Component, OnInit, ViewChild } from "@angular/core";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { GroupesService } from "app/services/groupe/groupe.service";
import { GroupeListModel } from "app/Models/GroupeListModel";
import { Groupe } from "app/Models/Entities/Groupe";
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;

@Component({
  selector: "app-Groupe",
  templateUrl: "./Groupe.component.html",
  styleUrls: ["./Groupe.component.scss"]
})
export class GroupeComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  Groupe: GroupeListModel;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang = {};
  i = 0;
  total;
  groupeTableColumns: any = [];
  checkedColumns: any = [];
  pageLength: number = AppSettings.SIZE_PAGE;
  loading = true;
  form;
  id;
  typeAction = "Add";
  nom;
  formReset: any = {};
  initializeEditForm: any = {};
  groupe: Groupe;
  public nomcomplet: any;
  public abreviation: any;

  constructor(
    private groupesService: GroupesService,
    private translate: TranslateService, ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTranslation();
    this.translate.get("groupes").subscribe(groupes => {
      this.groupeTableColumns = [groupes.Nom, groupes.action]
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
        localStorage.setItem("module_groupe_pageLength", dataTablesParameters.length);
        this.groupesService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column]
              .data,
            dataTablesParameters.order[0].dir
          )
          .subscribe(data => {
            this.Groupe = data;
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
          });
      },
      columns: [
        { data: "nom" },
        { data: "action" }
      ]
    };
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

  /** récuperer la traduction des labels du "Data Tables" */
  getDataTablesTranslation() {
    this.translate.get("dataTables").subscribe((text: string) => {
      this.dataTablesLang = text;
      this.translate.get("labels").subscribe(labels => {
        this.dataTablesLang['searchPlaceholder'] = labels.search;
        this.InitDataTable();
      });
    });
  }

  /** enregistrer les colonnes affichée et les colonnes  non affichée dans le stockage local 
   * @param arr est un tableau ded colonned sélectionnée
  */
  SetCheckedColmuns(arr) {
    localStorage.setItem("module_groupe_colmuns", JSON.stringify(arr))
  }

  /**  récuperer les paramètre a partir du stockage local */
  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_groupe_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
    data = JSON.parse(localStorage.getItem("module_groupe_pageLength"));
    this.pageLength = data == null ? AppSettings.SIZE_PAGE : data
  }

  OnAdd(nomGroupe) {
    this.groupesService.Add(nomGroupe).subscribe(res => {
      jQuery("#add").modal("hide");
      this.rerender();
      this.translate.get("groupes").subscribe(labels => {
        toastr.success(labels.addMsg, labels.addTitle, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }, err => {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    });
  }

  delete(id) {
    this.translate.get("groupes.delete").subscribe(text => {
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
          this.groupesService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, "", "success");
              this.rerender();
            } else {
              swal(text.error, "", "error");
            }
          }, err => {
            swal(text.refError, "", "error");
          });
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }

  OnEdit(groupe) {
    this.groupesService.Update(groupe.id, { id: groupe.id, nom: groupe.nom })
      .subscribe(res => {
        jQuery("#update").modal("hide");
        this.rerender();
        this.translate.get("groupes").subscribe(groupes => {
          toastr.success(groupes.updateMsg, groupes.updateTitle, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }, err => {
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
      })
  }

  GetGroupeById(id) {
    this.groupesService.Get(id).subscribe(res => {
      this.groupe = res
      jQuery("#showgroupe").modal("show");
    })
  }

  refresh(event) {

    this.GetGroupeById(this.groupe.id);
  }
}

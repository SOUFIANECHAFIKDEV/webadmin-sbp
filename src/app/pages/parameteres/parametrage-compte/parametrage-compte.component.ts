import { Component, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { ParametrageListModel } from 'app/Models/ParametrageListModel';
import { Subject } from 'rxjs';
import { AppSettings } from 'app/app-settings/app-settings';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ParametrageCompteService } from 'app/services/parametragecompte/parametrage-compte.service';
import { TranslateService } from '@ngx-translate/core';
import { LoginService } from 'app/services/login/login.service';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { TypeCompte } from 'app/Enums/TypeCompte.enum';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { PlanComptableModel } from 'app/Models/PlanComptableModel';
import { PlanComptableEnum } from 'app/Enums/PlanComptable.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';


declare var toastr: any;
declare var jQuery: any;
declare var swal: any;

@Component({
  selector: 'app-parametrage-compte',
  templateUrl: './parametrage-compte.component.html',
  styleUrls: ['./parametrage-compte.component.scss']
})
export class ParametrageCompteComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  ParametrageCompte: ParametrageListModel;
  TypeCompte: typeof TypeCompte = TypeCompte;
  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang = {};
  i = 0;
  total;
  parametrageCompteTableColumns: any = [];
  checkedColumns: any = [];
  pageLength: number = AppSettings.SIZE_PAGE;
  loading = true;

  form;
  form1;
  id;

  typeAction = "Add";
  nom;
  recordsTotal;
  recordsFiltered;



  public nomcomplet: any;
  public abreviation: any;
  codeComptable: number = null;


  constructor(
    private fb: FormBuilder,
    private parametrageCompteService: ParametrageCompteService,
    private translate: TranslateService,
    private paramteresService: ParameteresService,
    private loginService: LoginService,
  ) {



  }

  async  createForm() {
    debugger
    this.form = this.fb.group({
      Nom: ["", Validators.required, this.checkUniqueNom.bind(this)],
    });
    this.codeComptable = await this.GetCodeComptable();
  }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get("labels").subscribe(labels => {
      this.parametrageCompteTableColumns = [labels.Nom, labels.code_comptable, labels.type, labels.action]
    });
    await this.createForm();

  }


  GetAll(search, pNumber, pSize, cSort, sDir) {
    this.parametrageCompteService
      .GetAll(search, pNumber, pSize, cSort, sDir)
      .subscribe(Response => {
        this.ParametrageCompte = Response;
      });
  }


  async InitDataTable() {
    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      data: [],
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 2 }],
      ajax: (dataTablesParameters: any, callback) => {
        if ((dataTablesParameters.search.value != '' && dataTablesParameters.search.value.length < 3) || dataTablesParameters.search.value == ' ') {
          callback({
            recordsTotal: this.recordsTotal,
            recordsFiltered: this.recordsFiltered,
            data: []
          });
          return;
        }
        localStorage.setItem("module_parametragecompte_pageLength", dataTablesParameters.length);
        this.parametrageCompteService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column]
              .data,
            dataTablesParameters.order[0].dir
          )
          .subscribe(async data => {
            this.ParametrageCompte = data;

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
        { data: "nom" },
        { data: "type" },
        { data: "code_comptable" },
        { data: "action" }
      ]
    };
  }

  annuler() {
    this.form.controls["nom"].setValue(" ");
    this.form.controls["type"].setValue(" ");
  }

  add() {

    if (this.form.valid) {
      this.translate.get("listPC.add").subscribe(text => {
        let values = this.form.value;
        values['type'] = TypeCompte.bancaire;
        values['code_comptable'] = this.codeComptable;
        values = AppSettings.ConvertEmptyValueToNull(values);
        this.parametrageCompteService.Add(values).subscribe(res => {
          if (res) {
            this.form.reset();
            toastr.success(text.msg, text.compte.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            jQuery("#add").modal("hide");

            this.rerender();

          }
        });
      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }


  delete(id) {
    this.translate.get("listPC.delete").subscribe(text => {
      swal({
        title: text.title,
        text: text.compte.question,
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
          this.parametrageCompteService.Delete(id).subscribe(res => {
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
      this.translate.get("listPC").subscribe(labels => {
        this.dataTablesLang['searchPlaceholder'] = labels.search
      });
    });
  }


  SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
    localStorage.setItem("module_parametragecompte_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_parametragecompte_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
    data = JSON.parse(localStorage.getItem("module_parametragecompte_pageLength"));
    this.pageLength = data == null ? AppSettings.SIZE_PAGE : data
  }


  updateParametrageCompte(id) {
    debugger
    this.typeAction = "Update";
    this.id = id;
    let parametragecompte = this.ParametrageCompte.list.filter(x => x.id == id)[0]
    this.nom = parametragecompte.nom;
    this.form.controls['Nom'].setValue(parametragecompte.nom);
  }

  update() {
    (this.form)
    if (this.form.valid) {
      this.translate.get("listPC.update").subscribe(text => {

        let values = this.form.value;
        values['type'] = TypeCompte.bancaire;
        values['code_comptable'] = this.codeComptable;
        values = AppSettings.ConvertEmptyValueToNull(values)
        values["id"] = this.id;
        this.parametrageCompteService.Update(this.id, values).subscribe(res => {
          if (res) {
            toastr.success(text.msg, text.compte.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            jQuery("#update").modal("hide");
            this.rerender();
          }
        });
      });
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
    this.typeAction = "Add";
  }


  checkUniqueNom(control: FormControl) {
    let promise = new Promise((resolve) => {
      this.parametrageCompteService.CheckUniqueNom(control.value).
        subscribe(res => {
          if (res == true) {

            if ((this.typeAction == "Update" && this.nom != control.value) || this.typeAction == "Add") {
              resolve({ checkUniqueNom: true });
            } else {
              resolve(null);
            }
          }
          else
            resolve(null);
        });
    });
    return promise;
  }

  get f() { return this.form.controls; }

  resetForm() {
    this.form.controls['Nom'].setValue(null);
    this.form.controls['type'].setValue(null);
  }

  checkDeleteAction(name) {
    let idProfile = this.loginService.getUser()['idProfile'];
    // if (idProfile == UserProfile.franchise) {
    //   if (name == "Smart repair" || name == "Lavage")
    //     return true
    // }
    return false;
  }

  /**
* Get parametrage plan comptable de compte
*/

  GetCodeComptable(): Promise<number> {
    return new Promise((resolve, reject) => {

      this.paramteresService.Get(TypeParametrage.planComptable).subscribe(
        res => {
          const planComptableList: PlanComptableModel[] = JSON.parse(res.contenu) as PlanComptableModel[];
          const codeComptable: number = planComptableList.filter(x => x.id == PlanComptableEnum.banque)[0].codeComptable as number;
          resolve(codeComptable);
        },
        err => {
          reject(err);
        }
      );

    });
  }

}

import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { DataTableDirective } from 'angular-datatables';
import { PaiementListModel } from 'app/Models/PaiementListModel';
import { Subject } from 'rxjs';

import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { PaiementService } from 'app/services/paiement/paiement.service';
import { TypePaiement } from 'app/Enums/TypePaiement.Enum';
import { ParametrageCompteService } from 'app/services/parametragecompte/parametrage-compte.service';
import { ParametrageCompte } from 'app/Models/Entities/ParametrageCompte';
import { StatutComptabilise } from 'app/Enums/StatutComptabilise.enum';
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
  dtTrigger: Subject<any> = new Subject();
  dtOptions: DataTables.Settings
  dataTablesLang
  paiementTableColumns: any[];
  checkedColumns: any = [];

  paiments: PaiementListModel;
  statutComptabilise: typeof StatutComptabilise = StatutComptabilise
  typePaiement: typeof TypePaiement = TypePaiement
  comptes: ParametrageCompte[] = null

  pageLength = AppSettings.SIZE_PAGE;
  initPage = 0;
  loading = false;
  oldChoices: any;
  i = 0;
  total;
  idCompte
  dateMinimal: Date
  dateMaximal: Date
  dateLang

  totalPeriode = 0

  constructor(
    private translate?: TranslateService,
    private previousRouteService?: PreviousRouteService,
    private paiementService?: PaiementService,
    private router?: Router,
    private parametrageCompteService?: ParametrageCompteService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
    this.translate.get("labels").subscribe(text => {
      this.paiementTableColumns = [text.description, text.compte, text.type, text.date, text.montant, text.actions]
    })
    this.getDataTablesTrans();

  }

  // Initialisation datatables
  InitDataTable() {
    // recupérer old paramétere
    this.getOldChoice();
    this.pageLength = !this.oldChoices || this.oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(this.oldChoices.page_length);
    let order = !this.oldChoices || this.oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(this.oldChoices.sort), this.oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes("/paiements/detail") || previousUrl.includes("/paiements/modifier")) {
      if (this.oldChoices && this.oldChoices.start != null) this.initPage = this.oldChoices.start;
    }

    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      displayStart: this.initPage,
      order: order,
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 5 }],
      ajax: (dataTablesParameters: any, callback) => {

        setTimeout(() => {
          this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir, dataTablesParameters.start);
        }, 1000)

        this.paiementService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.idCompte,
            this.dateMinimal != null ? AppSettings.formaterDatetime(this.dateMinimal.toString()) : null,
            this.dateMaximal != null ? AppSettings.formaterDatetime(this.dateMaximal.toString()) : null
          )
          .subscribe(data => {
            this.paiments = data.data;
            this.totalPeriode = data.total
            this.GetInitParameters();
            if (this.i == 0) {
              this.total = data.data.totalItems;
              this.i++;
            }
            if (this.i == 0) {
              this.total = data.data.totalItems;
              this.i++;
            }
            callback({
              recordsTotal: this.total,
              recordsFiltered: data.data.totalItems,
              data: []
            });
          });
      },
      columns: [
        { data: "description" },
        { data: "idCaisse" },
        { data: "type" },
        { data: "datePaiement" },
        { data: "montant" },
        { data: "action" },
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
      this.loading = false;
    }, 1000);
  }

  // Destroy datatabels
  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }

  // Render datatables
  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
      setTimeout(() => {
        this.getOldChoice()
        if (this.oldChoices && this.oldChoices.search != null && this.oldChoices.search != '') {
          var table = $('#paiementTable').DataTable();
          table.search(this.oldChoices.search).draw();
        }
      }, 500)
    });
  }

  // Translate datatables
  getDataTablesTrans() {
    this.translate.get("dataTables").subscribe((text: string) => {
      this.dataTablesLang = text;
    });
  }

  // Sauvgarder les choix des colonnes à afficher
  SetCheckedColmuns(arr) {
    localStorage.setItem("module_paiement_colmuns", JSON.stringify(arr))
  }

  // Initialisation parametres
  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_paiement_colmuns"));
    this.checkedColumns = (data == null ? [false, false, false, false, false, false] : data)
  }

  // Sauvgrader les filters de clients
  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_paiement_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }

  // Recuperer ancienne  recherche de client
  getOldChoice() {
    this.oldChoices = JSON.parse(localStorage.getItem("module_paiement_info"));
  }

  // Supprimer paiement
  delete(index) {
    let paiement = this.paiments.list[index]
    this.translate.get("list.delete").subscribe(text => {
      swal({
        title: text.title,
        text: (paiement.type == TypePaiement.PAYER_GROUPE ? text.questionGroupe : (paiement.type == TypePaiement.PAR_AVOIR ? text.questionAvoirDelete : text.question)),

        //  text: (paiement.type != TypePaiement.PAYER_GROUPE ? text.question : text.questionGroupe),
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
          this.paiementService.Delete(paiement.id).subscribe(res => {
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

  // Récuperer la liste des comptes
  GetCompte(search) {
    if (this.comptes == null) {
      this.parametrageCompteService.GetAll(search, 1, AppSettings.MAX_GET_DATA, "nom", "asc")
        .subscribe(res => {
          this.comptes = res.list
        })
    }
  }

  // changement date debut
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

  // changement date fin
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


  /**
   * double clique pour passer au details de fournisseur
   */
  preventSingleClick = false;
  timer: any;
  delay: Number;

  doubleClick(idPaiments) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.router.navigate(['/paiements/detail', idPaiments]);
  }

}

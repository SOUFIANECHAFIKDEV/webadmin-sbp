import { Component, OnInit, Input, OnDestroy, AfterViewInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { PagedJournalVenteList } from 'app/Models/JournalVenteModel';
import { Subject } from 'rxjs';
import { PeriodeEnum } from 'app/Enums/PeriodeEnum.Enum';
import { AppSettings } from 'app/app-settings/app-settings';
import { TranslateService } from '@ngx-translate/core';
import { ComptabiliteService } from 'app/services/comptabilite/comptabilite.service';
declare var toastr: any;
@Component({
  selector: 'journal-vente',
  templateUrl: './journal-vente.component.html',
  styleUrls: ['./journal-vente.component.scss']
})
export class JournalVenteComponent implements OnInit, OnDestroy, AfterViewInit {
  @Input() nameModule

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  journalVentes: PagedJournalVenteList;
  dtOptions: DataTables.Settings
  dtTrigger: Subject<any> = new Subject();
  periode = PeriodeEnum.TOUS
  periodeEnum: typeof PeriodeEnum = PeriodeEnum
  dateMinimal
  dateMaximal
  journalVenteTableColumns: any[];

  dateLang
  dataTablesLang

  pageLength = AppSettings.SIZE_PAGE;
  initPage = 0;
  loading = false;
  checkedColumns: any = [];
  oldChoices: any;
  i = 0;
  total;
  constructor(
    private translate?: TranslateService,
    private comptabilteService?: ComptabiliteService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
    this.translate.get("labels").subscribe(labels => {
      this.journalVenteTableColumns = [labels.codeJournal, labels.date, labels.numeroCompte, labels.numeroPiece, labels.client, labels.debit, labels.credit];
    })
  }

  InitDataTable() {
    // recupérer old paramétere
    this.getOldChoice();
    this.pageLength = !this.oldChoices || this.oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(this.oldChoices.page_length);
    let order = !this.oldChoices || this.oldChoices.sort == null ? [[1, 'asc']] : [[parseInt(this.oldChoices.sort), this.oldChoices.dir]];

    this.dtOptions = {
      pagingType: "full_numbers",
      pageLength: this.pageLength,
      serverSide: true,
      processing: true,
      displayStart: this.initPage,
      order: order,
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 0 }, { orderable: false, targets: 2 }, { orderable: false, targets: 3 }, { orderable: false, targets: 4 }, { orderable: false, targets: 5 }, { orderable: false, targets: 6 }],
      ajax: (dataTablesParameters: any, callback) => {

        setTimeout(() => {
          this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir, dataTablesParameters.start);
        }, 1000)

        this.comptabilteService
          .JournalVente(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.dateMinimal != null ? AppSettings.formaterDatetime(this.dateMinimal.toString()) : null,
            this.dateMaximal != null ? AppSettings.formaterDatetime(this.dateMaximal.toString()) : null,
            this.periode == null ? PeriodeEnum.TOUS : this.periode,

          )
          .subscribe(data => {
            this.journalVentes = data;
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
              data: []
            });
          });
      },
      columns: [
        { data: "codeJournal" },
        { data: "dateCreation" },
        { data: "numeroCompte" },
        { data: "numeroPiece" },
        { data: "client" },
        { data: "debit" },
        { data: "credit" },
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

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTrigger.next();
      setTimeout(() => {
        this.getOldChoice()
        if (this.oldChoices && this.oldChoices.search != null && this.oldChoices.search != '') {
          var table = $('#' + this.nameModule + 'Table').DataTable();
          table.search(this.oldChoices.search).draw();
        }
      }, 500)
    });
  }

  getDataTablesTrans() {
    this.translate.get("dataTables").subscribe((text: string) => {
      this.dataTablesLang = text;
    });
  }

  SetCheckedColmuns(arr) {
    localStorage.setItem("module_" + this.nameModule + "_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_" + this.nameModule + "_colmuns"));
    this.checkedColumns = (data == null ? [false, false, false, false, false, false, false] : data)
  }

  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_" + this.nameModule + "_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }

  getOldChoice() {
    this.oldChoices = JSON.parse(localStorage.getItem("module_" + this.nameModule + "_info"));
  }

  filter() {
    this.rerender();
  }

  exporter() {
    this.loading = true;
    this.comptabilteService.ExporterJournalVente(
      "",
      1,
      AppSettings.MAX_GET_DATA,
      "dateCreation",
      "desc",
      this.dateMinimal != null ? AppSettings.formaterDatetime(this.dateMinimal.toString()) : null,
      this.dateMaximal != null ? AppSettings.formaterDatetime(this.dateMaximal.toString()) : null,
      this.periode == null ? PeriodeEnum.TOUS : this.periode,

    ).subscribe(
      value => {
        this.loading = false;
        // Get time stamp for fileName.
        var stamp = new Date().getTime();

        // file type 
        var fileType = 'application/vnd.ms-excel';

        // file data 
        var fileData = AppSettings._base64ToArrayBuffer(value);

        // file extension
        var extension = "xlsx";
        AppSettings.setFile(fileData, ("JournalVente") + stamp + "." + extension, fileType, extension);
      },
      err => {
        this.loading = false;
        this.translate.get("errors").subscribe(text => {
          toastr.warning(text.server, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
      }
    )
  }



}

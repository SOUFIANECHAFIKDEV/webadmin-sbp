import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { FactureService } from 'app/services/facture/facture.service';
import { Subject } from 'rxjs';
import { FactureListModel } from 'app/Models/FactureListModel';
import { DataTableDirective } from 'angular-datatables';
// import { StatutComptabilise } from 'app/Enums/StatutComptabilise.Enum';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { LoginService } from 'app/services/login/login.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { StatutComptabilise } from 'app/Enums/StatutComptabilise.enum';
import { infoClientModel } from 'app/Models/Entities/Avoir';
import { Router } from '@angular/router';
import { Facture } from 'app/Models/Entities/Facture';
import { Chantier } from 'app/Models/Entities/Chantier';
import { ClientService } from 'app/services/client/client.service';
import { Client } from 'app/Models/Entities/Client';
import { NgSelectComponent } from '@ng-select/ng-select';

declare var swal: any;
declare var toastr: any;

@Component({
  selector: 'app-facture-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss'],
})
export class IndexComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  factures: FactureListModel;
  dtOptions: DataTables.Settings;
  statutFacture: typeof StatutFacture = StatutFacture;
  statutComptabilise: typeof StatutComptabilise = StatutComptabilise

  dataTablesLang;
  dateLang;
  factureTableColumns: any[];
  listStatus: any = null;
  pageLength = AppSettings.SIZE_PAGE;
  initPage = 0;
  processing: boolean = false;
  dtTrigger: Subject<any> = new Subject();
  checkedColumns: any = [];
  dateMinimal: Date;
  dateMaximal: Date;
  status;
  oldChoices: any;
  i = 0;
  total;
  chantier = null;
  listChantiers: any = [];
  chantiers: Chantier[] = null;
  //statutComptabilise: typeof StatutComptabilise = StatutComptabilise
  clients: Client[] = null;
  statut
  //@Input('statut') statut;
  @Input("idChantier") idChantier = null;
  @Input("CallFromOutside") CallFromOutside = false;
  @Input('orderBy') orderBy;
  @Input('nameModule') nameModule;
  constructor(
    private translate: TranslateService,
    private previousRouteService: PreviousRouteService,
    private factureService: FactureService,
    private loginService: LoginService,
    private chantierService: ChantierService,
    private clientService: ClientService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });
    let currentUser = this.loginService.getUser();

    this.translate.get('labels').subscribe(labels => {
      this.factureTableColumns = [
        labels.reference,
        labels.statut,
        labels.chantier,
        labels.dateCreation,
        labels.dateEcheance,
        labels.totalTTC,
        labels.actions,
      ];

    });
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
    if (previousUrl.includes('/factures/detail') || previousUrl.includes('/factures/modifier')) {
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
      columnDefs: [{ orderable: false, targets: 6 }, { orderable: false, targets: 2 }],
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

        this.factureService
          .GetAll(
            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            // this.statut,
            this.statut != null ? [this.statut] : [],
            this.dateMinimal != null
              ? AppSettings.formaterDatetime(this.dateMinimal.toString())
              : null,
            this.dateMaximal != null
              ? AppSettings.formaterDatetime(this.dateMaximal.toString())
              : null,
            // this.statut,
            this.idChantier,
            null //null pour id client
          )
          .subscribe(data => {
            this.factures = data;
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
              data: [],
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
        { data: 'reference' },
        { data: 'status' },
        { data: 'client' },
        { data: 'dateCreation' },
        { data: 'dateEcheance' },
        { data: 'total' },
        { data: 'action' },
      ],
    };
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
    this.translate.get('dataTablesFactures').subscribe((text: string) => {
      this.dataTablesLang = text;
    });
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

  delete(id) {
    this.translate.get('list.deletefacture').subscribe(text => {
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
          this.factureService.Delete(id).subscribe(res => {
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

  exportFactures(body) {

    //
    if (body.type === 'relanceFacture') {
      this.factureService.exportreleveRelanceFacture(body.params).subscribe((res: any) => {
        // Get time stamp for fileName.
        var stamp = new Date().getTime();

        // file type
        var fileType = 'application/pdf';

        // file extension
        var extension = 'pdf';

        AppSettings.downloadBase64(
          ',' + res.facturesParPeriod,
          'FA_' + stamp + '.' + extension,
          fileType,
          extension
        );

        res.facturesAndAvoirsDetail.forEach((element, index) => {
          AppSettings.downloadBase64(
            ',' + element,
            'Doc_' + index + stamp + '.' + extension,
            fileType,
            extension
          );
        });
      });
    }

    if (body.type === 'factureParPeriod') {

      this.factureService.exportFactureParPeriod(body.params).subscribe((res: any) => {
        // Get time stamp for fileName.
        var stamp = new Date().getTime();

        // file type
        var fileType = 'application/pdf';

        // file extension
        var extension = 'pdf';

        AppSettings.downloadBase64(
          ',' + res.facturesParPeriod,
          'FA_' + stamp + '.' + extension,
          fileType,
          extension
        );

        res.facturesAndAvoirsDetail.forEach((element, index) => {
          AppSettings.downloadBase64(
            ',' + element,
            'Doc_' + index + stamp + '.' + extension,
            fileType,
            extension
          );
        });
      });
    }
  }
  loadClient(facture: Facture) {

    if (facture == null) return facture;
    if (facture.infoClient == null) return facture;

    let infoClient: infoClientModel = new infoClientModel();
    infoClient = JSON.parse(facture.infoClient);
    return infoClient.nom;

  }

  navigateToCreationComponent() {
    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/facturation/ajouter` : `/factures/ajouter`;
    this.router.navigate([url]);
  }

  navigateToEditComponent(idFacture: number): void {

    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/facturation/modifier/${idFacture}` : `/factures/modifier/${idFacture}`;
    this.router.navigate([url])
  }

  navigateToDetailComponent(idFacture: number) {

    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/facturation/detail/${idFacture}` : `/factures/detail/${idFacture}`;
    this.router.navigate([url]);
  }

  navigateTo(target: string, params: any): void {
    switch (target) {
      case 'add':
        this.navigateToCreationComponent();
        break;
      case 'edit':
        this.navigateToEditComponent(params['idFacture']);
        break;
      case 'detail':
        this.navigateToDetailComponent(params['idFacture']);
        break;
    }


  }
  // firstLoading: boolean = true;
  // async loadFilterData() {
  //   if (this.firstLoading) {
  //     this.processing = true;
  //     try {
  //       this.getChantiers();
  //       const transaltions = await this.getTranslationByKey('labels');
  //       this.listStatus.push({ value: StatutFacture.Brouillon, name: transaltions.brouillon });
  //       this.listStatus.push({ value: StatutFacture.Encours, name: transaltions.encours });
  //       this.listStatus.push({ value: StatutFacture.Cloture, name: transaltions.cloturee });
  //       this.listStatus.push({ value: StatutFacture.Enretard, name: transaltions.enretard });
  //       this.listStatus.push({ value: StatutFacture.Annule, name: transaltions.annulee });
  //     } catch (err) {
  //       const transaltions = await this.getTranslationByKey('errors');
  //       toastr.warning(transaltions.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
  //     }
  //     this.processing = false;
  //     this.firstLoading = false;
  //   }
  // }

  @ViewChild('selecteStatus') selecteStatus: NgSelectComponent;
  async getlistStatus() {
    if (this.listStatus == null) {
      const transaltions = await this.getTranslationByKey('labels');
      this.listStatus = [];
      this.listStatus.push({ value: StatutFacture.Brouillon, name: transaltions.brouillon });
      this.listStatus.push({ value: StatutFacture.Encours, name: transaltions.encours });
      this.listStatus.push({ value: StatutFacture.Cloture, name: transaltions.cloturee });
      this.listStatus.push({ value: StatutFacture.Enretard, name: transaltions.enretard });
      this.listStatus.push({ value: StatutFacture.Annule, name: transaltions.annulee });
      this.selecteStatus.isOpen = true;
    }
  }


  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation);
      });
    });
  }

  @ViewChild('selecteChantiers') selecteChantiers: NgSelectComponent;
  getChantiers(openListOptions) {
    if (this.chantiers == null) {
      this.processing = true;
      this.chantierService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC', null).subscribe(res => {
        console.log(res)
        this.chantiers = res.list
      }, error => {
        this.translate.get('errors').subscribe(text => {
          toastr.warning(text.serveur, '', {
            positionClass: 'toast-top-center',
            containerId: 'toast-top-center',
          });
        })
      }, () => {
        this.processing = false;
        if (openListOptions) {
          this.selecteChantiers.isOpen = true;
        }
      });
    }
  }

  getClients() {
    this.clientService.GetAll('', 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "desc").subscribe((res) => {
      this.clients = res.list;
      console.log(this.clients)
    });
  }

  /**
   * double clique pour passer au details de facture
   */
  preventSingleClick = false;
  timer: any;
  doubleClick(idFacture) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.navigateToDetailComponent(idFacture)
  }

}

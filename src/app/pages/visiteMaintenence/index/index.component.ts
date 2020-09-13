import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { VisiteMaintenanceListModel } from 'app/Models/VisiteMaintenanceListModel';
import { Client } from 'app/Models/Entities/Client';
import { TranslateService } from '@ngx-translate/core';
import { FicheInterventionService } from 'app/services/ficheIntervention/fiche-intervention.service';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { LoginService } from 'app/services/login/login.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { Router } from '@angular/router';
import { UtilisateurService } from 'app/services/users/user.service';
import { ClientService } from 'app/services/client/client.service';
import { FicheInterventionMaintenanceService } from 'app/services/ficheInterventionMaintenance/fiche-intervention-maintenance.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { VisiteMaintenanceService } from 'app/services/visisteMaintenance/visite-maintenance.service';
import { StatutVisiteMaintenance } from 'app/Enums/StatutVisiteMaintenance';
import { NgSelectComponent } from '@ng-select/ng-select';
import { moisEnum } from 'app/common/gamme-maintenance-equipement/sheard/enums/mois.enum';
export declare var swal: any;
declare var toastr: any;
@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.scss']
})
export class IndexComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: DataTables.Settings;
  dtTrigger: Subject<any> = new Subject();
  dataTablesLang;
  tableColumns: any[];
  pageLength: number = 50;
  checkedColumns: any;
  visitesMaintenances: VisiteMaintenanceListModel;
  recordsTotal: number = 0;
  INIT_CHEKECED_COLMUN;
  client: Client = null;

  dateLang

  clients: any = null;
  statutVisiteMaintenance: typeof StatutVisiteMaintenance = StatutVisiteMaintenance;
  mois = null;
  annee = null;
  processing: boolean = false;
  initPage = 0;
  total;
  i = 0;
  moisEnum: typeof moisEnum = moisEnum;
  idClient = null;
  listStatus: any = null;
  listMois: any = null;
  statut = null;
  constructor(
    private translate: TranslateService,
    //private ficheInterventionMaintenanceService: FicheInterventionMaintenanceService,
    private visiteMaintenanceService: VisiteMaintenanceService,
    private previousRouteService: PreviousRouteService,

    private router: Router,
    private clientService: ClientService
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    //this.tableColumns = await this.setTableColumns();
    const dataTablesTranslation = await this.getTranslationByKey('dataTables');
    this.dataTablesLang = dataTablesTranslation;

    //put  datePicker Transaltions
    const datePickerTransaltions = await this.getTranslationByKey('datePicker');
    this.dateLang = datePickerTransaltions;

    //put  tableColumns Transaltions
    const labelsTransaltions = await this.getTranslationByKey('labels');
    this.tableColumns = [labelsTransaltions.client, labelsTransaltions.statut, labelsTransaltions.annee, labelsTransaltions.mois, labelsTransaltions.ficheintervention, labelsTransaltions.action];

    //this.getVisiteMaintenances('');
    const transaltions = await this.getTranslationByKey('labels');


  }


  InitDataTable() {


    //processing:boolean = false;
    this.processing = true;
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem("module_vivitemaintenance_info"));
    this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
    let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes("/ficheintervention/detail")) {
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
      columnDefs: [{ orderable: false, targets: 5 }],
      ajax: (dataTablesParameters: any, callback) => {
        this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir, dataTablesParameters.start);
        debugger
        this.visiteMaintenanceService
          .GetAll(

            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.statut,
            this.annee,
            this.mois,

            //  this.chantier == null ? null : this.chantier.id,
            this.idClient,
            // this.technicien
          )
          .subscribe(data => {

            this.visitesMaintenances = data;
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
            //  this.setCalendarEvents(data.list.filter(x => x.status != StatutFicheIntervention.Brouillon));
            this.processing = false;
          }, err => this.translate.get("errors").subscribe(errors => {
            if (this.processing) {
              this.processing = false;
              toastr.warning(errors.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            }
          }));
      },
      columns: [
        { data: "client" },
        { data: "statut" },
        { data: "mois" },
        { data: "annee" },
        { data: "ficheintervention" },
        { data: "action" }
      ]
    };
  }
  getStatutColor(status: StatutVisiteMaintenance) {
    const statutColors = [
      { status: StatutVisiteMaintenance.Annule, color: '#fe0000' },
      { status: StatutVisiteMaintenance.NonFait, color: '#636e72' },
      { status: StatutVisiteMaintenance.Fait, color: '#3498db' },
      { status: StatutVisiteMaintenance.APlanifier, color: '#00d2d3' },
      { status: StatutVisiteMaintenance.Planifier, color: '#2ecc71' }
    ];
    return statutColors.filter(color => color.status == status)[0].color;
  }

  // ngOnChanges() {
  //   if (!this.loading) {
  //     this.rerender();
  //   }
  // }

  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_vivitemaintenance_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }
  ngAfterViewInit(): void {
    setTimeout(() => {
      this.GetInitParameters()
      this.InitDataTable();
      this.dtTrigger.next();
      this.rerender();
    }, 500);
    setTimeout(() => {
      // this.loading = false;
    }, 1000);
  }
  ngOnDestroy(): void {
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
  SetCheckedColmuns(arr) {
    localStorage.setItem("module_visitemaintenance_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_visitemaintenance_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
  }
  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation);
      });
    });
  }

  @ViewChild('selecteStatus') selecteStatus: NgSelectComponent;
  async getlistStatus() {
    debugger
    if (this.listStatus == null) {
      const transaltions = await this.getTranslationByKey('labels');
      this.listStatus = [];
      this.listStatus.push({ value: StatutVisiteMaintenance.Planifier, name: transaltions.planifier });
      this.listStatus.push({ value: StatutVisiteMaintenance.APlanifier, name: transaltions.aplanifier });
      this.listStatus.push({ value: StatutVisiteMaintenance.Fait, name: transaltions.fait });
      this.listStatus.push({ value: StatutVisiteMaintenance.NonFait, name: transaltions.nonfait });
      this.listStatus.push({ value: StatutVisiteMaintenance.Annule, name: transaltions.annulee });
      this.selecteStatus.isOpen = true;
    }
  }
  @ViewChild('selecteMois') selecteMois: NgSelectComponent;
  async getlistMois() {
    debugger
    if (this.listMois == null) {
      const transaltions = await this.getTranslationByKey('mois');
      this.listMois = [];
      this.listMois.push({ value: moisEnum.janvier, name: transaltions.janvier });
      this.listMois.push({ value: moisEnum.fevrier, name: transaltions.fevrier });
      this.listMois.push({ value: moisEnum.mars, name: transaltions.mars });
      this.listMois.push({ value: moisEnum.avril, name: transaltions.avril });
      this.listMois.push({ value: moisEnum.mai, name: transaltions.mai });
      this.listMois.push({ value: moisEnum.juin, name: transaltions.juin });
      this.listMois.push({ value: moisEnum.juillet, name: transaltions.juillet });
      this.listMois.push({ value: moisEnum.aout, name: transaltions.aout });
      this.listMois.push({ value: moisEnum.septembre, name: transaltions.septembre });
      this.listMois.push({ value: moisEnum.octobre, name: transaltions.octobre });
      this.listMois.push({ value: moisEnum.novembre, name: transaltions.novembre });
      this.listMois.push({ value: moisEnum.decembre, name: transaltions.decembre });
      this.selecteMois.isOpen = true;
    }
  }
  @ViewChild('selecteClients') selecteClients: NgSelectComponent;
  getClients() {
    if (this.clients == null) {
      this.processing = true;
      this.clientService.GetAll('', 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "desc").subscribe(res => {
        console.log(res)
        this.clients = res.list
      }, error => {
        this.translate.get('errors').subscribe(text => {
          toastr.warning(text.serveur, '', {
            positionClass: 'toast-top-center',
            containerId: 'toast-top-center',
          });
        })
      }, () => {
        this.processing = false;
        this.selecteClients.isOpen = true;
      });
    }
  }

  doubleClick(id) {
    this.router.navigate(['/visitesMaintenance/detail', id])
  }
  getClientById(id) {
    this.clientService.Get(id).subscribe(res => {
      return res.nom;
    })
  }

  getclientById(idClient): Promise<Client> {

    return new Promise((resolve, reject) => {
      this.clientService.Get(idClient).subscribe(
        res => {
          resolve(res);
        },
        err => {
          reject(err);
        }
      );
    });
  }




}

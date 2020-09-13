import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { FicheIntervention } from 'app/Models/Entities/FicheIntervention';
import { TranslateService } from '@ngx-translate/core';
import { FicheInterventionService } from 'app/services/ficheIntervention/fiche-intervention.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { FicheInterventionListModel } from 'app/Models/FicheInterventionListModel';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { StatutFicheIntervention } from 'app/Enums/StatutFicheIntervention.enum';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { LoginService } from 'app/services/login/login.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { Facture } from 'app/Models/Entities/Facture';
import { PrestationInterventionModel } from 'app/Models/PrestationInterventionModel';
import { CreateFacture } from 'app/Enums/CreateFacture.Enum';
import { Router } from '@angular/router';
import { FactureState } from 'app/pages/factures/facture-state';
import { UtilisateurService } from 'app/services/users/user.service';
import { ClientService } from 'app/services/client/client.service';
import { User } from 'app/Models/Entities/User';
import { Client } from 'app/Models/Entities/Client';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { NgSelectComponent } from '@ng-select/ng-select';

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
  FicheInterventions: FicheInterventionListModel;
  recordsTotal: number = 0;
  INIT_CHEKECED_COLMUN;
  chantier: Chantier = null;
  userProfil: typeof UserProfile = UserProfile;
  initPage = 0;
  total;
  i = 0;
  @Input("statut") statut;
  @Input("orderBy") orderBy;
  @Input("nameModule") nameModule;
  dateLang
  listStatus: any = [];
  chantiersList: any = null;
  statutFicheIntervention: typeof StatutFicheIntervention = StatutFicheIntervention;
  recordsFiltered;
  loading = true;
  dateMinimal: Date
  dateMaximal: Date
  id
  idFicheTravail: number;
  processing: boolean = false;
  isAdmin = true;
  calendarEvents = null;
  indexChangeDateMinimal = 0;
  indexChangeDateMaximal = 0;
  FichesInterventions: FicheInterventionListModel;
  idFichesTravail
  techniciensList: User[] = null;
  technicien: User = null;
  clientsList: Client[] = null;
  client: Client = null;

  constructor(private translate: TranslateService,
    private ficheInterventionService: FicheInterventionService,
    private previousRouteService: PreviousRouteService,
    private loginService: LoginService,
    private chantierService: ChantierService,
    private router: Router,
    private utilisateurService: UtilisateurService,
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
    this.tableColumns = [labelsTransaltions.reference, labelsTransaltions.status, labelsTransaltions.dateDebut, labelsTransaltions.dateFin, labelsTransaltions.chantier, labelsTransaltions.action];

    this.isAdmin = (this.loginService.getUser().idProfile == UserProfile.admin);
    this.getFicheInterventions('');
    const transaltions = await this.getTranslationByKey('labels');
    this.listStatus.push({ value: this.statutFicheIntervention.Brouillon, name: transaltions.brouillon });
    this.listStatus.push({ value: this.statutFicheIntervention.Planifiee, name: transaltions.planifiee });
    this.listStatus.push({ value: this.statutFicheIntervention.Realisee, name: transaltions.realisee });
    this.listStatus.push({ value: this.statutFicheIntervention.Facturee, name: transaltions.facturee });
    this.listStatus.push({ value: this.statutFicheIntervention.Annulee, name: transaltions.annulee });
  }

  compareDate(date): boolean {
    //Note: 00 is month i.e. January  
    var dateOne = new Date(); //Year, Month, Date  
    var datefin = new Date(date); //Year, Month, Date  
    if (dateOne > datefin) {
      return true;
    } else {
      return false;
    }
  }

  InitDataTable() {


    //processing:boolean = false;
    this.processing = true;
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem("module_ficheintervention_info"));
    this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
    let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes("/ficheintervention/detail") || previousUrl.includes("/ficheintervention/modifier")) {
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
        this.ficheInterventionService
          .GetAll(

            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.statut,
            this.dateMinimal != null ? AppSettings.formaterDatetime(this.dateMinimal.toString()) : null,
            this.dateMaximal != null ? AppSettings.formaterDatetime(this.dateMaximal.toString()) : null,
            this.chantier == null ? null : this.chantier.id,
            this.client,
            this.technicien
          )
          .subscribe(data => {

            this.FicheInterventions = data;
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
            this.setCalendarEvents(data.list.filter(x => x.status != StatutFicheIntervention.Brouillon));
            this.processing = false;
          }, err => this.translate.get("errors").subscribe(errors => {
            if (this.processing) {
              this.processing = false;
              toastr.warning(errors.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            }
          }));
      },
      columns: [
        { data: "reference" },
        { data: "dateDebut" },
        { data: "dateFin" },
        { data: "statut" },
        { data: "chantier" },
        { data: "action" }
      ]
    };
  }

  setCalendarEvents(data: FicheIntervention[]) {
    let space = '\f \f \f \f \f \f \f \f \f \f \f \f \f \f \f \f \f \f \f \f \f \f \f';
    this.calendarEvents = data.map((element) => {
      const techniciens = () => {
        let text = ``;
        element.interventionTechnicien.forEach((element, count) => {
          if (count != 0) {
            text = text + `${space} - ${element.idTechnicienNavigation.nom} ${element.idTechnicienNavigation.prenom}
            `;
          } else {
            text = text + `- ${element.idTechnicienNavigation.nom} ${element.idTechnicienNavigation.prenom}
            `;
          }
        });
        console.log("text", text)
        return text;
      }

      return {
        title: `\n Réference : ${element.reference}    
        Prénom : ${element.chantier.client.nom}
        Objet : ${element.objet == null ? '' : (element.objet)}
        Techniciens : ${techniciens()}`,
        start: element.dateDebut,
        end: element.dateFin,
        color: this.getStatutColor(element.status),
        textColor: "#FFF",
      };
    });
  }

  getStatutColor(status: StatutFicheIntervention) {
    const statutColors = [
      { status: StatutFicheIntervention.Annulee, color: '#fe0000' },
      { status: StatutFicheIntervention.Brouillon, color: '#636e72' },
      { status: StatutFicheIntervention.Facturee, color: '#3498db' },
      { status: StatutFicheIntervention.Planifiee, color: '#00d2d3' },
      { status: StatutFicheIntervention.Realisee, color: '#2ecc71' }
    ];
    return statutColors.filter(color => color.status == status)[0].color;
  }

  changeDateMinimal() {
    if (this.dateMinimal != null) {
      this.rerender();
      this.indexChangeDateMinimal = 0;
    } else if (this.indexChangeDateMinimal == 0) {
      this.rerender();
      this.indexChangeDateMinimal++;
    }
  }

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
          this.ficheInterventionService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, "", "success");
              this.FicheInterventions.list = this.FicheInterventions.list.filter(x => x.id != id);
              this.rerender();
            }
            else {
              swal(text.error, "", "error");
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
      this.loading = false;
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
    localStorage.setItem("module_devis_colmuns", JSON.stringify(arr))
  }

  GetInitParameters() {
    let data = JSON.parse(localStorage.getItem("module_devis_colmuns"));
    this.checkedColumns = (data == null ? [] : data)
  }

  filterParStatut() {
    this.rerender();
  }

  ngOnChanges() {
    if (!this.loading) {
      this.rerender();
    }
  }

  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_ficheintervention_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }


  GetNameOfChantier(idChantier) {
    const result = (this.chantiersList as any[]).filter(c => c.id == idChantier);
    return result.length > 0 ? result[0].nom : '';
  }
  statutFiche: StatutFicheIntervention = null;
  getFicheInterventions(search): Promise<FicheIntervention[]> {
    debugger
    this.statutFiche != this.statutFicheIntervention.Brouillon;
    //    this.factureService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, 'dateEcheance', 'asc', [StatutFacture.Encours, StatutFacture.Enretard], null, null, null, this.idClient)

    //SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, Statut?, dateDebut?, dateFin?, IdChantier?, IdClient?, idTechnicien?

    return new Promise((resolve, reject) => {
      //    this.ficheInterventionService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, "Intervention", "asc", StatutFicheIntervention.Realisee, null, null, this.idChantier)

      this.ficheInterventionService.GetAll(search, 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc", null, null, null, null).subscribe(async (res) => {
        // let cc = res.list.filter(x => x.status != this.statutFicheIntervention.Brouillon);
        // console.log("cc", cc)
        resolve(res.list)
      });
    });
  }

  createFacture(index) {
    let ficheIntervention: FicheIntervention = this.FicheInterventions.list[index];
    let facture = this.transfertFIToFacture(ficheIntervention);
    FactureState.facture = facture;
    FactureState.idFicheTravail = [ficheIntervention.id];
    this.router.navigate(['/factures/ajouter', CreateFacture.FICHE_INTERVENTION]);
  }

  transfertFIToFacture(ficheIntervention) {
    let facture = new Facture();
    let prestation: PrestationInterventionModel = JSON.parse(ficheIntervention.prestations);
    facture.prestations = prestation.prestation;
    facture.prorata = 0;
    facture.puc = 0;
    facture.remise = 0;
    facture.retenueGarantie = 0;
    facture.delaiGarantie = null,
      facture.typeRemise = "€";
    facture.tva = null;
    facture.tvaGlobal = null;
    facture.idChantier = ficheIntervention.idChantier;
    facture.typeFacture = TypeFacture.Generale;
    return facture
  }
  @ViewChild('selectTetechniciens') selectTetechniciens: NgSelectComponent;
  getTechniciens(): void {
    if (this.techniciensList == null) {
      this.processing = true;
      this.utilisateurService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC', [UserProfile.technicien, UserProfile.technicienChantier]).subscribe(response => {
        this.techniciensList = response.list
      }, async err => {
        const transaltions = await this.getTranslationByKey('errors');
        toastr.warning(transaltions.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      }, () => {
        this.processing = false;
        this.selectTetechniciens.isOpen = true;
      });
    }
  }
  @ViewChild('selectClients') selectClients: NgSelectComponent;
  getClients(): void {
    if (this.clientsList == null) {
      this.clientService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC', [UserProfile.technicien, UserProfile.technicienChantier]).subscribe(response => {
        this.clientsList = response.list;
      }, async err => {
        const transaltions = await this.getTranslationByKey('errors');
        toastr.warning(transaltions.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      }, () => {
        this.processing = false;
        this.selectClients.isOpen = true;
      });
    }
  }
  @ViewChild('selectChantiers') selectChantiers: NgSelectComponent;
  getChantiers(): void {
    if (this.chantiersList == null) {
      this.chantierService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC', null).subscribe(response => {
        this.chantiersList = response.list;
      }, async err => {
        const transaltions = await this.getTranslationByKey('errors');
        toastr.warning(transaltions.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      }, () => {
        this.processing = false;
        this.selectChantiers.isOpen = true;
      });
    }
  }

  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation);
      });
    });
  }
  async navigateToClick(reference: string): Promise<void> {
    debugger
    this.processing = true;
    const result: FicheIntervention[] = await this.getFicheInterventions(reference);
    const idIntervention: number = result.filter(X => X.reference == reference)[0].id;
    this.processing = false;
    this.router.navigate(['/ficheintervention/detail', idIntervention]);
  }
  // rerender()
  async chantierChange() {
    if (this.chantier != null) {
      this.clientsList = [this.chantier.client];
      this.client = this.chantier.client.id;
      this.rerender();
    } else {
      // this.clientsList = await this.getClients();
      this.client = null;
      this.rerender();
    }
  }

  /**
 * double clique pour passer au details de chantier
 */
  preventSingleClick = false;
  timer: any;
  delay: Number;

  doubleClick(idficheintervention) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.router.navigate(['/ficheintervention/detail', idficheintervention]);
  }
}

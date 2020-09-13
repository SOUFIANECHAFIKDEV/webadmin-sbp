import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { StatutDevis } from 'app/Enums/StatutDevis';
import { TranslateService } from '@ngx-translate/core';
import { UtilisateurService } from 'app/services/users/user.service';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { LoginService } from 'app/services/login/login.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { DevisListModel } from 'app/Models/DevisListModel';
import { DevisService } from 'app/services/devis/devis.service';
import { PreviousRouteService } from 'app/services/previous-route/previous-route.service';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { Devis } from 'app/Models/Entities/Devis';
import { FactureState } from 'app/pages/factures/facture-state';
import { CreateFacture } from 'app/Enums/CreateFacture.Enum';
import { Router, ActivatedRoute } from '@angular/router';
import { Facture } from 'app/Models/Entities/Facture';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { NgSelectComponent } from '@ng-select/ng-select';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';

export declare var swal: any;
declare var toastr: any;

@Component({
  selector: 'app-devis-index',
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
  Devis: DevisListModel;
  recordsTotal: number = 0;
  INIT_CHEKECED_COLMUN;
  idProfile;    // profile d'utilisateur actual
  userProfil: typeof UserProfile = UserProfile;
  initPage = 0;
  total;
  i = 0;
  dateLang
  listStatus: any = null;
  listChantiers: any = null;
  statutDevis: typeof StatutDevis = StatutDevis;
  recordsFiltered;
  processing: boolean = false;

  @Input("statut") statut;
  @Input("orderBy") orderBy;
  @Input("nameModule") nameModule;
  @Input("idChantier") idChantier = null;
  @Input("CallFromOutside") CallFromOutside = false;
  statutFacture: typeof StatutFacture = StatutFacture;
  typeFacture: typeof TypeFacture = TypeFacture;
  showBtnAdd: boolean = true;
  resteAPayer: number = 0;
  constructor(
    private translate: TranslateService,
    private devisService: DevisService,
    private previousRouteService: PreviousRouteService,
    private loginService: LoginService,
    private chantierService: ChantierService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    //
    let transalation = await this.getTranslationByKey('dataTablesDevis');
    this.dataTablesLang = transalation;
    //
    transalation = await this.getTranslationByKey('datePicker');
    this.dateLang = transalation;
    //
    this.tableColumns = await this.setTableColumns();
    //
    this.idProfile = this.loginService.getUser()["idProfile"];

  }

  GetAll(search, pNumber, pSize, cSort, sDir) {

    this.devisService
      .GetAll(search, pNumber, pSize, cSort, sDir)
      .subscribe(Response => {
        this.Devis = Response;
      });
  }
  async setTableColumns(): Promise<any[]> {
    const transalation = await this.getTranslationByKey('labels');
    return [transalation.reference, transalation.status, transalation.total].concat(this.CallFromOutside ? [transalation.action] : [transalation.chantier, transalation.action]);
  }

  InitDataTable() {

    this.processing = true;
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem("module_devis_info"));
    this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
    let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

    // Garder pagination
    var previousUrl = this.previousRouteService.getPreviousUrl();
    if (previousUrl.includes("/devis/detail") || previousUrl.includes("/devis/modifier")) {
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
      //    paramOrder = [{ orderable: false, targets: 12 }]
      columnDefs: [{ orderable: false, targets: this.CallFromOutside ? 3 : 4 }],
      ajax: (dataTablesParameters: any, callback) => {
        this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir, dataTablesParameters.start);
        this.devisService
          .GetAll(

            dataTablesParameters.search.value,
            dataTablesParameters.start / dataTablesParameters.length + 1,
            dataTablesParameters.length,
            dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
            dataTablesParameters.order[0].dir,
            this.statut,
            this.idChantier
          )
          .subscribe(data => {
            this.Devis = data;
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
      columns: this.getColumns()
    };
  }
  getColumns() {
    return [
      { data: "reference" },
      { data: "total" },
      { data: "statut" },
    ].concat(
      this.CallFromOutside
        ? [{ data: "action" }]
        : [{ data: "chantier" }, { data: "action" }]
    );
  }
  delete(id) {
    this.translate.get("list.deleteDevis").subscribe(text => {
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
          this.devisService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, "", "success");
              this.rerender();
            }
            else {
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
      this.processing = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  rerender(): void {
    if (this.dtElement.dtInstance == undefined) return;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      // Destroy the table first
      dtInstance.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
    });
  }

  SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
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
    if (!this.processing) {
      this.rerender();
    }
  }

  saveChoices(length, search, sort, dir, start) {
    localStorage.setItem("module_devis_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
  }
  /**************
   * Create Facture depuis devis
   */

  // Transformer devis à facture && Aller à la page d'ajouter facture

  createFacture(index) {

    let devis: Devis = this.Devis.list[index];
    let facture = this.transfertDevisToFacture(devis);
    FactureState.facture = facture;

    this.router.navigate(['/factures/ajouter', CreateFacture.DEVIS]);
  }
  /**
   * 
   * Generate BC Fournisseur Depuis devis
   */
  generateBC(index) {

    let devis: Devis = this.Devis.list[index];
    this.devisService.generateBC(devis).subscribe(res => {
      if (res["id"] != null) {
        this.rerender();
        this.translate.get('labels').subscribe(text => {
          toastr.success(text.ajouterBC, '', {
            positionClass: 'toast-top-center',
            containerId: 'toast-top-center',
          });
        });

      }

    })
  }

  /**
   *  Condition pour créer BC fOURNISSEUR depuis devis
   */

  getCreateBCFournisseurCondition(devis: Devis): boolean {
    const haveNoFacture: () => boolean = () => {
      const result = devis.bonCommandeFournisseur.length == 0;
      return result;
    }
    const statusConditions = devis.status == this.statutDevis.Acceptee || devis.status == this.statutDevis.EnAttente || devis.status == this.statutDevis.NonAcceptee;
    return statusConditions && haveNoFacture() && devis.devisExel == null;
  }

  transfertDevisToFacture(devis) {
    let facture = new Facture
    facture.prestations = devis.prestation;
    facture.prorata = devis.prorata;
    facture.puc = devis.puc;
    facture.remise = devis.remise;
    facture.retenueGarantie = devis.retenueGarantie;
    facture.delaiGarantie = devis.delaiGarantie;
    facture.typeRemise = devis.typeRemise;
    facture.tvaGlobal = devis.tvaGlobal;
    facture.idChantier = devis.idChantier;
    facture.idDevis = devis.id;
    return facture

  }

  navigateToCreationComponenet(/*type: string*/): void {

    // let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/devis/ajouter/${type}` : `/devis/ajouter/${type}`;
    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/devis/ajouter` : `/devis/ajouter`;
    this.router.navigate([url]);
  }

  navigateToEditComponenet(idDevis: number): void {
    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/devis/modifier/${idDevis}` : `/devis/modifier/${idDevis}`;
    this.router.navigate([url]);
  }

  navigateToDetailComponenet(idDevis: number): void {
    let url = this.CallFromOutside ? `/chantiers/${this.idChantier}/documents/devis/detail/${idDevis}` : `/devis/detail/${idDevis}`;
    this.router.navigate([url]);
  }

  navigateTo(target: string, params?: any): void {

    switch (target) {
      case 'add':
        this.navigateToCreationComponenet(/*params['type']*/);
        break;
      case 'edit':
        this.navigateToEditComponenet(params['idDevis']);
        break;
      case 'detail':
        this.navigateToDetailComponenet(params['idDevis']);
        break;
    }
  }

  @ViewChild('selecteChantiers') selecteChantiers: NgSelectComponent;
  getChantiers() {
    debugger
    if (this.listChantiers == null) {
      this.processing = true;
      this.chantierService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC', null).subscribe(res => {
        this.listChantiers = res.list;
      }, async  err => {
        const transaltions = await this.getTranslationByKey('errors');
        toastr.warning(transaltions.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      }, () => {
        this.processing = false;
        this.selecteChantiers.isOpen = true;
      });
    }
  }

  @ViewChild('selecteStatus') selecteStatus: NgSelectComponent;
  async getlistStatus() {
    if (this.listStatus == null) {
      const transaltions = await this.getTranslationByKey('labels');
      this.listStatus = [];
      this.listStatus.push({ value: this.statutDevis.Annulee, name: transaltions.annulee });
      this.listStatus.push({ value: this.statutDevis.EnAttente, name: transaltions.enattente });
      this.listStatus.push({ value: this.statutDevis.Acceptee, name: transaltions.accepte });
      this.listStatus.push({ value: this.statutDevis.NonAcceptee, name: transaltions.nonaccepte });
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

  getCreateFactureCondition(devis: Devis): boolean {
    const haveNoFacture: () => boolean = () => {
      const result = devis.facture.filter(F => F.typeFacture == TypeFacture.Generale || F.typeFacture == TypeFacture.Situation || F.typeFacture == TypeFacture.Acompte);
      return result.length == 0;
    }
    return (devis.status == this.statutDevis.Acceptee || devis.status == this.statutDevis.EnAttente || devis.status == this.statutDevis.NonAcceptee) && haveNoFacture() && devis.devisExel == null;
  }

  getCreateFactureAcompteCondition(devis: Devis): boolean {
    // const haveNoFacture: () => boolean = () => {
    //   const result = devis.facture.filter(F => F.typeFacture == TypeFacture.Generale || F.typeFacture == TypeFacture.Situation);
    //   return result.length == 0;
    // }
    const condition = devis == undefined ? false : (devis.facture == undefined ? false : true);
    if (condition) {
      const condi = (factures: Facture[]): boolean => {
        let showOrNot = true;
        factures.forEach(facture => {
          if (facture.typeFacture == this.typeFacture.Situation) {
            if (facture.status != this.statutFacture.Brouillon && facture.status != this.statutFacture.Annule) {
              showOrNot = false;
            }
          }
          else if (facture.typeFacture == this.typeFacture.Acompte) {
            if (facture.status == this.statutFacture.Cloture) {
              showOrNot = false;
            }
          }
          else if (facture.typeFacture == this.typeFacture.Generale) {
            showOrNot = false;
          }
        });
        return showOrNot;
      };

      this.showBtnAdd = condi(devis.facture);
      // devis.facture = devis.facture.map((facture, index) => {
      //   if (facture.typeFacture == this.typeFacture.Acompte) {
      //     const acomptes = JSON.parse(devis.acomptes) as { idFacture: number, pourcentage: number, resteAPayer: number }[];
      //     const acompteFActureIndex: number = acomptes.findIndex(X => X.idFacture == facture.id);
      //     const { pourcentage, resteAPayer } = acomptes[acompteFActureIndex];
      //     facture.pourcentage = pourcentage;
      //     facture.restePayer = resteAPayer;
      //     const length = devis.facture.length - 1;
      //     if (index == length) {
      //       this.resteAPayer = resteAPayer;
      //     }
      //   }
      //   return facture;
      // });
    }
    return (devis.status == this.statutDevis.Acceptee || devis.status == this.statutDevis.EnAttente || devis.status == this.statutDevis.NonAcceptee) && this.showBtnAdd;

  }
  getCreateFactureSituationCondition(devis: Devis): boolean {
    // const haveNoFacture: () => boolean = () => {
    //   const result = devis.facture.filter(F => F.typeFacture == TypeFacture.Generale || F.status == TypeFacture.Situation);
    //   return result.length == 0;
    // }
    const condition = devis == undefined ? false : (devis.facture == undefined ? false : true);
    if (condition) {
      const condi = (factures: Facture[]): boolean => {
        let showOrNot = true;
        factures.forEach(facture => {
          if (facture.status == this.statutFacture.Cloture) {
            showOrNot = false;
          } else if (facture.typeFacture == this.typeFacture.Generale) {
            showOrNot = false;
          }
        });
        return showOrNot;
      };
      this.showBtnAdd = condi(devis.facture);
    }

    return (devis.status == this.statutDevis.Acceptee || devis.status == this.statutDevis.EnAttente || devis.status == this.statutDevis.NonAcceptee) && this.showBtnAdd;

  }

  navigateToFactureSituation(devis) {

    this.route.params.subscribe(params => {
      let url = params['idChantier'] != null ?
        `/chantiers/${params['idChantier']}/documents/devis/${params['id']}/factureSituation`
        : `devis/factureSituation/${devis.id}`;
      this.router.navigate([url]);
    });
  }

  navigateToFactureAcompte(devis) {
    this.route.params.subscribe(params => {
      let url = params['idChantier'] != null ?
        `/chantiers/${params['idChantier']}/documents/devis/${params['id']}/factureAcompte`
        : `devis/factureAcompte/${devis.id}`;
      this.router.navigate([url]);
    });
  }

  /**
    * double clique pour passer au details de devis
    */
  preventSingleClick = false;
  timer: any;
  delay: Number;

  doubleClick(idDevis) {
    this.preventSingleClick = true;
    clearTimeout(this.timer);
    this.navigateToDetailComponenet(idDevis);
  }
}

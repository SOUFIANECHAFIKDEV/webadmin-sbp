
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { EventSettingsModel, View, WorkHoursModel, GroupModel, ResourceDetails, ActionEventArgs, CellClickEventArgs } from '@syncfusion/ej2-schedule';
import { L10n, loadCldr, setCulture, extend, addClass, remove, closest } from '@syncfusion/ej2-base';
import { ScheduleComponent, PopupOpenEventArgs, RecurrenceEditor } from '@syncfusion/ej2-angular-schedule';
import { DragAndDropEventArgs } from '@syncfusion/ej2-navigations';
import { TreeViewComponent } from '@syncfusion/ej2-angular-navigations';
import { hospitalData } from './data';
import { UtilisateurService } from 'app/services/users/user.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { TranslateService } from '@ngx-translate/core';
import { VisiteMaintenanceService } from 'app/services/visisteMaintenance/visite-maintenance.service';
import { StatutVisiteMaintenance } from 'app/Enums/StatutVisiteMaintenance';
import { Adresse } from 'app/Models/Entities/Adresse';
import { Client } from 'app/Models/Entities/Client';
import { ClientService } from 'app/services/client/client.service';

import { DateTimePicker } from '@syncfusion/ej2-calendars';
import { FicheInterventionMaintenanceService } from 'app/services/ficheInterventionMaintenance/fiche-intervention-maintenance.service';
import { FicheInterventionMaintenance } from 'app/Models/Entities/FicheInterventionMaintenance';
import { StatutFicheIntervention } from 'app/Enums/StatutFicheIntervention.enum';
import { TypeNumerotation } from 'app/Enums/TypeNumerotation.Enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { VisiteMaintenance } from 'app/Models/Entities/VisiteMaintenance';
import { Router } from '@angular/router';




declare let require: Function;
setCulture('fr');
@Component({
  selector: 'app-app-schedule',
  templateUrl: './app-schedule.component.html',
  styleUrls: [
    './app-schedule.component.css'
  ]
})
export class AppScheduleComponent implements OnInit {
  @ViewChild('scheduleObj') scheduleObj: ScheduleComponent;
  @ViewChild('treeObj') treeObj: TreeViewComponent;
  isTreeItemDropped: boolean = false;
  allowMultiple: boolean = false;
  allowDragAndDrop: boolean = true;
  field: Object;
  draggedItemId: string = '';
  selectedDate: Date = new Date(2019, 1, 1);
  eventSettings: EventSettingsModel = {
    dataSource: [],
  };
  techniciensDataSource: Object[] = [{ Text: 'Techniciens', Id: UserProfile.technicien, Color: '#bbdc00' }];
  listeTechniciens: TechniciensInterface[] = [];
  group: GroupModel = { enableCompactView: false, resources: ['Departments', 'Consultants'] };
  visiteMaintenanaceFilter: VisiteMaintenanaceFilterInterface = {
    listeAnnee: [
      2010, 2011, 2012, 2013, 2014, 2015,
      2016, 2017, 2018, 2019, 2020, 2021
    ],
    listeClient: [],
    idClient: 0,
    annee: new Date().getFullYear()
  };
  visiteMaintenanceSelected: any = null;
  IdTechnicien = null;

  constructor(
    private utilisateurService: UtilisateurService,
    private translate: TranslateService,
    private visiteMaintenanceService: VisiteMaintenanceService,
    private clientService: ClientService,
    private ficheInterventionMaintenanceService: FicheInterventionMaintenanceService,
    private paramteresService: ParameteresService,
    private router: Router
  ) { }


  ngOnInit() {
    loadCldr(
      require('./traduction/numberingSystems.json'),
      require('./../../../../node_modules/cldr-data/main/fr/ca-gregorian.json'),
      require('./../../../../node_modules/cldr-data/main/fr/currencies.json'),
      require('./../../../../node_modules/cldr-data/main/fr/numbers.json'),
      require('./../../../../node_modules/cldr-data/main/fr/timeZoneNames.json')
    );
    L10n.load({
      'fr': {
        'schedule': {
          "day": "journée",
          "week": "La semaine",
          "workWeek": "Semaine de travail",
          "month": "Mois",
          "agenda": "Ordre du jour",
          "weekAgenda": "Agenda de la semaine",
          "workWeekAgenda": "Agenda de la semaine de travail",
          "monthAgenda": "Agenda du mois",
          "today": "Aujourd'hui",
          "noEvents": "Pas d'événements",
          "emptyContainer": "Aucun événement n'est prévu ce jour-là.",
          "allDay": "Toute la journée",
          "start": "Début",
          "end": "Fin",
          "more": "plus",
          "close": "Fermer",
          "cancel": "Annuler",
          "noTitle": "(Pas de titre)",
          "delete": "Effacer",
          "deleteEvent": "Supprimer un événement",
          "deleteMultipleEvent": "Supprimer plusieurs événements",
          "selectedItems": "Articles sélectionnés",
          "deleteSeries": "Supprimer la série",
          "edit": "modifier",
          "editSeries": "Modifier la série",
          "editEvent": "Modifier l'événement",
          "createEvent": "Créer",
          "subject": "Assujettir",
          "addTitle": "Ajouter un titre",
          "moreDetails": "Plus de détails",
          "save": "sauvegarder",
          "editContent": "Voulez-vous modifier uniquement cet événement ou une série entière?",
          "deleteRecurrenceContent": "Voulez-vous supprimer uniquement cet événement ou une série entière?",
          "deleteContent": "Êtes-vous sûr de vouloir supprimer cet événement?",
          "deleteMultipleContent": "Êtes-vous sûr de vouloir supprimer les événements sélectionnés?",
          "newEvent": "Ajouter une nouvelle fiche d'intervention du maintenance",
          "title": "Titre",
          "location": "Emplacement",
          "description": "La description",
          "timezone": "Fuseau horaire",
          "startTimezone": "Début du fuseau horaire",
          "endTimezone": "Fin du fuseau horaire",
          "repeat": "Répéter",
          "saveButton": "sauvegarder",
          "cancelButton": "Annuler",
          "deleteButton": "Effacer",
          "recurrence": "Récurrence",
          "wrongPattern": "Le modèle de récurrence n'est pas valide.",
          "seriesChangeAlert": "Les modifications apportées à des instances spécifiques de cette série seront annulées et ces événements correspondront à nouveau à la série.",
          "createError": "La durée de l'événement doit être plus courte que sa fréquence. Raccourcissez la durée ou modifiez le modèle de récurrence dans l'éditeur d'événement de récurrence.",
          "recurrenceDateValidation": "Certains mois ont moins que la date sélectionnée. Pour ces mois, l'événement se produira à la dernière date du mois.",
          "sameDayAlert": "Deux occurrences du même événement ne peuvent pas se produire le même jour.",
          "editRecurrence": "Modifier la récurrence",
          "repeats": "Répète",
          "alert": "Alerte",
          "startEndError": "La date de fin sélectionnée se produit avant la date de début.",
          "invalidDateError": "La valeur de date saisie est invalide.",
          "ok": "D'accord",
          "occurrence": "Occurrence",
          "series": "Séries",
          "previous": "précédent",
          "next": "Prochain",
          "timelineDay": "Journée chronologique",
          "timelineWeek": "Semaine chronologique",
          "timelineWorkWeek": "Semaine de travail chronologique",
          "timelineMonth": "Mois de la chronologie"
        },
        "recurrenceeditor": {
          "none": "Aucun",
          "daily": "du quotidien",
          "weekly": "Hebdomadaire",
          "monthly": "Mensuel",
          "month": "Mois",
          "yearly": "Annuel",
          "never": "Jamais",
          "until": "Jusqu'à",
          "count": "Compter",
          "first": "Premier",
          "second": "Seconde",
          "third": "Troisième",
          "fourth": "Quatrième",
          "last": "Dernier",
          "repeat": "Répéter",
          "repeatEvery": "Répéter tous les",
          "on": "Répéter sur",
          "end": "Fin",
          "onDay": "journée",
          "days": "Journées)",
          "weeks": "Semaines)",
          "months": "Mois)",
          "years": "Années)",
          "every": "chaque",
          "summaryTimes": "fois)",
          "summaryOn": "sur",
          "summaryUntil": "jusqu'à",
          "summaryRepeat": "Répète",
          "summaryDay": "journées)",
          "summaryWeek": "semaines)",
          "summaryMonth": "mois)",
          "summaryYear": "années)",
          "monthWeek": "Mois Semaine",
          "monthPosition": "Position du mois",
          "monthExpander": "Mois Expander",
          "yearExpander": "Année Expander",
          "repeatInterval": "Intervalle de répétition"

        }
      }
    });
    this.getTechniciens();
    this.getVisiteMaintenance();
    this.getClientListe();
    this.ficheInterventionMaintenanceList();
  }

  onItemDrag(event: any): void {
    if (this.scheduleObj.isAdaptive) {
      debugger
      let classElement: HTMLElement = this.scheduleObj.element.querySelector('.e-device-hover');
      if (classElement) {
        classElement.classList.remove('e-device-hover');
      }
      if (event.target.classList.contains('e-work-cells')) {
        addClass([event.target], 'e-device-hover');
      }
    }
    if (document.body.style.cursor === 'not-allowed') {
      document.body.style.cursor = '';
    }
    if (event.name === 'nodeDragging') {
      let dragElementIcon: NodeListOf<HTMLElement> =
        document.querySelectorAll('.e-drag-item.treeview-external-drag .e-icon-expandable');
      for (let i: number = 0; i < dragElementIcon.length; i++) {
        dragElementIcon[i].style.display = 'none';
      }
    }

  }

  onActionBegin(event: ActionEventArgs): void {
    debugger
    if (event.requestType === 'eventCreate' && this.isTreeItemDropped) {
      let treeViewdata: { [key: string]: Object }[] = this.treeObj.fields.dataSource as { [key: string]: Object }[];
      const filteredPeople: { [key: string]: Object }[] =
        treeViewdata.filter((item: any) => item.Id !== parseInt(this.draggedItemId, 10));
      this.treeObj.fields.dataSource = filteredPeople;
      let elements: NodeListOf<HTMLElement> = document.querySelectorAll('.e-drag-item.treeview-external-drag');
      for (let i: number = 0; i < elements.length; i++) {
        remove(elements[i]);
      }
      this.eventSettings
    }

  }

  onTreeDragStop(event: DragAndDropEventArgs): void {
    debugger
    let treeElement: Element = <Element>closest(event.target, '.e-treeview');
    let classElement: HTMLElement = this.scheduleObj.element.querySelector('.e-device-hover');
    if (classElement) {
      classElement.classList.remove('e-device-hover');
    }
    if (!treeElement) {
      event.cancel = true;
      let scheduleElement: Element = <Element>closest(event.target, '.e-content-wrap');
      if (scheduleElement) {
        let treeviewData: { [key: string]: Object }[] =
          this.treeObj.fields.dataSource as { [key: string]: Object }[];
        if (event.target.classList.contains('e-work-cells')) {
          const filteredData: { [key: string]: Object }[] = treeviewData.filter((item: any) => item.Id === parseInt(event.draggedNodeData.id as string, 10));
          let cellData: CellClickEventArgs = this.scheduleObj.getCellDetails(event.target);
          let resourceDetails: ResourceDetails = this.scheduleObj.getResourcesByIndex(cellData.groupIndex);
          this.visiteMaintenanceSelected = filteredData;
          let eventData: { [key: string]: Object } = {
            Name: filteredData[0].Name,
            StartTime: cellData.startTime,
            EndTime: cellData.endTime,
            IsAllDay: cellData.isAllDay,
            Description: filteredData[0].Description,
            DepartmentID: resourceDetails.resourceData.GroupId,
            ConsultantID: resourceDetails.resourceData.Id
          };
          this.IdTechnicien = resourceDetails.resourceData.Id.toString();
          this.scheduleObj.openEditor(eventData, 'Add', true);
          this.isTreeItemDropped = true;
          this.draggedItemId = event.draggedNodeData.id as string;
        }
      }
    }
  }

  onPopupOpen(args: PopupOpenEventArgs): void {
    debugger
    if (args.type == "QuickInfo") {
      this.router.navigate(['/avoirs/detail', this.visiteMaintenanceSelected[0].Id]);
    }
    console.log(this.visiteMaintenanceSelected);
    if (args.type === 'Editor') {
      let clientElement: HTMLInputElement = args.element.querySelector('#Client') as HTMLInputElement;
      clientElement.value = this.visiteMaintenanceSelected[0].client;
      let siteElement: HTMLInputElement = args.element.querySelector('#Site') as HTMLInputElement;
      siteElement.value = this.visiteMaintenanceSelected[0].site.designation;
      let startElement: HTMLInputElement = args.element.querySelector('#DateDebut') as HTMLInputElement;
      if (!startElement.classList.contains('e-datetimepicker')) {
        new DateTimePicker({ value: new Date(startElement.value) || new Date() }, startElement);
      }
      let endElement: HTMLInputElement = args.element.querySelector('#DateFin') as HTMLInputElement;
      if (!endElement.classList.contains('e-datetimepicker')) {
        new DateTimePicker({ value: new Date(endElement.value) || new Date() }, endElement);
      }
      document.getElementById('RecurrenceEditor').style.display = (this.scheduleObj.currentAction == "EditOccurrence") ? 'none' : 'block';
    }

  }

  /**
   * return a reference for the new insertion
   */
  generateReference(): Promise<string> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Generate(TypeNumerotation.fiche_interventionMaintenance as number)
        .subscribe(response => {
          resolve(response['data']);
        }, (error) => reject(error));
    });
  }

  onPopupClose(args) {
    debugger
    this.newInterventionData = args.data;

    //count les fiche d'intervention
    this.dataSourceLength = (this.eventSettings.dataSource as any).length;

    // this.currentDataSourceLength = (this.eventSettings.dataSource as any).length;

    setInterval(async () => {
      this.newInterventionData;
      const currentDataSourceLength = (this.eventSettings.dataSource as any).length;
      if (currentDataSourceLength != this.dataSourceLength) {
        let ficheInterventionMaintenance: FicheInterventionMaintenance = new FicheInterventionMaintenance();
        ficheInterventionMaintenance.idVisiteMaintenance = this.visiteMaintenanceSelected[0].Id;
        ficheInterventionMaintenance.maintenaceEquipement = this.listeLisiteMaintenance.filter(x => x.id == this.visiteMaintenanceSelected[0].Id)[0].gammeMaintenance;
        ficheInterventionMaintenance.dateDebut = args.data.DateDebut;
        ficheInterventionMaintenance.memos = '[]';
        ficheInterventionMaintenance.emails = '[]';
        ficheInterventionMaintenance.visiteMaintenance.statut = StatutVisiteMaintenance.Planifier;
        ficheInterventionMaintenance.dateFin = args.data.dateFin;
        ficheInterventionMaintenance.adresseIntervention = JSON.stringify(this.visiteMaintenanceSelected[0].site);
        ficheInterventionMaintenance.idTechnicien = parseInt(this.IdTechnicien);
        ficheInterventionMaintenance.objet = args.data.Object;
        ficheInterventionMaintenance.reference = await this.generateReference();
        ficheInterventionMaintenance.status = StatutFicheIntervention.Planifiee;
        ficheInterventionMaintenance.historique = '[]';
        this.ficheInterventionMaintenanceService.Add(ficheInterventionMaintenance).subscribe(async res => {
          await this.IncremenetRefernce()

          const Id = this.eventSettings.dataSource[currentDataSourceLength - 1].Id
          this.eventSettings.dataSource[currentDataSourceLength - 1] = {
            Id: Id,
            Subject: res.reference,
            Name: args.data.Client,
            StartTime: args.data.DateDebut,
            EndTime: args.data.DateFin,
            Description: args.data.Object,
            DepartmentID: UserProfile.technicien,
            ConsultantID: parseInt(this.IdTechnicien),
            DepartmentName: args.data.Site
          };

          this.scheduleObj.refreshEvents();
        });
        // FicheInterventionMaintenance
        this.dataSourceLength = (this.eventSettings.dataSource as any).length;
      }

    }, 1000)
  }



  dataSourceLength = 0;
  newInterventionData = null;
  IncremenetRefernce(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.paramteresService.Increment(TypeNumerotation.fiche_interventionMaintenance as number)
        .subscribe(res => resolve(res), err => reject(err))
    });
  }
  listeLisiteMaintenance: VisiteMaintenance[] = [];
  /**
 * @description récuperer les visite du maitenanace de type 'à planifier'
 */
  async getVisiteMaintenance() {
    debugger
    this.visiteMaintenanceService.GetAll("", 1, AppSettings.MAX_GET_DATA, "nom", "ASC", StatutVisiteMaintenance.APlanifier, this.visiteMaintenanaceFilter.annee, null, null)
      .subscribe(async value => {
        this.listeLisiteMaintenance = value.list;
        //les selecteur des mois dans le ficheir du traduction
        const selector = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
        //recupers la traduction des mois
        let translate = await this.getTranslationByKey('mois');
        //formater les donnée à afficher dans la liste des vidte du maintenanace
        const dataSource = value.list.map(x => {
          return {
            Id: x.id,
            client: x.contratEntretien.client.nom,
            site: (JSON.parse(x.contratEntretien.site) as Adresse),
            date: translate[selector[x.mois - 1]] + ' ' + x.annee,
          }
        });
        //affecter les données
        this.field = { dataSource, id: 'Id', text: 'Name' };
      });
  }


  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation);
      });
    });
  }

  /**
   * @description récuperer la liste des techniciens de type 'technicien' & 'technicien maintenance'
   */
  getTechniciens() {
    this.utilisateurService.GetAll("", 1, AppSettings.MAX_GET_DATA, "nom", "ASC", [UserProfile.technicien, UserProfile.technicienMaintenance])
      .subscribe(value => {
        this.listeTechniciens = value.list.map(element => {
          return { Text: element.nom, Id: element.id, GroupId: UserProfile.technicien, Color: '#bbdc00', Designation: element.matricule }
        });
      });
  }

  /**
   * @description récuperer la liste des client pour l'utiliser dans le filter 
   */
  getClientListe() {
    this.clientService.GetAll("", 1, AppSettings.MAX_GET_DATA, "nom", "asc").subscribe((res) => {
      this.visiteMaintenanaceFilter.listeClient = res.list;
    });
  }


  ficheInterventionMaintenanceList() {
    this.ficheInterventionMaintenanceService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'ASC').subscribe(res => {
      console.log('--------------------');
      console.log(res);
      console.log('--------------------');
    });
  }
}

interface TechniciensInterface {
  Text: string,
  Id: number,
  GroupId: number,
  Color: string,
  Designation: string
}

interface VisiteMaintenanaceFilterInterface {
  listeClient: Client[],
  listeAnnee: number[],
  annee: number,
  idClient: number
}


import { Component, Input, Output, EventEmitter, OnInit, OnChanges } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from 'app/app-settings/app-settings';
import { IFormType } from 'app/pages/Produits/lots/lots-form/IFormType.enum';
import { StatutChantier } from 'app/Enums/StatutChantier.Enum';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { Historique } from 'app/Models/Entities/Historique';
import { LoginService } from 'app/services/login/login.service';
import { ActionHistorique } from 'app/Enums/ActionHistorique.Enum';
import { ClientService } from 'app/services/client/client.service';
import { Client } from 'app/Models/Entities/Client';
import { Router, ActivatedRoute } from '@angular/router';
import { Adresse } from 'app/Models/Entities/Adresse';
declare var toastr: any;
@Component({
  selector: 'chantier-from',
  templateUrl: './from.component.html',
  styleUrls: ['./from.component.scss']
})
export class chantierFromComponent implements OnInit, OnChanges {
  @Input('type') type;
  @Input('defaultData') defaultData: Chantier;
  @Output('OnSave') OnSave = new EventEmitter();
  newIdClient = 0;
  formType: typeof IFormType = IFormType;
  labels: any;
  public form = null;
  statuts: { id: number, label: string, color: string }[];
  actionHistorique: ActionHistorique = new ActionHistorique();
  clients: Client[] = [];
  adrresses: Adresse[] = [];
  chantier: Chantier[] = [];
  adresseList = [];
  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private chantierService: ChantierService,
    private loginService: LoginService,
    private clientService: ClientService) { }

  ngOnInit() {

    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("labels").subscribe(labels => {
      this.labels = labels;
    });
    this.translate.get("statuts").subscribe((statuts: { id: number, label: string, color: string }[]) => {
      this.statuts = statuts;
    });
  }

  ngOnChanges() {

    this.getClients();
    this.createEmptyForm();
  }

  /*--------------------------------------------------
   création du formulaire de creation d'un nouveau produit 
  -------------------------------------------------*/
  createEmptyForm() {
    let selectedClient = null;
    if (this.defaultData != null) {
      selectedClient = this.getClientById(this.defaultData.idClient);
      this.adresseList = JSON.parse(this.getClientById(this.defaultData.idClient).adresses)
    }
    this.form = this.fb.group({
      nom: [this.defaultData == null ? "" : this.defaultData.nom, [Validators.minLength(2), Validators.required], this.CheckUniqueName.bind(this)],
      description: [this.defaultData == null ? "" : this.defaultData.description],
      commentaire: [this.defaultData == null ? "" : this.defaultData.commentaire],
      idclient: [this.defaultData == null ? "" : selectedClient, [Validators.required]],
      statut: [this.defaultData == null ? StatutChantier.EnEtude : this.defaultData.statut],
      nombrHeure: [this.defaultData == null ? "" : this.defaultData.nombrHeure],
      montant: [this.defaultData == null ? "" : this.defaultData.montant],
      tauxAvancement: [this.defaultData == null ? 0 : this.defaultData.tauxAvancement],



    });
  }
  clientsListFristloading: boolean = true;
  // Pour récupérer la liste des clients
  getClients() {
    if (this.clientsListFristloading) {
      this.clientsListFristloading = false;
      this.clientService.GetAll("", 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc").subscribe((res) => {
        this.clients = res.list;
      });
    }
  }

  getClientById(idClient) {
    const element = this.clients.filter(e => e.id === idClient)[0];
    return element;
  }

  get f() { return this.form.controls; }

  /** retourner le titre du 'pop up' qui contient la formulaire selon le type d'operation (visualisation/ajout/modification) */
  getmodelName() {
    try {
      if (this.type == IFormType.add) {

        return `${this.labels.add} ${this.labels.chantier}`;
      }
      if (this.type == IFormType.preview) {
        return `${this.labels.afficher} ${this.labels.chantier}`;
      }
      if (this.type == IFormType.update) {
        return `${this.labels.modifier} ${this.labels.chantier}`;
      }
    } catch (err) { }
  }

  /**
   vérifier que le nom est unique dans la base de donnée
  --*/
  CheckUniqueName(control: FormControl): Promise<{}> {
    if (control.value != "") {
      let promise = new Promise((resolve, reject) => {
        this.chantierService
          .CheckUniqueName(control.value)
          .subscribe(res => {
            if (res == true && (this.defaultData == null || control.value != this.defaultData.nom)) {
              resolve({ CheckUniqueName: true });
            } else {
              resolve(null);
            }
          });
      });
      return promise;
    }
  }


  submit() {
    if (this.form.valid) {
      this.newIdClient = this.form.value.idclient.id;
      this.OnSave.emit({
        id: this.type == IFormType.add ? 0 : this.defaultData.id,
        nom: this.form.value.nom,
        description: this.form.value.description,
        commentaire: this.form.value.commentaire,
        nombrHeure: this.form.value.nombrHeure,
        montant: this.form.value.montant,
        tauxAvancement: this.defaultData == null ? 0 : this.defaultData.tauxAvancement,
        statut: this.form.value.statut == null ? StatutChantier.EnEtude : this.form.value.statut,
        date_creation: new Date(),
        idclient: this.form.value.idclient.id,
        historique: this.makeActionIstoriques(),
      });
      this.form.reset();
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  makeActionIstoriques(): string {
    debugger
    let historique = new Historique();
    historique.IdUser = this.loginService.getUser().id;
    /** creation d'historique d'ajout */
    if (this.type == IFormType.add) {
      historique.action = this.actionHistorique.Added;
      return JSON.stringify([historique]);
    }
    /** creation d'historique des modification */
    if (this.type == IFormType.update) {
      historique.action = this.actionHistorique.Updated;
      /** @var UndesirableFileds est une liste des champs indésirables dans les historiques de modifications */
      const UndesirableFileds: string[] = ['date_creation', 'historique', 'id', 'statut', 'documentation', 'client', 'Client', 'devis', 'bonCommandeFournisseur', 'factures', 'depense', 'ficheIntervention'];
      historique.champs = this.detectDifferentFields(this.form.value, this.defaultData, UndesirableFileds);
      let historiques: Historique[] = this.defaultData.historique == null ? [] : (JSON.parse(this.defaultData.historique) as Historique[]);
      historiques.push(historique)
      return JSON.stringify(historiques);
    }
  }

  /** 
   * @summary cette fonction utiliser pour la création d'historique pour les champs modifié 
   * @todo détecter des champs différents entre deux objets de données avec l'excluent des champs indésirables dans les historiques de modifications
   * @returns liste des objet contient le nom d'attribut modifié et la nouvau valuer et  l'ancien valeur
   * @param UndesirableFileds est une liste des champs indésirables dans les historiques de modifications
   * @param dataBefore les information avant les modification
   * @param dataAfter un objet d'informations après les modifications
  */
  detectDifferentFields(dataBefore: object, dataAfter: object, UndesirableFileds?: string[]): { Attribute: any, After: any, Before: any }[] {
    let historiqueChamps: { Attribute: any, After: any, Before: any }[] = [];

    for (let fieldName in dataAfter) {
      if (!UndesirableFileds.includes(fieldName)) {
        if (dataAfter[fieldName] != dataBefore[fieldName]) {
          if (fieldName == 'idClient') {
            const clientBefore: Client = this.getClientById(this.defaultData.idClient);
            dataBefore[fieldName] = `${clientBefore.nom}`;
            const clientAfter: Client = this.getClientById(this.newIdClient);
            dataAfter[fieldName] = `${clientAfter.nom}`;
          }
          historiqueChamps.push({
            Attribute: fieldName == 'idClient' ? 'Client' : fieldName,
            After: dataBefore[fieldName],
            Before: dataAfter[fieldName]
          });
        }
      }
    }

    return historiqueChamps;
  }

  getLabelleByStatut(statut): string {
    return this.statuts.filter(S => S.id == statut)[0].label;
  }


  setData(data) {
    let defaultData = data.chantier as Chantier;
    this.form.controls['idClient'].setValue(defaultData.idClient.toString());
    this.clientsListFristloading = true;
    this.getClients();
  }

  retrunNewClient(client: Client) {
    this.clients.unshift(client);
    this.form.controls["idclient"].setValue(client);
  }
}
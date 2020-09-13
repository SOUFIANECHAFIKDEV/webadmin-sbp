import { Component, OnInit, ViewChild, Input, Inject } from '@angular/core';
import { StatutDevis } from 'app/Enums/StatutDevis';
import { TranslateService } from '@ngx-translate/core';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { LoginService } from 'app/services/login/login.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { DocumentAttacherService } from 'app/services/documentAttacher/document-attacher.service';
import { DOCUMENT } from '@angular/common';
import { RubriqueEnum } from 'app/Enums/RubriqueEnum.enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { LabelShowModel } from 'app/Models/LabelShowModel';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { IFormType } from '../../../../Enums/IFormType.enum';
import { DocumentAttacher } from 'app/Models/Entities/DocumentAttacher';
import { TypeDocument } from 'app/Models/Entities/TypeDocument';

export declare var swal: any;
declare var toastr: any;

@Component({
  selector: 'app-rebrique-document',
  templateUrl: './rebrique-document.component.html',
  styleUrls: ['./rebrique-document.component.scss'],
})
export class DocumentAttacherComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElementDocument: DataTableDirective;
  dtOptionsDocument: DataTables.Settings;
  dtTriggerDocument: Subject<any> = new Subject();
  dataTablesLang;
  tableColumnsDocuments: any[];
  pageLength: number = 50;
  checkedColumns: any;
  recordsTotal: number = 0;
  INIT_CHEKECED_COLMUN;
  chantier = '';
  idProfile; // profile d'utilisateur actual
  userProfil: typeof UserProfile = UserProfile;
  initPage = 0;
  total;
  i = 0;
  @Input('statut') statut;
  @Input('orderBy') orderBy;
  @Input('nameModule') nameModule;

  dateLang;
  listStatus: any = [];
  listChantiers: any = [];
  statutDevis: typeof StatutDevis = StatutDevis;

  recordsFiltered;
  idChantier: number;
  module: number = null;
  documents;
  selectedLables = [];
  processing: boolean = false;
  formType: typeof IFormType = IFormType;
  public formConfig = {
    type: null,
    defaultData: null
  }
  constructor(
    private translate: TranslateService,
    private loginService: LoginService,
    private route: ActivatedRoute,
    private router: Router,
    private documentAttacherService: DocumentAttacherService,
    @Inject(DOCUMENT) private document: any,
    private parameteresService: ParameteresService,
    private fileManagerService: FileManagerService,
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getDataTablesTrans();
    this.translate.get('datePicker').subscribe(text => {
      this.dateLang = text;
    });
    this.idProfile = this.loginService.getUser()['idProfile'];
    this.translate.get('labels').subscribe(labels => {
      this.tableColumnsDocuments = [
        labels.designation,
        labels.commentaire,
        labels.labelDocument,
        labels.user,
        labels.action,
      ]
      this.listStatus.push({ value: this.statutDevis.Annulee, name: labels.annulee });
      this.listStatus.push({ value: this.statutDevis.EnAttente, name: labels.enattente });
      this.listStatus.push({ value: this.statutDevis.Acceptee, name: labels.accepte });
      this.listStatus.push({ value: this.statutDevis.NonAcceptee, name: labels.nonaccepte });
    });
    this.route.params.subscribe(params => {
      this.idChantier = params['id'];
      this.module = parseInt(RubriqueEnum[params['module']]);
    });
    this.getDocumentionTypes();
  }
  emitter: any = {};
  emptyList() {
    this.emitter.emptyList();
  }
  GetAll(search, pNumber, pSize, cSort, sDir) {
    this.documentAttacherService.GetAll(search, pNumber, pSize, cSort, sDir).subscribe(Response => {
      this.documents = Response;
    });
  }

  InitDataTableDocuments() {
    this.processing = true;
    // recupérer old paramétere
    let oldChoices = JSON.parse(localStorage.getItem('module_documents_info'));
    this.pageLength =
      !oldChoices || oldChoices.page_length == null
        ? AppSettings.SIZE_PAGE
        : parseInt(oldChoices.page_length);
    let order =
      !oldChoices || oldChoices.sort == null
        ? [[0, 'asc']]
        : [[parseInt(oldChoices.sort), oldChoices.dir]];

    this.dtOptionsDocument = {
      pagingType: 'full_numbers',
      pageLength: this.pageLength,
      serverSide: true,
      processing: false,
      displayStart: this.initPage,
      search: { search: oldChoices && oldChoices.search != null ? oldChoices.search : '' },
      order: order,
      language: this.dataTablesLang,
      columnDefs: [{ orderable: false, targets: 4 }],
      ajax: (dataTablesParameters: any, callback) => {
        this.documentAttacherService.GetAll(
          dataTablesParameters.search.value,
          dataTablesParameters.start / dataTablesParameters.length + 1,
          dataTablesParameters.length,
          dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
          dataTablesParameters.order[0].dir,
          this.idChantier,
          this.selectedLables.map(element => { return element.name }),
          this.module
        )

          .subscribe(data => {
            this.documents = data;
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
        { data: 'commentaire' },
        { data: 'commentaire' },
        { data: 'label_document' },
        { data: 'idUser' },
        { data: 'action' },
      ],
    };
  }

  delete(id) {
    this.translate.get('list.delete').subscribe(text => {
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
          this.documentAttacherService.Delete(id).subscribe(res => {
            if (res) {
              swal(text.success, '', 'success');
              this.rerender();
            } else {
              swal(text.error, '', 'error');
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

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.InitDataTableDocuments();
      this.dtTriggerDocument.next();
      this.rerender();
    }, 500);
    setTimeout(() => {
      // this.loading = false;
    }, 1000);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTriggerDocument.unsubscribe();
  }

  rerender(): void {
    this.dtElementDocument.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
      this.dtTriggerDocument.next();
    });

  }

  getDataTablesTrans() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get('dataTables').subscribe((text: string) => {
      this.dataTablesLang = text;
      this.InitDataTableDocuments();
    });
  }

  filterParLabel() {
    this.rerender();
  }

  insialazeLabels(labels: string): string {
    if (labels == null) {
      return
    } else {
      let text = '';
      const labelsList = JSON.parse(labels);
      labelsList.forEach(label => {
        // text = text + '- ' + label + '<br>';
        text = text + `<i class="ft-tag"></i> ${label} <br> `;
      });
      return text;
    }
  }

  navigateToUserDetail(idUser: number) {
    const origin = this.document.location.origin;
    const url = `${origin}/utilisateurs/detail/${idUser}`;
    window.open(url, '_blank');
  }

  typesDocuments: TypeDocument[] = null;
  getDocumentionTypes() {
    if (this.typesDocuments == null) {
      this.parameteresService.Get(TypeParametrage.typedocument).subscribe(data => {
        this.typesDocuments = JSON.parse(data.contenu);
      });
    }
  }

  formaterLabels(list): LabelShowModel[] {
    let labelsList: LabelShowModel[] = [];
    list.forEach((label, index) => {
      labelsList.push({ id: index, name: label.nom, disabled: false });
    });
    return labelsList;
  }

  setformConfig(defaultData, type) {
    this.formConfig.defaultData = defaultData;
    this.formConfig.type = type;
  }

  async OnSave(data) {
    if (this.formConfig.type == IFormType.add) {
      this.addDocumentAttacher(data);
    }
    if (this.formConfig.type == IFormType.update) {
      this.updatedocumentAttacher(data);
    }
  }

  async updatedocumentAttacher(documentation) {
    let filedoc = typeof (documentation.pieceJointes) == 'string' ? JSON.stringify(documentation.pieceJointes
    ) : documentation.pieceJointes;
    if (filedoc.file != null) {
      await this.deleteFile(filedoc.name);
      await this.addFile([{ base64: filedoc.file, name: filedoc.name }]);
      filedoc.file == null;
      documentation.pieceJointes = JSON.stringify(filedoc);
    }

    documentation.idChantier = this.idChantier;
    documentation.idRubrique = this.module;
    this.documentAttacherService.Update(documentation.id, documentation).subscribe(res => {
      this.rerender();
      this.translate.get("updateDocumentAttache").subscribe(async text => {
        toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });

    }, err => {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    });
  }

  addFile(body: { base64: string, name: string }[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.fileManagerService.Add(body).subscribe(res => {
        resolve(res)
      }, err => {
        reject(err)
      })
    })
  }

  deleteFile(name: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.fileManagerService.Delete(name).subscribe(res => {
        resolve(res)
      }, err => {
        reject(err)
      })
    })
  }

  async addDocumentAttacher(documentation: DocumentAttacher) {
    let result = await this.addFile([{
      base64: documentation.pieceJointes.file,
      name: documentation.pieceJointes.name
    }]);
    if (result) {
      documentation.idChantier = this.idChantier
      documentation.idRubrique = this.module;
      documentation.pieceJointes = JSON.stringify(documentation.pieceJointes);
      documentation.DateAjout = new Date();
      this.documentAttacherService.Add(documentation).subscribe(async res => {
        if (res) {
          this.rerender();
          this.translate.get("adddoc").subscribe(text => {
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          });
        }
      }, err => {
        this.translate.get("adddoc").subscribe(text => {
          toastr.danger(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      });
    }
  }

}

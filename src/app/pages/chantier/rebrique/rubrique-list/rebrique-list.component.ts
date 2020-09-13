import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IFormType } from '../../../../Enums/IFormType.enum';
import { DocumentationChantier } from 'app/Models/Entities/documentation';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TypeDocument } from 'app/Models/Entities/TypeDocument';
import { TranslateService } from '@ngx-translate/core';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { DocumentAttacherService } from 'app/services/documentAttacher/document-attacher.service';
import { DocumentAttacher } from 'app/Models/Entities/DocumentAttacher';
import { RubriqueEnum } from 'app/Enums/RubriqueEnum.enum';
import { NbDocumentsChantieModel } from 'app/Models/ChantierChangeStatusResponse';

declare var jQuery: any;
declare var swal: any;
declare var toastr: any;

@Component({
  selector: 'app-rebrique',
  templateUrl: './rebrique-list.component.html',
  styleUrls: ['./rebrique-list.component.scss']
})
export class RebriqueComponent implements OnInit {
  @Output('OnRefresh') refresh = new EventEmitter();
  @Input('nbDocuments') nbDocuments: NbDocumentsChantieModel = new NbDocumentsChantieModel();
  formType: typeof IFormType = IFormType;
  documentationsChantier: DocumentationChantier[] = [];
  formConfig = {
    type: null,
    defaultData: null
  }
  typeForSearch = null;
  searchQuery = '';
  chantier: Chantier;
  idChantier: number = 0;
  typesDocuments: TypeDocument[] = null;
  documentAttacher: DocumentAttacher[] = [];
  rubriqueEnum: typeof RubriqueEnum = RubriqueEnum;
  RubriqueInfo: {
    id: number,
    nbrDoc: number,
    lastEditDate: Date
  }[] = [];
  idrubrique;
  emitter: any = {};

  constructor(
    private route: ActivatedRoute,
    private translate: TranslateService,
    private chantierService: ChantierService,
    private fileManagerService: FileManagerService,
    private parameteresService: ParameteresService,
    private router: Router,
    private documentAttacherService: DocumentAttacherService,
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    this.route.params.subscribe(async params => {
      this.idChantier = params["id"];
    });
    this.chantier = await this.getDocumention(this.idChantier);
    await this.getDocumentationsChantier();
    this.documentAttacher = await this.getRubrique();

  }

  getRubriqueInfo(idRubrique): { nbrDoc: number, lastEditDate: Date } {
    const documentAttacher: DocumentAttacher[] = this.documentAttacher.filter(element => element.idRubrique == idRubrique);
    let lastDate = documentAttacher.length != 0 ? documentAttacher[0].updateAt : null;
    documentAttacher.forEach(element => {
      lastDate = this.compareDate(lastDate, element.updateAt) ? lastDate : element.updateAt;
    });
    if (idRubrique == this.rubriqueEnum.devis) {
      const lastModification = this.getLastModification("devis");
      lastDate = this.compareDate(lastDate, lastModification) ? lastDate : lastModification;
    }
    if (idRubrique == this.rubriqueEnum.facturation) {
      const lastModification = this.getLastModification("factures");
      lastDate = this.compareDate(lastDate, lastModification) ? lastDate : lastModification;
    }

    if (idRubrique == this.rubriqueEnum.commandes_devis) {
      const lastModification = this.getLastModification("bonCommandeFournisseur");
      lastDate = this.compareDate(lastDate, lastModification) ? lastDate : lastModification;
    }


    return { nbrDoc: documentAttacher.length, lastEditDate: lastDate }
  }

  getLastModification(document: string) {
    if (!this.chantier) {
      return null;
    }
    const doc = this.chantier[document]
    let maxdate = doc.map(x => JSON.parse(x.historique))
    if (maxdate.length == 0) {
      return null;
    }
    var max = maxdate.slice(-1)[0];
    // var max = null : maxdate.slice(-1)[0];
    // console.log(max.slice(-1)[0].date)
    return max.slice(-1)[0].date;

  }


  compareDate(date1, date2) {
    //Note: 00 is month i.e. January
    var dateOne = new Date(date1); //Year, Month, Date
    var dateTwo = new Date(date2); //Year, Month, Date
    if (dateOne > dateTwo) {
      return true;
    } else {
      return false;
    }
  }

  getRubrique(): Promise<DocumentAttacher[]> {
    return new Promise((resolve, reject) => {
      this.documentAttacherService.GetAll('', 1, AppSettings.MAX_GET_DATA, 'id', 'asc', this.idChantier).subscribe(res => {
        resolve(res.list);
      })
    })
  }

  async getDocumentationsChantier() {

    try {

      this.documentationsChantier = JSON.parse(this.chantier.documentation == null ? '[]' : this.chantier.documentation) as DocumentationChantier[];


    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.server, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  getDocumention(id: number): Promise<Chantier> {

    return new Promise((resolve, reject) => {
      this.chantierService.Get(id).subscribe(chantier => {
        resolve(chantier);
      }, err => {
        reject(err);
      });
    });
  }

  setformConfig(idrubrique, defaultData, type) {
    this.getDocumentionTypes();
    this.idrubrique = idrubrique;
    this.formConfig.defaultData = defaultData;
    this.formConfig.type = type;
    this.emptyList();
  }


  setDocumentation(newDoc: DocumentationChantier) {
    const documentation: DocumentationChantier[] = this.chantier.documentation == null ? [] : JSON.parse(this.chantier.documentation);
    documentation == null ? [] : documentation;
    documentation.unshift(newDoc);
    return JSON.stringify(documentation);
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

  async addDocumentAttacher(documentation: DocumentAttacher) {
    let result = await this.addFile([{
      base64: documentation.pieceJointes.file,
      name: documentation.pieceJointes.name
    }]);
    if (result) {
      documentation.idChantier = this.idChantier
      documentation.idRubrique = this.idrubrique
      documentation.pieceJointes = JSON.stringify(documentation.pieceJointes);
      documentation.DateAjout = new Date();
      this.documentAttacherService.Add(documentation).subscribe(async res => {
        if (res) {
          this.documentAttacher = await this.getRubrique();
          this.translate.get("adddoc").subscribe(text => {
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          });
        }

        //refresh 
        this.refresh.emit('1');

      }, err => {
        this.translate.get("adddoc").subscribe(text => {
          toastr.danger(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      });
    }
  }

  // open rubrique 
  open(name) {
    this.route.params.subscribe(params => {
      this.router.navigate([`chantiers/${params['id']}/documents/${name}`]);
    });
  }

  async Add(documentation: DocumentationChantier) {

    let result = await this.addFile([{
      base64: documentation.pieceJointes.file,
      name: documentation.pieceJointes.name
    }]);
    if (result) {
      documentation.id = this.createId();
      this.chantierService.UpdateDocumentation(this.chantier.id, this.setDocumentation(documentation)).subscribe((chantier: Chantier) => {
        this.chantier = chantier;
        this.documentationsChantier = JSON.parse(chantier.documentation == null ? '[]' : this.chantier.documentation) as DocumentationChantier[];
        this.translate.get("adddoc").subscribe(text => {
          toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      }, err => {
        this.translate.get("adddoc").subscribe(text => {
          toastr.danger(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        });
      });
    }
  }

  createId() {
    return this.documentationsChantier.length == 0 ?
      1 : ((Math.max.apply(Math, this.documentationsChantier.map(function (o) { return o.id; }))) + 1);
  }

  async update(documentation: DocumentationChantier) {
    let docs: DocumentationChantier[] = (JSON.parse(this.chantier.documentation) as DocumentationChantier[]);
    let doc: DocumentationChantier = docs.filter(d => d.id == documentation.id)[0];
    if (doc.pieceJointes.name != documentation.pieceJointes.name) {
      await this.deleteFile(doc.pieceJointes.name);
      await this.addFile([{ base64: documentation.pieceJointes.file, name: documentation.pieceJointes.name }]);
    }

    let index = -1;
    docs.map((d, i) => {
      if (d.id == documentation.id) {
        index = i;
      }
    });
    docs[index] = documentation;
    this.chantierService.UpdateDocumentation(this.chantier.id, JSON.stringify(docs)).subscribe((chantier: Chantier) => {

      this.chantier = chantier;
      this.documentationsChantier = JSON.parse(this.chantier.documentation) as DocumentationChantier[];
      this.translate.get("updatedoc").subscribe(text => {
        toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }, err => {
      this.translate.get("updatedoc").subscribe(text => {
        toastr.danger(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    });
  }

  delete(id: number) {
    this.translate.get("list.deletedoc").subscribe(text => {
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
      }).then(async isConfirm => {
        if (isConfirm) {

          //supprimer le document localement
          let documentation: DocumentationChantier[] = (JSON.parse(this.chantier.documentation) as DocumentationChantier[]);
          const fileName = documentation.filter(d => d.id == id)[0].pieceJointes.name;
          const result = await this.deleteFile(fileName);
          if (result) {
            this.chantier.documentation = JSON.stringify(documentation.filter(d => d.id != id));

            this.chantierService.Update(this.chantier.id, this.chantier).subscribe((res) => {
              if (res) {
                this.documentationsChantier = this.documentationsChantier.filter(d => d.id != id);
                swal(text.success, "", "success");
              } else {
                swal(text.error, "", "error");
              }
            });
          } else {
            swal(text.cancel, "", "error");
          }
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });

  }

  async OnSave(data) {
    if (this.formConfig.type == IFormType.add) {
      // await this.Add(data);
      await this.addDocumentAttacher(data)
    }
    if (this.formConfig.type == IFormType.update) {
      this.update(data);
    }
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

  backchantier() {
    const url = `chantiers/detail/${this.idChantier}`
    this.router.navigate([url]);
  }

  getDocumentionTypes() {
    if (this.typesDocuments == null) {
      this.parameteresService.Get(TypeParametrage.typedocument).subscribe(data => {
        this.typesDocuments = JSON.parse(data.contenu);
      });
    }
  }

  async search() {
    await this.getDocumentationsChantier();
    this.documentationsChantier = this.documentationsChantier.filter(d => (this.typeForSearch == null ? true : (d.type == this.typeForSearch)) && (d.designation.search(this.searchQuery)) != -1);
  }

  searchByQuery(value) {
    this.searchQuery = value;
    this.search();
  }

  getTypeName(idType: number): string {
    return this.typesDocuments.filter(t => t.id == idType)[0].nom;
  }

  emptyList() {

    this.emitter.emptyList();
  }
}
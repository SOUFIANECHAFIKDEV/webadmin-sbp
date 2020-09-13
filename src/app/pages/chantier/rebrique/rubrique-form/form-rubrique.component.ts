import { Component, OnInit, Input, Output, OnChanges, EventEmitter } from '@angular/core';
import { DocumentationChantier } from 'app/Models/Entities/documentation';
import { IFormType } from 'app/Enums/IFormType.enum';
import { TypeDocument } from 'app/Models/Entities/TypeDocument';
import { TranslateService } from '@ngx-translate/core';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';
import { LoginService } from 'app/services/login/login.service';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { DocumentAttacher } from 'app/Models/Entities/DocumentAttacher';
import { element } from '@angular/core/src/render3';
import { ConditionalExpr } from '@angular/compiler';
declare var toastr: any;
declare var jQuery: any;
@Component({
  selector: 'app-form-rubrique',
  templateUrl: './form-rubrique.component.html',
  styleUrls: ['./form-rubrique.component.scss']
})
export class FormRubriqueComponent implements OnInit, OnChanges {

  @Input('type') type;
  @Input('defaultData') defaultData: DocumentAttacher;
  @Output('OnSave') OnSave = new EventEmitter();
  @Input('load') load: { emptyList };
  formType: typeof IFormType = IFormType;
  labels: any;
  documentationForm = this.fb.group({ /*type: [],*/ designation: [], commentaire: [] });
  files = null;
  file: any;
  listLablDocument: any
  allTagsList = [];
  listLabelTags = [];
  tagsSelected: { value: string, origine: boolean }[] = [];
  emitter: any = {};
  @Input("typesDocuments") typesDocuments = null;

  constructor(
    private translate: TranslateService,
    private parameteresService: ParameteresService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private loginService: LoginService,
    private fileManagerService: FileManagerService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("labels").subscribe(labels => {
      this.labels = labels;
    });
  }

  ngOnChanges() {

    if (this.load != undefined) {
      this.load.emptyList = this.emptyList.bind(this);
    }
    this.createEmptyForm();
    this.FilterTagsList();
  }

  createEmptyForm() {
    const designation = this.defaultData == null ? "" : this.defaultData.designation;
    const commentaire = this.defaultData == null ? "" : this.defaultData.commentaire;
    if (this.defaultData != null) {
      this.listLabelTags = [];
      JSON.parse(this.defaultData.labelDocument).forEach(tag => {
        this.listLabelTags.push({ value: tag, origine: false })
      })
    }
    this.documentationForm = this.fb.group({
      //type: [type, [Validators.required]],
      designation: [designation, [Validators.minLength(2), Validators.required]],
      commentaire: [commentaire]
      //rebrique: [rebrique]
    });
    this.file = this.defaultData == null ? null : this.defaultData.pieceJointes;
  }

  get f() { return this.documentationForm.controls; }

  /** 
   * retourner le titre du 'pop up' 
   * qui contient la formulaire selon le type d'operation 
   * (visualisation/ajout/modification)
   */


  emptyList() {

    this.emitter.emptyList();
    this.documentationForm.reset();
    this.file = null;
  }

  getmodelName() {
    if (this.type == IFormType.add) {

      return `${this.labels.attacher} ${this.labels.document}`;
    }
    if (this.type == IFormType.preview) {
      return `${this.labels.afficher} ${this.labels.document}`;
    }
    if (this.type == IFormType.update) {
      return `${this.labels.modifier} ${this.labels.document}`;
    }
    return '';
  }

  checkIfAllFiledsIsValid(): boolean {
    if (!this.documentationForm.valid || this.file == null) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
      return false;
    }
    return true;
  }

  async getNewTags(): Promise<string[] | boolean> {
    try {
      await this.manipulateLabels(this.tagsSelected);
    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
      return;
    }
    let newTags: string[] = [];
    this.tagsSelected.forEach(element => {
      newTags.push(element.value);
    });
    return newTags;
  }

  async submit() {

    if (!this.checkIfAllFiledsIsValid()) return;
    const newTags = await this.getNewTags();
    // if (newTags == false) return;

    const response: DocumentAttacher = {
      id: this.type == IFormType.add ? 0 : this.defaultData.id,
      labelDocument: JSON.stringify(newTags as string[]),
      commentaire: this.documentationForm.value.commentaire == null ? "" : this.documentationForm.value.commentaire,
      designation: this.documentationForm.value.designation,
      pieceJointes: this.file,
      DateAjout: this.defaultData == null ? new Date() : this.defaultData.DateAjout,
      updateAt: new Date(),
      idUser: this.loginService.getUser().id,
      idRubrique: null,
      idChantier: null,
    }

    this.OnSave.emit(response);
    this.reInitialser();

  }

  reInitialser() {
    jQuery("#DocumentationModel").modal("hide");
    this.documentationForm.reset();
    this.file = null;
    this.tagsSelected = [];
    this.allTagsList = [];
    this.FilterTagsList();
  }

  /** ****************************************
   * files logique
   **************************************** */


  /**
   * get the file from the user device
   */
  startUpload(event: FileList): void {
    const file = event.item(0)
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let pieceJoin = new PieceJoin()
      pieceJoin.name = AppSettings.guid()
      pieceJoin.type = file.name.substring(file.name.lastIndexOf('.') + 1)
      pieceJoin.orignalName = file.name
      pieceJoin.file = reader.result.toString()
      this.file = pieceJoin;
      // this.files = null;
    }
  }

  downloadPieceJointe() {
    let fileparse = JSON.parse(this.file)
    let pieceJointe = fileparse as PieceJoin;
    this.fileManagerService.Get(pieceJointe.name).subscribe(
      value => {
        pieceJointe.file = value['data'] as string;
        AppSettings.downloadBase64(value['data'], pieceJointe.orignalName, pieceJointe.file.substring("data:".length, pieceJointe.file.indexOf(";base64")), pieceJointe.type)
      }
    )
  }

  removeFile() {
    this.file = null;
  }

  parseFileInfos(data) {
    try {
      let file = data.orignalName == undefined ? JSON.parse(data
      ) : data
        ;
      return file;
    } catch (err) {
    }
  }

  /** ****************************************
   * labels logique
  ****************************************  */

  //Ajout de label de document dans parametrage type document
  addtype(tagsSelected: any[]): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
      const newtags = [];
      let id = await this.selectMaxId(this.typesDocuments);
      tagsSelected.forEach(element => {
        id = id + 1;
        let newT = {
          id: id,
          nom: element.value,
          isFixed: false
        };
        newtags.push(newT);
      });
      this.typesDocuments = this.typesDocuments.concat(newtags);
      this.typesDocuments.contenu = JSON.stringify(this.typesDocuments);
      this.parameteresService.Update(TypeParametrage.typedocument, this.typesDocuments.contenu).subscribe(res => {
        if (res) {
          resolve(true);
        }
      }, err => {
        reject(err)
      });

    });
  }

  selectMaxId(contenu: any[]): Promise<number> {
    return new Promise((resolve, reject) => {
      let maxId = 1;
      contenu.forEach(item => {
        maxId = item.id > maxId ? item.id : maxId;
      });
      resolve(maxId);
    })
  }

  async  manipulateLabels(tagsSelected: { value: string, origine: boolean }[]) {
    let newTags = [];
    tagsSelected.forEach(element => {
      if (!element.origine) {
        newTags.push(element);
      }
    });
    await this.addtype(newTags);
  }

  /*--------------------------------------------------
   récupérer la liste des labels document(tags) de la base de données pour le proposer a l'utilisatuer
 --------------------------------------------------*/

  lIstnom: any
  FilterTagsList() {
    debugger
    if (this.typesDocuments != null) {
      this.typesDocuments.forEach(tag => {
        if (this.allTagsList.filter(x => x.value == tag.nom).length == 0) {
          this.allTagsList.push({ value: tag.nom, origine: true });
        }
      });
    }
  }

  /*--------------------------------------------------
 si une label(tag) est ajouter ou supprimer ou modifier 
 le 'composant' responsable de 'crud' les labels(tags) retourner la nouvelle liste de ces labels(tags)
 => il faut les ajouter dans un variable de type tableau Qu'il a ajouer dans l'objet qui nous envoyer au serveur
 -------------------------------------------------*/
  onTagsChange(Tags: [{ value: string, origine: boolean }]) {
    this.tagsSelected = Tags;
  }

  getTranslateByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(data => {
        resolve(data)
      });
    });
  }
}

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { Memo } from 'app/Models/Entities/Memo';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
declare var jQuery: any;

@Component({
  selector: 'common-memos',
  templateUrl: './memos.component.html',
  styleUrls: ['./memos.component.scss']
})
export class MemosComponent {
  @Input('memos') memos: Memo[];
  @Output() valueChange = new EventEmitter();
  @Output() download = new EventEmitter();
  @Input() showLoader: boolean = false;
  @Input('processIsStarting') processIsStarting: boolean = false;
  @Input('modificationPermission') modificationPermission: boolean = false;
  @Output('OnDeleteMemo') OnDeleteMemo = new EventEmitter();
  @Output('OnUpdateMemo') OnUpdateMemo = new EventEmitter();

  newMemos: Memo = new Memo();
  commentaire: string = "";
  files = null;
  formTitle: string = "";
  formType: string = "";
  memoEditIndex = null;

  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang('fr');
    this.translate.use(AppSettings.lang);
  }

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
      this.newMemos.pieceJointes.unshift(pieceJoin)
      this.files = null;
    }
  }
  downloadFile(i, j) {
    this.download.emit(this.memos[i].pieceJointes[j])
  }
  deleteFile(i) {
    this.newMemos.pieceJointes.splice(i, 1)
  }

  save() {
    debugger
    if (this.commentaire != "" || this.newMemos.pieceJointes.length > 0) {
      this.newMemos.idUser = JSON.parse(localStorage.getItem("PDB_USER")).id;
      this.newMemos.commentaire = this.commentaire
      if (this.formType == 'add') {
        this.newMemos.date = new Date();
        this.valueChange.emit(this.newMemos);
      } else {
        this.OnUpdateMemo.emit({ memo: this.newMemos, index: this.memoEditIndex });
      }
      this.emptyForm();
    }
  }

  deleteMemo(index) {
    debugger
    this.OnDeleteMemo.emit(index);
  }

  openModel(type, memo?: Memo, index?: number) {
    debugger
    this.formType = type;
    if (type == 'add') {
      this.memoEditIndex = null;
      this.commentaire = "";
      this.newMemos.pieceJointes = [];
      this.translate.get("commun").subscribe(text => this.formTitle = text.AjouterUneFicheTechnique);
    } else {
      this.memoEditIndex = index;
      this.translate.get("commun").subscribe(text => this.formTitle = text.EditUneFicheTechnique);
      this.commentaire = memo.commentaire;
      const pieceJointes: PieceJoin[] = memo.pieceJointes.map(pieceJointes => { return pieceJointes });
      this.newMemos.pieceJointes = pieceJointes;
    }
    jQuery("#memoPopu").modal("show");
  }
  /** @description vider la formulaire */
  emptyForm(): void {
    this.commentaire = "";
    this.newMemos.pieceJointes = [];
  }

}

import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { Depense } from 'app/Models/Entities/depense';
import { StatutDepense, CategorieDepense } from 'app/Enums/StatutDepense.Enum';
import { AppSettings } from 'app/app-settings/app-settings';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { Memo } from 'app/Models/Entities/Memo';
import { DepenseService } from 'app/services/depense/depense.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: 'information-depense',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit, OnChanges {



  @Input('depense') depense = null//: Depense;
  @Input('memos') memos//: Memo[];
  @Input('articles') articles = [];
  @Output() download = new EventEmitter();
  statutDepense: typeof StatutDepense = StatutDepense;
  categorieDepense: typeof CategorieDepense = CategorieDepense;
  documentAvoir
  id
  editorConfig: AngularEditorConfig = {
    editable: false,
    spellcheck: false,
    translate: 'yes',
    enableToolbar: false,
    showToolbar: false,
  }

  constructor(
    private fileManagerService: FileManagerService,
  ) { }

  ngOnInit() {
  }
  async ngOnChanges() {
    if (typeof (this.depense) === 'object') {
      if (this.depense.documentAvoir != undefined && this.depense.documentAvoir != null) {
        this.documentAvoir = JSON.parse(this.depense.documentAvoir);
      }

    }
  }

  downloadFile() {
    let pieceJointe = JSON.parse(this.depense.documentAvoir)[0].pieceJointes[0] as PieceJoin;
    this.fileManagerService.Get(pieceJointe.name).subscribe(value => {
      pieceJointe.file = value['data'] as string;
      AppSettings.downloadBase64(
        value['data'],
        pieceJointe.orignalName,
        pieceJointe.file.substring('data:'.length, pieceJointe.file.indexOf(';base64')),
        pieceJointe.type
      );
    });
  }



}

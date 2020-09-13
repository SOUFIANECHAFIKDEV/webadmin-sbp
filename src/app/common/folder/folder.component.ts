import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { StatutChantier } from 'app/Enums/StatutChantier.Enum';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.component.html',
  styleUrls: ['./folder.component.scss'],
  providers: []
})
export class FolderComponent {
  @Input('chantierInfos') chantier: Chantier;
  @Output('open') open = new EventEmitter();
  @Output('show') showEmitter = new EventEmitter();
  @Output('delete') deleteEmitter = new EventEmitter();
  @Output('edit') editEmitter = new EventEmitter();
  @Input('showActions') showActions: Chantier;
  @Input('deleteAction') deleteAction: boolean = true;
  
  statuts: { id: number, label: string, color: string }[];
  statutChantier: typeof StatutChantier = StatutChantier;
  constructor(private translate: TranslateService) {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("statuts").subscribe((statuts: { id: number, label: string, color: string }[]) => {
      this.statuts = statuts;
    });
  }

  getLabelleByStatut(statut): string {
    return this.statuts.filter(S => S.id == statut)[0].label;
  }

  getColorByStatut(statut): string {
    return `0.25rem solid ${this.statuts.filter(S => S.id == statut)[0].color}`;
  }

  delete() {
    this.deleteEmitter.emit(this.chantier.id);
  }

  show() {
    this.showEmitter.emit(this.chantier);
  }

  edit() {
    this.editEmitter.emit(this.chantier);
  }
}
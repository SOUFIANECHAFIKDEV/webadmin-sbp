import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';

@Component({
  selector: 'app-porte',
  templateUrl: './portes.component.html',
  styleUrls: ['./portes.component.scss'],
  providers: []
})
export class PortesComponent {
  @Input('name') name: any =".";
  @Output('open') open = new EventEmitter();
  openPorte() {
    this.open.emit();
  }
}
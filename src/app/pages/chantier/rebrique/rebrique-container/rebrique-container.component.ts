import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AppSettings } from 'app/app-settings/app-settings';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'document-container',
  templateUrl: './rebrique-container.component.html',
  styleUrls: ['./rebrique-container.component.scss'],
})
export class RebriqueContainerComponent implements OnInit {
  moduleName: string = null;
  idChantier: number = null;
  moduleNameFromTransaltion;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private translate: TranslateService, ) { }

  async ngOnInit() {

    this.moduleName = await this.getParmsFromUrl('module') as string;
    this.idChantier = await this.getParmsFromUrl('id') as number;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    const labels = await this.getTransaltion('rubrique');
    this.moduleNameFromTransaltion = labels[this.moduleName];
  }

  /**
  * return the type of the document
  */
  getParmsFromUrl(key: string): Promise<string | number> {
    return new Promise((resolve, reject) => {
      this.route.params.subscribe(params => resolve(params[key]))
    });
  }

  getTransaltion(key: string) {
    return new Promise((reslove, reject) => {
      this.translate.get(key).subscribe(transaltion => {
        reslove(transaltion);
      });
    });
  }
  /**
   * back to list chantiers  
  */
  navigateToListChantiers(): void {
    let url = `/chantiers`;
    this.router.navigate([url]);
  }
  /**
   * back to chantier 
   */
  navigateToChantier(): void {
    let url = `/chantiers/detail/${this.idChantier}`;
    this.router.navigate([url]);
  }

}
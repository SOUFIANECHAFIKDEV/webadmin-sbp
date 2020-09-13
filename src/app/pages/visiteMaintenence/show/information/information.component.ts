import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { VisiteMaintenance } from 'app/Models/Entities/VisiteMaintenance';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { GammeVisiteMaintenanceEquipementModel } from 'app/Models/GammeVisiteMaintenanceEquipementModel';

@Component({
  selector: 'app-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit, OnChanges {

  @Input('visiteMaintenance') visiteMaintenance: VisiteMaintenance;
  ListGammeEquipement: GammeVisiteMaintenanceEquipementModel[] = [];

  constructor(
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }
  jsonParse(data) {
    try {
      console.log(JSON.parse(data))
      return JSON.parse(data);
    } catch (err) {

    }
  }
  date;
  async ngOnChanges() {
    debugger
    this.ListGammeEquipement = JSON.parse(this.visiteMaintenance.gammeMaintenance)

    await this.displayFormatDate();

  }
  async displayFormatDate() {
    debugger
    const selector = ["janvier", "fevrier", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];

    let translate = await this.getTranslationByKey('mois')
    let formatDate = translate[selector[this.visiteMaintenance.mois - 1]] + ' ' + this.visiteMaintenance.annee;

    this.date = formatDate;
  }
  getTranslationByKey(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get(key).subscribe(translation => {
        resolve(translation);
      });
    });
  }
  treeColapse = [];
  openElement(index) {
    debugger
    if (this.treeColapse.filter(x => x.index == index).length == 0) {
      this.treeColapse.push({
        isOpen: true,
        index: index,
        childs: []
      });
    } else {
      this.treeColapse = this.treeColapse.map(x => {
        if (x.index == index) {
          x.isOpen = !x.isOpen
        }
        return x;
      });
    }
  }
  openChild(indexElemnet, indexChild) {
    debugger
    if (this.treeColapse[indexElemnet].childs.filter(x => x.index == indexChild).length == 0) {
      this.treeColapse[indexElemnet].childs.push({
        isOpen: true,
        index: indexChild,
      });
    } else {
      // this.treeColapse[indexElemnet].childs[indexChild].isOpen = !this.treeColapse[indexElemnet].childs[indexChild].isOpen;
      this.treeColapse = this.treeColapse.map(x => {
        if (x.index == indexElemnet) {
          x.childs = x.childs.map(child => {
            if (child.index == indexChild) {
              child.isOpen = !child.isOpen;
            }
            return child;
          });
        }
        return x;
      });
    }
  }
  checkElementIsOpen(indexElemnet) {
    const element = this.treeColapse.filter(x => x.index == indexElemnet);
    return element.length == 0 ? false : element[0].isOpen;

    // return this.treeColapse[indexElemnet] == null ? false : this.treeColapse[indexElemnet].isOpen;
  }

  checkChildIsOpen(indexElemnet, indexChild) {
    if (this.treeColapse.filter(x => x.index == indexElemnet && x.childs.filter(y => y.index == indexChild).length != 0).length == 0) {
      return false;
    };
    return this.treeColapse.filter(x => x.index == indexElemnet)[0].childs.filter(y => y.index == indexChild)[0].isOpen

    // return this.treeColapse[indexElemnet].childs[indexChild].isOpen;
  }

}

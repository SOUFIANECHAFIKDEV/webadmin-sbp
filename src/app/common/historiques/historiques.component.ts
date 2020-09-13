import { Component, OnInit, Input } from '@angular/core';
import { Historique } from "app/Models/Entities/Historique";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { ActionHistorique } from "./../../Enums/ActionHistorique.Enum";

@Component({
  selector: 'common-historiques',
  templateUrl: './historiques.component.html',
  styleUrls: ['./historiques.component.scss'],
  providers: []
})
export class HistoriquesComponent implements OnInit {
  @Input('historique') historique: Historique[];
  details: any;
  labelsTranslated;

  constructor(private translate: TranslateService, public actionHistorique: ActionHistorique) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("labels").subscribe(labels => {
      this.labelsTranslated = labels;
    });

    this.serializeObjects();
    setInterval(() => {
      try {
        this.historique.sort((one, two) => {
          let x = new Date(one.date);
          let y = new Date(two.date);
          return (x.getTime() > y.getTime() ? -1 : 1);
        });
      } catch (ex) { }
    }, 1000);
  }

  showInConsole(champs) {

    this.details = champs;
  }

  isFilledObject: boolean = false;
  isUpdated = false;

  serializeObjects() {
    setInterval(() => {
      // chech if the historique is not empty
      // if (!this.isFilledObject) {
        this.isFilledObject = (this.historique != undefined);
      // }
      if (this.isFilledObject && !this.isUpdated) {
        this.historique.forEach((element) => {
          let lastVersionOfChamps = [];
          element.champs.forEach((champ) => {
            // check if the attribut is a json object by parsing the after and before
            try {
              // let a = champ.Before[0];
              // let b = champ.Before[champ.Before.length - 1];
              // let c = JSON.parse(champ.Before);
              // let d = JSON.parse(champ.Before);
              let champBeforeLength = JSON.parse(champ.Before).length;
              let champAfterLength = JSON.parse(champ.After).length;
              if (champBeforeLength == undefined || champAfterLength == undefined) {
                throw 500;
              }

              let max = champBeforeLength >= champAfterLength ? champBeforeLength : champAfterLength;
              for (let index = 0; index < max; index++) {
                let after = JSON.parse(champ.After);
                let before = JSON.parse(champ.Before);
                let stringifyAfter = "";
                for (var key in after[index]) {
                  if (after[index].hasOwnProperty(key)) {
                    if (typeof (after[index][key]) == 'object') {
                      switch (key) {
                        case 'pays':
                          stringifyAfter = stringifyAfter + `<strong>${this.getTranslate(key)}</strong> : ${after[index][key].nomEnGb} </br>`;
                          break;
                        case 'departement':
                          stringifyAfter = stringifyAfter + `<strong>${this.getTranslate(key)}</strong> : ${after[index][key].departementNom} </br>`;
                          break;
                        // case 'ville':
                        //   stringifyAfter = stringifyAfter + `<strong>${key}</strong> : ${after[index][key].villeNomReel} </br>`;
                        //   break;
                      }
                    } else {

                      stringifyAfter = stringifyAfter + `<strong>${this.getTranslate(key)} </strong> : ${this.formatBooleanValue(after[index][key])} </br>`;

                    }
                  }
                }
                let stringifyBefore = "";
                for (var key in before[index]) {
                  // let keyString = after[index][key] == before[index][key] ? '<strong style="text-decoration: underline;">' + key + '</strong>' : '<strong>' + key + '</strong>';
                  if (typeof (before[index][key]) == 'object') {
                    switch (key) {
                      case 'pays':
                        stringifyBefore = stringifyBefore + `<strong>${this.getTranslate(key)}</strong> : ${before[index][key].nomEnGb} </br>`;
                        break;
                      case 'departement':
                        stringifyBefore = stringifyBefore + `<strong>${this.getTranslate(key)}</strong> : ${before[index][key].departementNom} </br>`;
                        break;
                      // case 'ville':
                      //   stringifyBefore = stringifyBefore + `<strong>${key}</strong> : ${before[index][key].villeNomReel} </br>`;
                      //   break;
                    }
                  } else {
                    if (before[index].hasOwnProperty(key)) {
                      stringifyBefore = stringifyBefore + `<strong>${this.getTranslate(key)}</strong> : ${this.formatBooleanValue(before[index][key])} </br>`;
                    }
                  }
                }
                if (before[index] != after[index]) {

                  lastVersionOfChamps.push({ Attribute: this.getTranslate(champ.Attribute == 'Contacts' ? 'contact' : champ.Attribute) + ' ' + (index + 1) + '     ', After: stringifyAfter, Before: stringifyBefore });
                }
              }
            } catch (ex) {
              // if the attribut is not a json object 
              lastVersionOfChamps.push({ Attribute: this.getTranslate(champ.Attribute), After: champ.After, Before: champ.Before });
            }
          });
          element.champs = lastVersionOfChamps;
        });
        this.isUpdated = true;
      }
    }, 1000);
  }

  formatBooleanValue(value): string {
    if (typeof (value) == 'boolean') {
      return value ? 'oui' : 'non';
    } else {
      return value
    }
  }

  isNotEquivalent(a, b) {
    // Create arrays of property names
    var aProps = Object.getOwnPropertyNames(a);
    var bProps = Object.getOwnPropertyNames(b);

    // If number of properties is different,
    // objects are not equivalent
    if (aProps.length != bProps.length) {
      return true;
    }

    for (var i = 0; i < aProps.length; i++) {
      var propName = aProps[i];

      // If values of same property are not equal,
      // objects are not equivalent
      if (a[propName] !== b[propName]) {
        return true;
      }
    }

    // If we made it this far, objects
    // are considered equivalent
    return false;
  }

  getTranslate(name) {
    for (var i in this.labelsTranslated) {
      if (i.toLowerCase() == name.toLowerCase()) {
        return this.labelsTranslated[i];
      }
    }
    return name
  }

}

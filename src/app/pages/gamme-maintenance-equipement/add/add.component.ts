import { Component, OnInit } from '@angular/core';
import { GammeMaintenanceEquipementService } from 'app/services/gammemaintenanceequipement/gammemaintenanceequipement.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { GammeMaintenanceEquipement } from 'app/Models/Entities/GammeMaintenanceEquipement';
import { Router } from "@angular/router";
import { LibelleEquipement } from 'app/common/gamme-maintenance-equipement/sheard/interfaces/gamme-maintenance-equipement.interface';
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;
@Component({
  selector: 'app-add',
  templateUrl: './add.component.html',
  styleUrls: ['./add.component.scss']
})
export class AddComponent implements OnInit {
  form
  public processing: boolean = false;
  emitter: any = {};
  constructor(
    private fb: FormBuilder,
    private gammeMaintenanceEquipementService: GammeMaintenanceEquipementService,
    private router: Router,
    private translate: TranslateService,

  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    this.form = this.fb.group({
      nom: ["", [Validators.minLength(3), Validators.required], this.checkUniqueNom.bind(this)]
    });
  }

  checkUniqueNom(control: FormControl) {
    let promise = new Promise((resolve) => {
      this.gammeMaintenanceEquipementService.CheckUniqueNom(control.value).subscribe(
        res => {
          if (res == true) {
            resolve({ checkUniqueNom: true });
          } else {
            resolve(null);
          }
        }
      )
    });
    return promise;
  }

  get f() { return this.form.controls; }

  add() {
    debugger
    this.translate.get("errors").subscribe(text => {
      if (!this.form.valid) {
        toastr.warning(text.fillAll, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        return;
      }
      const operations = this.getOperation()
      if (operations.length == 0) {
        toastr.warning(text.perationsRequired, '', { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        return;
      }
      let values = this.form.value;
      let gammeMaintennaceEquipement: GammeMaintenanceEquipement = new GammeMaintenanceEquipement();
      gammeMaintennaceEquipement.nom = values.nom;
      gammeMaintennaceEquipement.equipement = JSON.stringify(operations);
      console.log(values)
      this.translate.get('add').subscribe(text => {
        console.log(text)
        this.gammeMaintenanceEquipementService.Add(gammeMaintennaceEquipement).subscribe(res => {
          if (res) {
            debugger
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.router.navigate(["/gammemaintenanceequipements/detail", res.id]);

          } else {
            // this.translate.get("errors").subscribe(text => {
            toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            // })
          }
        })
      })
    });
  }

  getOperation(): LibelleEquipement[] {
    return this.emitter.getOperations;
  }
}

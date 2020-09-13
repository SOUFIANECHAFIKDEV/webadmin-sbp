import { Component, OnInit } from '@angular/core';
import { GammeMaintenanceEquipement } from 'app/Models/Entities/GammeMaintenanceEquipement';
import { GammeMaintenanceEquipementService } from 'app/services/gammemaintenanceequipement/gammemaintenanceequipement.service';
import { FormBuilder, Validators, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AppSettings } from 'app/app-settings/app-settings';
import { LibelleEquipement } from 'app/common/gamme-maintenance-equipement/sheard/interfaces/gamme-maintenance-equipement.interface';
declare var toastr: any;
@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss']
})
export class UpdateComponent implements OnInit {
  id
  gammeMaintenanceEquipement: GammeMaintenanceEquipement;
  form
  equipements = [];
  public processing: boolean = false;
  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private gammeMaintenanceEquipementService: GammeMaintenanceEquipementService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.form = this.fb.group({
      nom: ["", [Validators.minLength(3), Validators.required], this.checkUniqueNom.bind(this)]
    });
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.route.params.subscribe(params => {
      this.id = params["id"];
      this.GetGammeMaintenanceEquipement(this.id);

    })
  }

  checkUniqueNom(control: FormControl) {
    let promise = new Promise((resolve) => {
      this.gammeMaintenanceEquipementService.CheckUniqueNom(control.value).subscribe(
        res => {
          if (res == true && this.form.value.nom != this.gammeMaintenanceEquipement.nom) {
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

  GetGammeMaintenanceEquipement(id) {
    this.gammeMaintenanceEquipementService.Get(id).subscribe(gammeMaintenanceEquipement => {
      this.gammeMaintenanceEquipement = gammeMaintenanceEquipement;
      this.SetData(gammeMaintenanceEquipement);

    });
  }

  /*-----------------------------------------------------------*/
  SetData(gammeMaintenanceEquipement: GammeMaintenanceEquipement) {
    this.form.controls["nom"].setValue(gammeMaintenanceEquipement.nom);
    this.equipements = JSON.parse(gammeMaintenanceEquipement.equipement);
  }
  /*-----------------------------------------------------------*/
  update() {
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

      this.translate.get("update").subscribe(text => {
        let gammeMaintennaceEquipement: GammeMaintenanceEquipement = new GammeMaintenanceEquipement();
        gammeMaintennaceEquipement.id = this.id;
        gammeMaintennaceEquipement.nom = this.form.value.nom;
        gammeMaintennaceEquipement.equipement = JSON.stringify(operations);
        this.gammeMaintenanceEquipementService.Update(this.id, gammeMaintennaceEquipement).subscribe(res => {
          if (res) {
            toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            this.router.navigate(["/gammemaintenanceequipements/detail", res.id]);
          } else {
            this.translate.get("errors").subscribe(text => {
              toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            })
          }
        })
      })
    });
  }

  emitter: any = {};
  getOperation(): LibelleEquipement[] {
    return this.emitter.getOperations;
  }

}

import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
declare var toastr: any;
@Component({
  selector: 'app-horaire-travail',
  templateUrl: './horaire-travail.component.html',
  styleUrls: ['./horaire-travail.component.scss']
})
export class HoraireTravailComponent implements OnInit {
  form: any;
    loading
  constructor(  private translate: TranslateService,
    private fb: FormBuilder,
    private parameteresService?: ParameteresService) { 

    this.form = this.fb.group({
       heureDebut: [''],
        heureFin: ['']
    })
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.GetParametrageHoraireTravail();
  }
  GetParametrageHoraireTravail(){
    this.parameteresService.Get(TypeParametrage.horaireTravail).subscribe(res => {
      const data = JSON.parse(res.contenu);
      this.form.controls['heureDebut'].setValue(data['heureDebut']);
      this.form.controls['heureFin'].setValue(data['heureFin']);
  });
  }

  update() {
    
    const heureDebut = this.form.value.heureDebut;
    const heureFin = this.form.value.heureFin;
    this.parameteresService.Update(TypeParametrage.horaireTravail, JSON.stringify({ heureDebut, heureFin })).subscribe(res => {
        this.translate.get("labels").subscribe(text => {
            toastr.success("", text.modifierSuccess, {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
        });
        this.GetParametrageHoraireTravail();
    })
}
}

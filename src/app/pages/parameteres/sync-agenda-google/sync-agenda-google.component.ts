import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
declare var toastr: any;

@Component({
  selector: 'app-sync-agenda-google',
  templateUrl: './sync-agenda-google.component.html',
  styleUrls: ['./sync-agenda-google.component.scss']
})
export class SyncAgendaGoogleComponent implements OnInit {
  form: any;
    loading
  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private parameteresService?: ParameteresService
  ) { 

    this.form = this.fb.group({
      clientId: [''],
      clientSecret: [''],
      applicationName: [''],
      calendarId: [''],
    

  })
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.GetParametrageAgendaGoogle();
  }

  GetParametrageAgendaGoogle(){
    this.parameteresService.Get(TypeParametrage.syncAgendaGoogle).subscribe(res => {
      const data = JSON.parse(res.contenu);
      this.form.controls['clientId'].setValue(data['clientId']);
      this.form.controls['clientSecret'].setValue(data['clientSecret']);
      this.form.controls['applicationName'].setValue(data['applicationName']);
      this.form.controls['calendarId'].setValue(data['calendarId']);
  });
  }

  update() {
    const clientId = this.form.value.clientId;
    const clientSecret = this.form.value.clientSecret;
    const applicationName =this.form.value.applicationName;
    const  calendarId = this.form.value.calendarId; 
    this.parameteresService.Update(TypeParametrage.syncAgendaGoogle, JSON.stringify({ clientId, clientSecret,applicationName,calendarId })).subscribe(res => {
        this.translate.get("labels").subscribe(text => {
            toastr.success("", text.modifierSuccess, {positionClass: 'toast-top-center', containerId: 'toast-top-center'});
        });
        this.GetParametrageAgendaGoogle();
    })
}
}

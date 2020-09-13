import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from "@angular/core";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { GroupesService } from "app/services/groupe/groupe.service";
import { Groupe } from "app/Models/Entities/Groupe";

@Component({
  selector: "Edit-Groupe",
  templateUrl: "./edit.component.html",
  styleUrls: ["./edit.component.scss"]
})
export class EditGroupeComponent implements OnInit, OnChanges {
  form;
  groupe: Groupe;
  @Output('OnEdit') OnEdit = new EventEmitter();
  @Input('initializeEditForm') formReset: { setData };

  constructor(
    private fb: FormBuilder,
    private groupesService: GroupesService,
    private translate: TranslateService) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.form = this.fb.group({
      Nom: ["", Validators.required, this.checkUniqueNom.bind(this)]
    });
  }

  checkUniqueNom(control: FormControl) {
    let promise = new Promise((resolve) => {
      this.groupesService.CheckUniqueNom(control.value).
        subscribe(res => {
          if (res == true && this.groupe.nom != control.value) {
            resolve({ checkUniqueNom: true });
          }
          else
            resolve(null);
        });
    });
    return promise;
  }

  ngOnChanges(): void {
    const setData = (groupe: Groupe) => {
      this.form.setValue({
        Nom: groupe.nom
      });
      this.groupe = groupe;
    }
    this.formReset.setData = setData.bind(this);
  }
  get f() { return this.form.controls; }

  update() {
    const groupe: Groupe = {
      id: this.groupe.id,
      nom: this.form.value.Nom,
      clients: this.groupe.clients
    };
    this.OnEdit.emit(groupe);
  }
}
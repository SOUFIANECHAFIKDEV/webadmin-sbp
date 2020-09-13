import { Component, OnInit, OnChanges, Input, Output, EventEmitter } from "@angular/core";
import { FormBuilder, Validators, FormControl } from "@angular/forms";
import { GroupesService } from "app/services/groupe/groupe.service";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";

@Component({
  selector: "Add-Groupe",
  templateUrl: "./add.component.html",
  styleUrls: ["./add.component.scss"]
})
export class AddGroupeComponent implements OnInit, OnChanges {
  @Input('formReset') formReset: { reset };
  @Output('OnAdd') OnAdd = new EventEmitter();
  form;
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
          if (res == true) {
            resolve({ checkUniqueNom: true });
          }
          else
            resolve(null);
        });
    });
    return promise;
  }

  ngOnChanges(): void {
    const reset = () => {
      this.form.reset();
    }
    this.formReset.reset = reset.bind(this);
  }
  get f() { return this.form.controls; }

  add() {
      this.OnAdd.emit(this.form.value.Nom);
  }
}
import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
import { LabelService } from "app/services/labels/labels.service";
declare var jQuery: any;
declare var toastr: any;
@Component({
  selector: 'label-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss']
})
export class FormComponent implements OnInit {
  modelName: string;
  btnAdd: string = '';
  btnCancel: string = "close th model";
  @Input('formConfig') formConfig;
  public labels;
  @ViewChild('labelInput') labelInput;
  @Output('OnFormSubmit') OnFormSubmit = new EventEmitter();

  constructor(private translate: TranslateService, private labelService: LabelService) { }

  ngOnInit() {
    this.translate.get("form").subscribe(form => {
      this.labels = {
        btnAdd: form.add,
        btnUpdate: form.update,
        modelNameIsAdd: form.add,
        modelNameIsUpdate: form.update,
        label: form.label,
        btnCancel: form.close
      }
    });

    setInterval(() => {
      if (this.formConfig.operation == 'add') {
        this.modelName = this.labels.modelNameIsAdd;
        this.btnAdd = this.labels.btnAdd;
      } else if (this.formConfig.operation == 'update') {
        this.modelName = this.labels.modelNameIsUpdate;
        this.btnAdd = this.labels.btnUpdate;
      }
      this.btnCancel = this.labels.btnCancel;
    }, 1000);
  }
  submit() {
    this.OnFormSubmit.emit(
      {
        id: this.formConfig.value.id,
        body: {
          label: this.labelInput.nativeElement.value
        }
      }
    );
    jQuery("#updateParamter").modal("hide");
    this.labelInput.nativeElement.value = '';
    //this.translate.get("form").subscribe(text => {
      //toastr.success(text.edit.success, '',{ positionClass: 'toast-top-center', containerId: 'toast-top-center' });
    //});
  }

}

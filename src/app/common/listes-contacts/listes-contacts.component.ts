import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Contact } from "app/Models/Entities/Contact";
declare var swal: any;
import { TranslateService } from "@ngx-translate/core";
import { FormBuilder, Validators } from '@angular/forms';
import { AppSettings } from 'app/app-settings/app-settings';
declare var jQuery: any;

@Component({
  selector: 'liste-contacts',
  templateUrl: './listes-contacts.component.html',
  styleUrls: ['./listes-contacts.component.scss']
})
export class ListesContactsComponent {

  form;
  editForm;
  indexEditContact;

  @Input('contacts') contacts: Contact[] = [];
  @Input('show') show: boolean = true;
  @Input('showColseBtn') showColseBtn: boolean;
  @Output("remove") removeContactByIndex = new EventEmitter();
  @Output('listContacts') listContacts = new EventEmitter();

  constructor(private translate: TranslateService, private fb: FormBuilder) {
    this.form = this.fb.group({
      "civilite": ['', [Validators.required]],
      "nom": ['', [Validators.required]],
      "prenom": [''],
      "fonction": [''],
      "email": ['', [Validators.pattern(AppSettings.regexEmail)]],
      "mobile": ['', [Validators.pattern(AppSettings.regexPhone)]],
      "fixe": ['', [Validators.pattern(AppSettings.regexPhone)]],
      "commentaire": ['']
    })
  }

  removeContact(contactIndex) {
    this.translate.get("list.delete").subscribe(text => {
      swal({
        title: text.title,
        text: '',
        icon: "warning",
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: "",
            closeModal: false
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: "",
            closeModal: false
          }
        }
      }).then(isConfirm => {
        if (isConfirm) {
          this.removeContactByIndex.emit({ contactIndex });
          swal(text.success, "", "success");
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }

  add() {
    if (this.form.valid) {
      this.contacts.push(this.form.value);
      this.listContacts.emit(this.contacts);
      this.form.reset();
      jQuery("#addContact").modal("hide");
    }
  }

  chargeContact(i) {
    let contact = this.contacts[i]
    this.indexEditContact = i;
    this.editForm = this.fb.group({
      "civilite": [contact.civilite, [Validators.required]],
      "nom": [contact.nom, [Validators.required]],
      "prenom": [contact.prenom],
      "fonction": [contact.fonction],
      "email": [contact.email, [Validators.pattern(AppSettings.regexEmail)]],
      "mobile": [contact.mobile, [Validators.pattern(AppSettings.regexPhone)]],
      "fixe": [contact.fixe, [Validators.pattern(AppSettings.regexPhone)]],
      "commentaire": [contact.commentaire]
    })
  }

  update() {
    if (this.editForm.valid) {
      this.contacts[this.indexEditContact] = this.editForm.value;
      this.listContacts.emit(this.contacts);
      this.editForm.reset();
      jQuery("#editContact").modal("hide");
    }
  }

  get f() { return this.form.controls; }

  get fEdit() { return this.editForm.controls; }

  modalDismiss(){
    jQuery("#addContact").modal("hide");
    jQuery("#editContact").modal("hide");
  }
}

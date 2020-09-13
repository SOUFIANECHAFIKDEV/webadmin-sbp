import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { Adresse } from 'app/Models/Entities/Adresse';
import { VilleService } from 'app/services/ville/ville.service';
import { DepartementService } from 'app/services/departement/departement.service';
import { PaysService } from 'app/services/pays/pays.service';
import { Departement } from 'app/Models/Entities/Depatement';
import { Ville } from 'app/Models/Entities/Ville';
import { Pays } from 'app/Models/Entities/Pays';
declare var jQuery: any;
declare var swal: any;

@Component({
  selector: 'list-address',
  templateUrl: './list-address.component.html',
  styleUrls: ['./list-address.component.scss']
})

export class ListAddressComponent implements OnInit {

  form;
  editForm;
  indexEditAddress;
  afficherList = false; /* Afficher la liste des département et des villes si il a dans la bdd */
  departements: Departement[] = [];
  villes: Ville[] = [];
  pays: Pays[];

  @Input('addresses') addresses: Adresse[] = [];
  @Input('show') show: boolean = true;
  @Output("remove") removeAddressByIndex = new EventEmitter();
  @Output('listContacts') listContacts = new EventEmitter();
  //afficher uniquement le formulaire
  @Input('displayJustTheForm') displayJustTheForm: boolean = false;
  @Input('InputsIsOutSide') InputsIsOutSide = false;

  @Input('addModalId') addModalId = 'addAddress'
  @Input("hideAddBtn") hideAddBtn: boolean = false;
  @Input('editModalId') editModalId = 'editAddress'
  // @Input('displayJustList') displayJustList = false;
  initialisation = {
    pays: false,
    villes: false,
    departements: false
  }
  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private villeService: VilleService,
    private departementService: DepartementService,
    private paysService: PaysService) { }

  ngOnInit() {
    this.form = this.fb.group({
      'designation': [null, [Validators.required]],
      "adresse": [null, [Validators.required]],
      "complementAdresse": [null],
      "departement": [null],
      "ville": [null, [Validators.required]],
      "codePostal": [null],
      "pays": [AppSettings.SHOW_CITY_OF_COUNTRY[0], [Validators.required]],
      "default": [null]
    })
    setTimeout(() => {
      if (this.addresses.length == 0) {
        this.form.controls['default'].setValue(true);
        //  this.form.controls['default'].disable();
      }
    }, 1000)
  }

  GetDepartements() {

    if (!this.initialisation.departements && this.departements.length == 0) {
      this.departements = [];
      this.departementService
        .GetAll(AppSettings.SHOW_CITY_OF_COUNTRY[0], 1, AppSettings.MAX_GET_DATA, "DepartementNom", "ASC")
        .subscribe(value => {
          this.departements = value.list;
          this.initialisation.departements = true;
        });
    }

  }

  SearchVille(search) {

    if (!this.initialisation.villes) {
      this.villeService
        .Search(search, 1, 100, "VilleNom", "ASC")
        .subscribe(value => {
          this.villes = value.list;
          this.initialisation.villes = true;
        });
    }

  }

  GetDepartementOfVille(ville) {

    let departements = this.departements.filter(x => x.id == parseInt(ville.idDepartement))
    if (departements.length > 0) {
      this.form.controls["departement"].setValue(departements[0].departementNom)
      if (this.indexEditAddress) this.editForm.controls["departement"].setValue(departements[0].departementNom)
    }
  }

  GetPays() {

    if (!this.initialisation.pays) {
      this.paysService
        .GetAll("", 1, AppSettings.MAX_GET_DATA, "NomFrFr", "ASC")
        .subscribe(value => {
          this.pays = value.list;
          this.initialisation.pays = true;
        });
    }
  }

  changeCodePostal(nom) {
    let villes = this.villes.filter(x => x.villeNomReel == nom);
    if (villes.length > 0) {
      this.GetDepartementOfVille(villes[0])
      this.form.controls["codePostal"].setValue(villes[0].codePostal);
      if (this.indexEditAddress) {
        this.editForm.controls["codePostal"].setValue(villes[0].codePostal);
      }
    } else {
      this.form.controls["codePostal"].setValue("");
      if (this.indexEditAddress) {
        this.editForm.controls["codePostal"].setValue("");
      }
    }
  }

  removeAddress(addressIndex) {
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
          this.removeAddressByIndex.emit({ addressIndex });
          swal(text.success, "", "success");
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }
  createId(name) {
    return '#' + name;
  }
  add() {

    if (this.form.valid) {
      let values = this.form.value;
      if (values.pays != null) {
        values.pays = this.pays.filter(x => x.id == values.pays)[0];
      }
      if (values.default == true && this.addresses.length > 0) {
        this.addresses.map(x => x.default = false);
      }
      //  else if (this.addresses.length == 0) {
      //   values.default = true;
      // }
      this.addresses.push(values);
      this.listContacts.emit(this.addresses);
      this.form.reset();
      this.form.controls['default'].setValue(false);
      this.form.controls['default'].enable();
      // jQuery("#addAddress").modal("hide");
      jQuery(this.createId(this.addModalId)).modal("hide");

      this.SearchVille("");
      this.form.controls["pays"].setValue(AppSettings.SHOW_CITY_OF_COUNTRY[0]);
    }
  }

  chargeAddress(i) {
    this.SearchVille("");
    let address = this.addresses[i]
    this.indexEditAddress = i;
    (address.default)
    this.editForm = this.fb.group({
      'designation': [address.designation, [Validators.required]],
      "adresse": [address.adresse, [Validators.required]],
      "complementAdresse": [address.complementAdresse],
      "departement": [address.departement],
      "ville": [address.ville, [Validators.required]],
      "codePostal": [address.codePostal],
      "pays": [address.pays.id, [Validators.required]],
      "default": [address.default]
    });
    this.GetPays();
  }

  update() {
    debugger
    if (this.editForm.valid) {
      let values = this.editForm.value;
      if (values.pays != null) {
        values.pays = this.pays.filter(x => x.id == values.pays)[0];
      }
      if (values.default == true) {
        this.addresses.map(x => x.default = false)
      }
      this.addresses[this.indexEditAddress] = values;

      this.listContacts.emit(this.addresses);
      this.editForm.reset();
      this.SearchVille("");
      // jQuery("#editAddress").modal("hide");
      jQuery(this.createId(this.editModalId)).modal("hide");
    }
  }

  get f() { return this.form.controls; }

  get fEdit() { return this.editForm.controls; }

  modalDismiss() {
    jQuery(this.createId(this.addModalId)).modal("hide");
    jQuery(this.createId(this.editModalId)).modal("hide");

    // jQuery("#addAddress").modal("hide");
    // jQuery("#editAddress").modal("hide");
  }

}

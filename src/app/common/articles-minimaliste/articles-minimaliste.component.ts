import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FormBuilder, Validators } from "@angular/forms";
import { AppSettings } from "app/app-settings/app-settings";
import { TranslateService } from "@ngx-translate/core";
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { PrixParDefault } from 'app/Models/prix-par-default';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { DelaiGaranties } from 'app/Enums/DelaiGaranties.Enum';
declare var toastr: any;
declare var swal: any;
@Component({
  selector: 'articles-minimaliste',
  templateUrl: './articles-minimaliste.component.html',
  styleUrls: ['./articles-minimaliste.component.scss']
})
export class ArticlesMinimalisteComponent implements OnInit, OnChanges {
  public form = null;
  @Input('data') data = null;
  @Input('load') load: { getData };
  @Input('readOnly') readOnly = false;
  retenueGarantie = 0;
  @Input('retenueGarantieValue') retenueGarantieValue: number = 0;
  @Input('delaiGarantie') delaiGarantie: DelaiGaranties = null;
  delaiGarantiesEnum: typeof DelaiGaranties = DelaiGaranties;

  constructor(private translate: TranslateService, private fb: FormBuilder, private parameteresService: ParameteresService) {

  }

  ngOnInit() {
    this.createForm();
    this.getCouteVenteFromParamerage();
    this.getRetenueParamerage();
  }

  createForm() {
    this.form = this.fb.group({
      totalHt: [
        (this.data == null ? 0 : this.data.totalHt),
        // [Validators.required]
      ],
      totalTtc: [
        (this.data == null ? 0 : this.data.total),
        // [Validators.required]
      ],
      puc: [
        (this.data == null ? 0 : this.data.puc),
        [Validators.required]
      ],
      prorata: [
        (this.data == null ? 0 : this.data.prorata),
        [Validators.required]
      ],
      tva: [
        (this.data == null ? 0 : this.data.tva),
        [Validators.required]
      ],
      nomber_heure: [
        (this.data == null ? 0 : this.data.nomberHeure),
        [Validators.required]
      ],
      cout_vente: [
        (this.data == null ? 0 : this.data.coutVente),
        [Validators.required]
      ],
      cout_materiel: [
        (this.data == null ? 0 : this.data.coutMateriel),
        [Validators.required]
      ],
      achat_materiel: [
        (this.data == null ? 0 : this.data.achatMateriel),
        [Validators.required]
      ],
      devisExel: [
        (this.data == null ? null : this.data.devisExel),
        [Validators.required]
      ]
    });

  }

  ngOnChanges() {

    this.retenueGarantie = (this.retenueGarantieValue == null || this.retenueGarantieValue == 0) ? 0 : 1;

    this.createForm();
    console.log("this.totalHt", this.totalHt)
    this.form.controls["totalHt"].setValue(this.totalHt);
    if (this.load == undefined) return;
    this.load.getData = this.returnData.bind(this);
  }


  getRetenueParamerage() {
    this.parameteresService.Get(TypeParametrage.parametrageDevis).subscribe(res => {
      let parametrage = JSON.parse(res.contenu);
      if (!this.readOnly && this.retenueGarantie == 0) {
        this.retenueGarantieValue = parametrage.retenueGarantie;
      }
      //
    });
  }

  startUpload(event: FileList) {
    const file = event.item(0)
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let pieceJoin = new PieceJoin()
      pieceJoin.name = AppSettings.guid()
      pieceJoin.type = file.name.substring(file.name.lastIndexOf('.') + 1)
      pieceJoin.orignalName = file.name
      pieceJoin.file = reader.result.toString();
      if (pieceJoin.type != 'xlsx') {
        this.translate.get("errors").subscribe(text => {

          toastr.warning(text.fichierexel, text.fichierAcceptable, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
        return
      }

      this.form.controls["devisExel"].setValue(pieceJoin);
    }
  }

  get f() { return this.form.controls; }

  returnData(callBack) {
    console.log(this.retenueGarantie)
    console.log("this.delaiGarantie", this.delaiGarantie)
    if (this.form.valid) {
      callBack({
        data: this.form.value,
        retenueGarantie: this.retenueGarantie == 1 ? this.retenueGarantieValue : null,
        totalHt: this.totalHt,
        delaiGarantie: this.delaiGarantie,
      }
      );
    } else {
      callBack(false);
    }
  }

  removeFile() {
    this.translate.get("file.delete").subscribe(text => {
      swal({
        title: "Supprimer",
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
          this.form.controls["devisExel"].setValue(null);
          swal(text.success, "", "success");
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });

  }

  downloadFile() {
    let pieceJointe = this.form.value.devisExel;
    AppSettings.downloadBase64(pieceJointe.file, pieceJointe.orignalName, pieceJointe.file.substring("data:".length, pieceJointe.file.indexOf(";base64")), pieceJointe.type)
  }

  getCouteVenteFromParamerage() {
    this.parameteresService.Get(TypeParametrage.prix).subscribe(
      (res) => {
        let PrixParDefault: PrixParDefault = JSON.parse(res.contenu);
        this.form.controls["cout_vente"].setValue(PrixParDefault.prixVente);
      });
  }
  totalHt
  TotalHt(numberHeure, cout_vente, cout_materiel) {
    const totalHt = ((numberHeure * cout_vente) + cout_materiel).toFixed(2)
    this.totalHt = totalHt
    return totalHt;
  }
  TotalTtc(numberHeure, cout_vente, cout_materiel, tva) {
    // ((parseInt(dataArticles.data.tva) / 100) + 1)
    const totalHt = ((numberHeure * cout_vente) + cout_materiel)
    console.log(totalHt)
    let ttc = ((totalHt * ((tva / 100) + 1))).toFixed(2);
    return ttc;
    // return ttc.toFixed(2);
  }

}
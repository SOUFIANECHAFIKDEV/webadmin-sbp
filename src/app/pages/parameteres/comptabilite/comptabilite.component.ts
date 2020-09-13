import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PeriodeComptableService } from 'app/services/periode-comptable/periode-comptable.service';
import { FormBuilder, Validators } from '@angular/forms';
import { AppSettings } from 'app/app-settings/app-settings';
import { PeriodeComptable } from 'app/Models/Entities/PeriodeComptable';
import { formArrayNameProvider } from '@angular/forms/src/directives/reactive_directives/form_group_name';
import { text } from '@angular/core/src/render3';
import { DureeComptable } from 'app/Enums/DureeComptable.enum';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { ThirdPartyDraggable } from '@fullcalendar/interaction';
import { PlanComptableModel, PlanComptableTvaModel } from 'app/Models/PlanComptableModel';
import { PlanComptableEnum } from 'app/Enums/PlanComptable.Enum';

declare var jQuery: any;
declare var toastr: any;
declare var swal: any;


@Component({
  selector: 'app-comptabilite',
  templateUrl: './comptabilite.component.html',
  styleUrls: ['./comptabilite.component.scss']
})
export class ComptabiliteComponent implements OnInit {

  periodes: PeriodeComptable[] = []
  formArrayNameProviderdateLang
  periodeComptable
  loading = false;
  dureeComptables: number[] = []
  isAdd = false;
  dateLang
  form;
  formPlanComptable;
  planComptableEnum: typeof PlanComptableEnum = PlanComptableEnum;
  modelName: string = "";
  ModelNameTva: string = "";
  editPlanComptable = new PlanComptableModel();
  tvaup
  codeComptableup

  formtva
  planComptableList: PlanComptableModel[] = [];
  planComptableTvaList: PlanComptableTvaModel[] = [];
  TvaList: any;

  constructor(
    private translate: TranslateService,
    private comptabiliteService: PeriodeComptableService,
    private parameteresService: ParameteresService,
    private fb: FormBuilder
  ) {
    this.formtva = this.fb.group({
      valeurtvaup: [''],
      codecomptableup: [''],
    });
  }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate.get("datePicker").subscribe(text => {
      this.dateLang = text;
    });
    this.GetPeriodeComptable();
    this.getListDureeComptable();
    this.GetParametragePlanComptable();
    //this.GetParametragePlanComptableTva();

    this.TvaList = await this.GetParametragePlanComptableTvav();
    console.log("this.planComptableTvaList", this.planComptableTvaList)
    console.log("this.TvaList", this.TvaList)

  }

  getCodeComptableById(id) {
    const plancomptable = this.planComptableList.filter(x => x.id == id)[0]
    return plancomptable != null ? plancomptable.codeComptable : null;
  }


  GetParametragePlanComptable() {
    debugger
    this.parameteresService.Get(TypeParametrage.planComptable).subscribe(res => {
      this.planComptableList = JSON.parse(res.contenu) as PlanComptableModel[];

    });
  }
  GetParametragePlanComptableTva() {
    debugger
    this.parameteresService.Get(TypeParametrage.tvaPlanComptable).subscribe(res => {
      this.planComptableTvaList = JSON.parse(res.contenu) as PlanComptableTvaModel[];

    });

  }



  GetParametragePlanComptableTvav(): Promise<PlanComptableTvaModel[]> {
    return new Promise((resolve, reject) => {
      // this.translate.get('parametrageplanComptable').subscribe(labels => {
      //   resolve(labels[name]);
      // });
      this.parameteresService.Get(TypeParametrage.tvaPlanComptable).subscribe(res => {
        this.planComptableTvaList = JSON.parse(res.contenu) as PlanComptableTvaModel[];
        resolve(JSON.parse(res.contenu) as PlanComptableTvaModel[]);
      });
    })

  }

  /**
   * Récupére les période comptables
   */
  GetPeriodeComptable() {
    this.loading = true;
    this.comptabiliteService.GetAllPeriodeComptable("", 1, AppSettings.MAX_GET_DATA, 'dateDebut', 'desc')
      .subscribe(res => {
        this.periodes = res.list
        this.loading = false;
      }, err => {
        this.loading = false;
      })
  }

  /**
   * Ajouter les périodes comptable 
   */
  ajouterPeriodeComptable() {
    this.isAdd = true;
    jQuery('#modifierPeriodeComptable').modal('show')
    this.form = this.fb.group({
      dateDebut: [null, [Validators.required]],
      periode: [null, [Validators.required]],
    })
  }

  /**
   * Modifier les périodes comptable
   */
  modifierPeriodeComptable(index) {
    this.isAdd = false;
    jQuery('#modifierPeriodeComptable').modal('show')
    this.periodeComptable = this.periodes[index]
    this.form = this.fb.group({
      dateDebut: [new Date(this.periodeComptable.dateDebut), [Validators.required]],
      periode: [this.periodeComptable.periode.toString(), [Validators.required]],
    })
  }
  /**
   * Mettre à jour période comptable
   */
  updatePeriodeComptable() {
    if (this.form.valid) {
      jQuery('#modifierPeriodeComptable').modal('hide')
      this.periodeComptable.dateDebut = AppSettings.formaterDatetime(this.form.value['dateDebut'])
      this.periodeComptable.periode = this.form.value['periode']
      this.comptabiliteService.UpdatePeriodeComptable(this.periodeComptable.id, this.periodeComptable).subscribe(res => {
        this.translate.get("form").subscribe(text => {
          toastr.success(text.edit.modifier, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
        })
      })
    } else {
      this.translate.get("errors").subscribe(text => {
        toastr.warning(text.fillAll, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }
  /**
   * Sauvgarder ajouter période comptable
   */
  addPeriodeComptable() {

    if (this.form.valid) {
      this.loading = true;
      jQuery('#modifierPeriodeComptable').modal('hide')
      this.form.value['dateDebut'] = AppSettings.formaterDatetime(this.form.value['dateDebut'])
      this.comptabiliteService.AddPeriodeComptable(this.form.value).
        subscribe(res => {
          this.loading = false;
          this.GetPeriodeComptable()
          this.translate.get("form").subscribe(text => {
            toastr.success(text.addd.success, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          })
        }, err => {
          this.loading = false;
          this.translate.get("form").subscribe(text => {
            toastr.success(text.addd.success, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          })
        })
    } else {
      this.translate.get("comptabilite").subscribe(text => {
        toastr.warning(text.confirmCloture.error, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      })
    }
  }

  /**
   * cloturé période comptable
   */
  cloturPeriode(id) {
    this.translate.get("comptabilite.confirmCloture").subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
        icon: "warning",
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: "",
            closeModal: true
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: "",
            closeModal: true
          }
        }
      }).then(isConfirm => {
        if (isConfirm) {
          this.loading = true;
          this.comptabiliteService.CloturePeriode(id).subscribe(
            res => {
              this.loading = false;
              if (res) {
                this.GetPeriodeComptable();
                this.translate.get("comptabilite").subscribe(text => {
                  toastr.success(text.cloturePeriode, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
                })
              } else {
                this.translate.get("errors").subscribe(text => {
                  toastr.warning(text.server, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
                })
              }
            },
            err => {
              this.loading = false;
              this.translate.get("errors").subscribe(text => {
                toastr.warning(text.server, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
              })
            }
          )
        }
      });
    });
  }
  /**
   * Get liste duree comptable
   */

  getListDureeComptable() {
    for (var n in DureeComptable) {
      if (typeof DureeComptable[n] === 'number') {
        this.dureeComptables.push(<any>DureeComptable[n])
      }
    }
  }

  /**
   * Update Plan Comptable
   */

  async OpenPopUpPlanComptable(idPlanComptable: PlanComptableEnum) {
    debugger

    if (idPlanComptable != undefined || idPlanComptable != null) {
      this.editPlanComptable = this.planComptableList.filter(x => x.id == idPlanComptable)[0];
      this.modelName = await this.getmodelName(this.editPlanComptable.label);
      jQuery('#modifierPlanComptable').modal('show');
      // } else {

      //   this.TvaList = this.planComptableTvaList;
      //   jQuery('#tvaForm').modal('show');
    }
  }

  getmodelName(name): Promise<string> {
    return new Promise((resolve, reject) => {
      this.translate.get('parametrageplanComptable').subscribe(labels => {
        resolve(labels[name]);
      });
    })

  }

  updatePlanComptable(contenu: string) {
    this.parameteresService.Update(TypeParametrage.planComptable, contenu)
      .subscribe(res => {
        if (typeof (this.editPlanComptable.codeComptable) == 'number') {
          this.translate.get("parametrageplanComptable").subscribe(text => {
            toastr.success(text.msgUpdate, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          })
          jQuery('#modifierPlanComptable').modal('hide');

        }
        this.editPlanComptable = new PlanComptableModel();
        //loader
        //messages
      });
  }

  UpdatePlanComptableTva(contenu: string) {
    this.parameteresService.Update(TypeParametrage.tvaPlanComptable, contenu)
      .subscribe(res => {
        if (this.currentIndex != null) {
          this.translate.get("parametrageplanComptable").subscribe(text => {
            toastr.success(text.msgUpdate, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          });
        } else {
          this.translate.get("parametrageplanComptable").subscribe(text => {
            toastr.success(text.msgAdd, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
          });
        }


        // const editPlanComptable = this.planComptableTvaList.filter(x => x.tva == this.tva)[0];
        // this.TvaList = (editPlanComptable.codeComptable);
        //loader
        //messages
      });

  }
  UpdatePlanComptable() {
    this.updatePlanComptable(this.createContenuForUpdate())

  }
  createContenuForUpdate(): string {
    const planComptableList = this.planComptableList.map(plan => {
      if (plan.id == this.editPlanComptable.id) {
        const editPlanComptable: any = this.editPlanComptable.codeComptable
        plan.codeComptable = parseInt(editPlanComptable);
      }
      return plan;
    });
    return JSON.stringify(planComptableList);
  }


  clearform() {
    this.formtva.reset();
  }

  /*
    @section code comtable tva
  */
  formTvaType: ('add' | 'edit') = null;
  currentIndex: number = null;

  saveFormTva() {
    switch (this.formTvaType) {
      case 'add':
        this.addTva();
        break;
      case 'edit':
        this.updatetva();
        break;
    }
  }

  /**
   * ajouter un nouveau code comptable d'un tva
   */
  addTva() {
    const tva = this.formtva.value.valeurtvaup;
    const codecomptable = this.formtva.value.codecomptableup;
    this.UpdatePlanComptableTva(this.createContenuForTva(tva, codecomptable));
    this.closeFormTva();
  }
  /**
   * modifier un nouveau code comptable d'un tva
   */
  updatetva() {
    debugger
    const tva = this.formtva.value.valeurtvaup;
    const codecomptable = this.formtva.value.codecomptableup;
    this.UpdatePlanComptableTva(this.createContenuForTva(tva, codecomptable));
    this.closeFormTva();
  }


  /**
   * supprimer code comptable d'une tva par son @param index
   */
  deleteTva(index) {
    debugger
    this.translate.get("parametrageplanComptable.delete").subscribe(text => {
      swal({
        title: text.title,
        text: text.document.question,
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

          this.TvaList.splice(index, 1);

          // this.editPlanComptable.codeComptable = this.TvaList;
          this.parameteresService.Update(TypeParametrage.tvaPlanComptable, JSON.stringify(this.TvaList))
            .subscribe(res => {
              if (res) {
                console.log(res)
                //   this.TvaList=JSON.parse(res);
                swal(text.success, "", "success");
                // jQuery('#tvaForm').modal('hide');
              } else {
                swal(text.error, "", "error");
              }
              //  this.editPlanComptable = new PlanComptableModel();
              //loader
              //messages
            });
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }

  /**
   * ouvrir la formulaire du code comptablle des tva
   */
  async OpenFromTva(formTvaType: ('add' | 'edit'), indexCPTva?: number) {
    debugger
    if (formTvaType == 'edit') {
      this.currentIndex = indexCPTva;
      this.ModelNameTva = await this.getmodelName('modifierTvaCodeComptable');
      this.formtva = this.fb.group({
        valeurtvaup: [this.TvaList[indexCPTva].tva, [Validators.required]],
        codecomptableup: [this.TvaList[indexCPTva].codeComptable]
      });
    } else {
      this.ModelNameTva = await this.getmodelName('addTvaCodeComptable');
      this.currentIndex = null;
      this.formtva.reset();
    }

    this.formTvaType = formTvaType;
    jQuery('#formTva').modal('show')
  }

  /**
   * fermer la formulaire du code comptablle des tva
   */
  closeFormTva() {
    this.formtva.reset();
    jQuery('#formTva').modal('hide');
  }

  createContenuForTva(tva: string, codeComptable: number) {
    //cas d'ajout,
    if (this.formTvaType == 'add') {
      this.TvaList.unshift({ tva: tva, codeComptable });
      // plan.codeComptable = this.TvaList;
    }

    //cas de modification
    if (this.formTvaType == 'edit') {
      this.TvaList[this.currentIndex] = { tva: tva, codeComptable };
      // plan.codeComptable = this.TvaList;
    }

    return JSON.stringify(this.TvaList);
  }

}

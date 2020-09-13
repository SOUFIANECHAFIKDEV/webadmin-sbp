import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder } from '@angular/forms';
import { ParameteresService } from 'app/services/parameteres/parameteres.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeParametrage } from 'app/Enums/TypeParametrage.Enum';
import { AngularEditorConfig } from '@kolkov/angular-editor';
declare var toastr: any;
@Component({
  selector: 'app-parametrage-document',
  templateUrl: './parametrage-document.component.html',
  styleUrls: ['./parametrage-document.component.scss']
})
export class ParametrageDocumentComponent implements OnInit {
  form: any;
  loading
  editorConfig: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '8rem',
    //placeholder: 'Enter text here...',
    translate: 'yes',

  }

  constructor(
    private translate: TranslateService,
    private fb: FormBuilder,
    private parameteresService?: ParameteresService) {
    this.form = this.fb.group({
      objet: [''],
      note: [''],
      conditions: [''],
      entete: [''],
      sujetmail: [''],
      contenumail: [''],
      sujetrelance: [''],
      contenurelance: [''],
      retenueGarantie: [''],
      entete_interventions: [],
      objet_interventions: [],
      sujetmail_interventions: [''],
      contenumail_interventions: [''],
      validite_facture: [''],
      objet_facture: [''],
      note_facture: [''],
      conditions_facture: [''],
      entete_facture: [''],
      sujetmail_facture: [''],
      contenumail_facture: [''],
      sujetrelance_facture: [''],
      contenurelance_facture: [''],

      //avoir
      validite_avoir: [''],
      objet_avoir: [''],
      note_avoir: [''],
      conditions_avoir: [''],
      entete_avoir: [''],

      //Bon Commande Fournisseur
      validite_boncommande: [''],
      objet_boncommande: [''],
      note_boncommande: [''],
      conditions_boncommande: [''],

      //depense
      objet_depense: [''],
      note_depense: [''],
      conditions_depense: [''],


    })
  }

  ngOnInit() {

    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.GetParametrageDocument();
  }
  GetParametrageDocument() {


    this.parameteresService.Get(TypeParametrage.parametrageDevis).subscribe(res => {

      const data = JSON.parse(res.contenu);
      //parametrage devis
      this.form.controls['objet'].setValue(data['objet']);
      this.form.controls['note'].setValue(data['note']);
      this.form.controls['conditions'].setValue(data['conditions']);
      this.form.controls['entete'].setValue(data['entete']);
      this.form.controls['sujetmail'].setValue(data['sujetmail']);
      this.form.controls['contenumail'].setValue(data['contenumail']);
      this.form.controls['sujetrelance'].setValue(data['sujetrelance']);
      this.form.controls['contenurelance'].setValue(data['contenurelance']);
      this.form.controls['retenueGarantie'].setValue(data['retenueGarantie']);
      //parametrage fiche intervention
      this.form.controls['entete_interventions'].setValue(data['entete_interventions']);
      this.form.controls['objet_interventions'].setValue(data['objet_interventions']);
      this.form.controls['sujetmail_interventions'].setValue(data['sujetmail_interventions']);
      this.form.controls['contenumail_interventions'].setValue(data['contenumail_interventions']);
      //parametrage facture
      this.form.controls['validite_facture'].setValue(data['validite_facture']);
      this.form.controls['objet_facture'].setValue(data['objet_facture']);
      this.form.controls['note_facture'].setValue(data['note_facture']);
      this.form.controls['conditions_facture'].setValue(data['conditions_facture']);
      this.form.controls['entete_facture'].setValue(data['entete_facture']);
      this.form.controls['sujetmail_facture'].setValue(data['sujetmail_facture']);
      this.form.controls['contenumail_facture'].setValue(data['contenumail_facture']);
      this.form.controls['sujetrelance_facture'].setValue(data['sujetrelance_facture']);
      this.form.controls['contenurelance_facture'].setValue(data['contenurelance_facture']);
      //parametrage avoir

      this.form.controls['validite_avoir'].setValue(data['validite_avoir']);
      this.form.controls['objet_avoir'].setValue(data['objet_avoir']);
      this.form.controls['note_avoir'].setValue(data['note_avoir']);
      this.form.controls['conditions_avoir'].setValue(data['conditions_avoir']);
      this.form.controls['entete_avoir'].setValue(data['entete_avoir']);

      //parametrage bon commandes fournisseur
      this.form.controls['validite_boncommande'].setValue(data['validite_boncommande']);
      this.form.controls['objet_boncommande'].setValue(data['objet_boncommande']);
      this.form.controls['note_boncommande'].setValue(data['note_boncommande']);
      this.form.controls['conditions_boncommande'].setValue(data['conditions_boncommande']);

      //parametrage depense
      this.form.controls['objet_depense'].setValue(data['objet_depense']);
      this.form.controls['note_depense'].setValue(data['note_depense']);
      this.form.controls['conditions_depense'].setValue(data['conditions_depense']);


    });
  }

  update() {

    const objet = this.form.value.objet;
    const note = this.form.value.note;
    const conditions = this.form.value.conditions;
    const entete = this.form.value.entete;
    const sujetmail = this.form.value.sujetmail;
    const contenumail = this.form.value.contenumail;
    const sujetrelance = this.form.value.sujetrelance;
    const contenurelance = this.form.value.contenurelance;
    const retenueGarantie = this.form.value.retenueGarantie;
    //parametrage fiche intervention 
    const entete_interventions = this.form.value.entete_interventions;
    const objet_interventions = this.form.value.objet_interventions;
    const sujetmail_interventions = this.form.value.sujetmail_interventions;
    const contenumail_interventions = this.form.value.contenumail_interventions;
    //parametrage facture
    const validite_facture = this.form.value.validite_facture;
    const objet_facture = this.form.value.objet_facture;
    const note_facture = this.form.value.note_facture;
    const conditions_facture = this.form.value.conditions_facture;
    const entete_facture = this.form.value.entete_facture;
    const sujetmail_facture = this.form.value.sujetmail_facture;
    const contenumail_facture = this.form.value.contenumail_facture;
    const sujetrelance_facture = this.form.value.sujetrelance_facture;
    const contenurelance_facture = this.form.value.contenurelance_facture;
    //parametrage avoir
    const validite_avoir = this.form.value.validite_avoir;
    const objet_avoir = this.form.value.objet_avoir;
    const note_avoir = this.form.value.note_avoir;
    const conditions_avoir = this.form.value.conditions_avoir;
    const entete_avoir = this.form.value.entete_avoir;

    //parametrage bon commande fournisseur
    const validite_boncommande = this.form.value.validite_boncommande;
    const objet_boncommande = this.form.value.objet_boncommande;
    const note_boncommande = this.form.value.note_boncommande;
    const conditions_boncommande = this.form.value.conditions_boncommande;
    // parametrage depense
    const objet_depense = this.form.value.objet_depense;
    const note_depense = this.form.value.note_depense;
    const conditions_depense = this.form.value.conditions_depense;


    this.parameteresService.Update(TypeParametrage.parametrageDevis, JSON.stringify({
      objet, note, conditions, entete, sujetmail, contenumail, sujetrelance,
      contenurelance, retenueGarantie, entete_interventions, objet_interventions, sujetmail_interventions, contenumail_interventions, validite_facture, objet_facture,
      note_facture, conditions_facture, entete_facture, sujetmail_facture, contenumail_facture, sujetrelance_facture, contenurelance_facture,
      validite_avoir, objet_avoir, note_avoir, conditions_avoir, entete_avoir, validite_boncommande, objet_boncommande, note_boncommande, conditions_boncommande,
      objet_depense, note_depense, conditions_depense
    })).subscribe(res => {
      this.translate.get("labels").subscribe(text => {
        toastr.success("", text.modifierSuccess, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
      this.GetParametrageDocument();
    })
  }

}

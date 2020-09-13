import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { RecapitulatifFinancierModel, PrevisionnelElementsModel, FacturationTresorieModel } from 'app/Models/RecapitulatifFinancierModel';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypeRecapitulatifFinancier, TypePrevisionnel, TypeFactureTresorie } from 'app/Enums/RecapitulatifFinancier.Enum';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'app-recaptulatif-financier',
  templateUrl: './recaptulatif-financier.component.html',
  styleUrls: ['./recaptulatif-financier.component.scss']
})
export class RecaptulatifFinancierComponent implements OnInit, OnChanges {
  @Input('recapitulatifFinancierData') recapitulatifFinancierData: RecapitulatifFinancierModel = null;

  response: RecapitulatifFinancierModel;
  previsionnelrecapitulatifFinancier: PrevisionnelElementsModel[] = [];
  facturation_tresorie: FacturationTresorieModel[] = [];
  tresorerieChantier: number;
  typeRecapitulatifFinancier: typeof TypeRecapitulatifFinancier = TypeRecapitulatifFinancier;
  /////////////////////////////////////
  pieChartOptions: ChartOptions = {
    responsive: true,
    legend: {
      position: 'top',
    },
    plugins: {
      datalabels: {
        formatter: (value, ctx) => {
          const label = ctx.chart.data.labels[ctx.dataIndex];
          return label;
        },
      },
    }
  };

  pieChartType: ChartType = 'pie';
  pieChartLegend = false;
  pieChartPlugins = [/*pluginDataLabels*/];
  pieChartColors = [
    {
      backgroundColor: ['#81ecec', 'rgb(234, 153, 153)', '#a29bfe'],
    },
  ];

  constructor(
    private chantierService: ChantierService,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

  }
  total_devis;
  depensee_Aprevoir;
  marge_Previsionnel;
  caFacture;
  depenseeEngagees;
  margeReele;
  pieChartData = {
    // pieChartData: []
    total_devis: [],
    depensee_Aprevoir: [],
    marge_Previsionnel: [],
    caFacture: [],
    depenseeEngagees: [],
    margeReele: [],
  };
  pieChartLabels = {
    // pieChartData: []
    total_devis: [],
    depensee_Aprevoir: [],
    marge_Previsionnel: [],
    caFacture: [],
    depenseeEngagees: [],
    margeReele: [],
  }
  async ngOnChanges() {
    debugger
    if (this.recapitulatifFinancierData != null) {
      this.previsionnelrecapitulatifFinancier = this.recapitulatifFinancierData.previsionnel;
      this.facturation_tresorie = this.recapitulatifFinancierData.facturation_tresorie;
      this.tresorerieChantier = this.recapitulatifFinancierData.tresorerieChantier;
      this.response = this.recapitulatifFinancierData;

      // this.pieChartData
      const labelsTransaltion = await this.labelsTransaltion();

      // total_devis
      this.total_devis = this.recapitulatifFinancierData.previsionnel.filter(x => x.typeElements == TypePrevisionnel.total_devis)[0];
      this.pieChartData.total_devis = this.total_devis.elements.map(x => x.sum);
      this.pieChartLabels.total_devis.push(labelsTransaltion.vente_materiel);
      this.pieChartLabels.total_devis.push(labelsTransaltion.vente_main_oveure);

      // depensee_Aprevoir
      this.depensee_Aprevoir = this.recapitulatifFinancierData.previsionnel.filter(x => x.typeElements == TypePrevisionnel.depensee_Aprevoir)[0];
      this.pieChartData.depensee_Aprevoir = this.depensee_Aprevoir.elements.map(x => x.sum);
      this.pieChartLabels.depensee_Aprevoir.push(labelsTransaltion.achat_materiel);
      this.pieChartLabels.depensee_Aprevoir.push(labelsTransaltion.achat_main_oveure);
      this.pieChartLabels.depensee_Aprevoir.push(labelsTransaltion.sous_traitance);

      // marge_Previsionnel
      this.marge_Previsionnel = this.recapitulatifFinancierData.previsionnel.filter(x => x.typeElements == TypePrevisionnel.marge_Previsionnel)[0];
      this.pieChartData.marge_Previsionnel = this.marge_Previsionnel.elements.map(x => x.sum);
      this.pieChartLabels.marge_Previsionnel.push(labelsTransaltion.retenueGarantier);
      this.pieChartLabels.marge_Previsionnel.push(labelsTransaltion.margeMateriel);
      this.pieChartLabels.marge_Previsionnel.push(labelsTransaltion.margeMainOeuvre);

      //caFacture
      this.caFacture = this.recapitulatifFinancierData.facturation_tresorie.filter(x => x.typeElements == TypeFactureTresorie.caFacture)[0];
      this.pieChartData.caFacture = this.caFacture.elements.map(x => x.sum);
      this.pieChartLabels.caFacture.push(labelsTransaltion.payes);
      this.pieChartLabels.caFacture.push(labelsTransaltion.enAttentepaiement);

      // depenseeEngagees
      this.depenseeEngagees = this.recapitulatifFinancierData.facturation_tresorie.filter(x => x.typeElements == TypeFactureTresorie.depenseeEngagees)[0];
      console.log('this.depenseeEngagees',this.depenseeEngagees);
      this.pieChartData.depenseeEngagees = this.depenseeEngagees.elements.map(x => x.sum);
      this.pieChartLabels.depenseeEngagees.push(labelsTransaltion.achatsMateriels);
      this.pieChartLabels.depenseeEngagees.push(labelsTransaltion.interventions);
      this.pieChartLabels.depenseeEngagees.push(labelsTransaltion.sousTraitance);

      // margeReele
      this.margeReele = this.recapitulatifFinancierData.facturation_tresorie.filter(x => x.typeElements == TypeFactureTresorie.margeReele)[0];
      this.pieChartData.margeReele = this.margeReele.elements.map(x => x.sum);
      this.pieChartLabels.margeReele.push(labelsTransaltion.retenueGarantier);
      this.pieChartLabels.margeReele.push(labelsTransaltion.margeMateriel);
      this.pieChartLabels.margeReele.push(labelsTransaltion.margeMainOeuvre);
    }
  }



  labelsTransaltion(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get("labels").subscribe(labels => {
        resolve(labels);
      });
    });
  }

}

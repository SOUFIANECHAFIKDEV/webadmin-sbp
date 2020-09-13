import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { FacturationTresorieModel } from 'app/Models/RecapitulatifFinancierModel';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { TypePrevisionnel, Total_devis, TypeFactureTresorie, DepenseAprevoir, CaFacture, DepenseEngagees, MargePrevisionnel, MargeReelle, DepenseSousTraitent, DepenseAchat, TypeRecapitulatifFinancier, InterventionsousElement } from 'app/Enums/RecapitulatifFinancier.Enum';
import { monkeyPatchChartJsTooltip, monkeyPatchChartJsLegend, Label } from 'ng2-charts';
import { ChartOptions, ChartType } from 'chart.js';

@Component({
  selector: 'details-recaptulatif-financier',
  templateUrl: './details-recaptulatif-financier.component.html',
  styleUrls: ['./details-recaptulatif-financier.component.scss']
})
export class DetailsRecaptulatifFinancierComponent implements OnInit, OnChanges {
  @Input('data') data: FacturationTresorieModel;
  @Input('TypeRecapitulatifFinancier') typeRecapitulatifFinancier: TypeRecapitulatifFinancier = TypeRecapitulatifFinancier.previsionnel;
  labels: any;
  typeRecapitulatifFinancierEnum: typeof TypeRecapitulatifFinancier = TypeRecapitulatifFinancier
  typePrevisionnel: typeof TypePrevisionnel = TypePrevisionnel;
  depenseAprevoir: typeof DepenseAprevoir = DepenseAprevoir;
  typeFactureTresorie: typeof TypeFactureTresorie = TypeFactureTresorie;
  total_devis: typeof Total_devis = Total_devis;
  margePrevisionnel: typeof MargePrevisionnel = MargePrevisionnel;
  margeReelle : typeof MargeReelle = MargeReelle;
  depenseEngagees : typeof DepenseEngagees = DepenseEngagees;
  caFacture: typeof CaFacture = CaFacture
  
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
  pieChartLabels: Label[] = [];
  pieChartData: number[] = [/*300, 500, 100*/];
  pieChartType: ChartType = 'pie';
  pieChartLegend = false;
  pieChartPlugins = [/*pluginDataLabels*/];
  pieChartColors = [
    {
      backgroundColor: ['#81ecec', 'rgb(234, 153, 153)', '#a29bfe'],
    },
  ];

  colors = {
    total_devis: {
      main: "#3498db",
      superior: '#9fc5f8',
      inferior: '#f9cb9c'
    },
    depensee_Aprevoir: {
      main: "#e06666",
      superior: '#ea9999',
      inferior: '#f9cb9c'
    },
    marge_Previsionnel: {
      main: "#93c47d",
      superior: '#b6d7a8',
      inferior: '#f9cb9c'
    },
    caFacture: {
      main: "#3498db",
      superior: '#9fc5f8',
      inferior: '#f9cb9c'
    },
    depenseeEngagees: {
      main: "#e06666",
      superior: '#ea9999',
      inferior: '#f9cb9c'
    },
    margeReele: {
      main: "#93c47d",
      superior: '#b6d7a8',
      inferior: '#f9cb9c'
    }
  }

  constructor(private translate: TranslateService) {
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();
  }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
  }

  getLabels(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.translate.get("labels").subscribe(labels => {
        resolve(labels);
      });
    });
  }

  async ngOnChanges() {
    if (this.labels == undefined) {
      this.labels = await this.getLabels();
    }
    // const values = ;
    this.pieChartData = this.data.elements.map(x => x.sum);

    this.data.elements.forEach(element => {
      const label = this.getLabelByType(this.data.typeElements, element.type);
      this.pieChartLabels.push([label]);
    });

    // this.pieChartData = [0, 0];
    // console.log(this.pieChartData);
    // 
    // console.log(this.data.elements.map(x => x.sum))
  }

  getColorByTypeAndSum(sum: number, ...params): string {
    const data = this.searchByType(params);
    if (data.colors == undefined) {
      return data.mainColor;
    } else {
      return sum >= 0 ? data.colors.positive : data.colors.negative;
    }
  }

  getLabelByType(...params): string {
    const data = this.searchByType(params);
    return this.labels == null ? "" : this.labels[data.label];
  }

  searchByType(params) {
    var data: any = Object.assign(this.constData.filter(x => x.type == this.typeRecapitulatifFinancier)[0]);
    params.forEach((type) => {
      data = data.element.filter(x => x.type == type)[0];
    });
    return data;
  }

  getIcon(...params) {
    var data: any = Object.assign(this.constData.filter(x => x.type == this.typeRecapitulatifFinancier)[0]);
    params.forEach((type) => {
      data = data.element.filter(x => x.type == type)[0];
    });
    return data.icon == undefined ? '' : data.icon;
  }

  getSectionMeduimCardPadding(element, sousElement) {
    return this.typeRecapitulatifFinancier == TypeRecapitulatifFinancier.previsionnel
      && element == TypePrevisionnel.depensee_Aprevoir
      && (sousElement == DepenseAprevoir.achat_main_oveure
        || sousElement == DepenseAprevoir.achat_materiel
        || sousElement == DepenseAprevoir.sous_traitance) ? '26px 0px' : '10px 0px';
  }

  getSectionMeduimCardMargin(element, sousElement) {
    return this.typeRecapitulatifFinancier == TypeRecapitulatifFinancier.previsionnel
      && element == TypePrevisionnel.depensee_Aprevoir
      && (sousElement == DepenseAprevoir.achat_main_oveure
        || sousElement == DepenseAprevoir.sous_traitance) ? '34px 0px 20px 10px' : '0px 0px 20px 10px';
  }

  getChartLegend(type) {
    var data: any = Object.assign(this.constData.filter(x => x.type == this.typeRecapitulatifFinancier)[0]);
    var elements = data.element.filter(x => x.type == type)[0].element;
    let legends: string = "";

    elements.forEach(element => {
      const label = this.getLabelByType(type, element.type);
      const color = this.getColorByTypeAndSum(element.sum, type, element.type);
      legends += `<div class="chart-legend-color" style="background-color:${color}">${color}</div>
                  <p class="chart-legend-label">${label}</p>`
    });
    return legends;
  }

  constData = [
    {
      type: TypeRecapitulatifFinancier.previsionnel,
      label: "previsionnel",
      mainColor: "",
      element: [
        {
          type: TypePrevisionnel.total_devis,
          label: "total_devis",
          mainColor: this.colors.total_devis.main,
          icon: "fa-sign-in",
          element: [
            {
              type: Total_devis.vente_materiel,
              label: "vente_materiel",
              mainColor: this.colors.total_devis.superior,
              element: []
            },
            {
              type: Total_devis.vente_main_oveure,
              label: "vente_main_oveure",
              mainColor: this.colors.total_devis.superior,
              element: []
            }
          ]
        },
        {
          type: TypePrevisionnel.depensee_Aprevoir,
          label: "depensee_Aprevoir",
          icon: "fa-sign-out",
          mainColor: this.colors.depensee_Aprevoir.main,
          element: [
            {
              type: DepenseAprevoir.achat_main_oveure,
              label: "achat_main_oveure",
              mainColor: this.colors.depensee_Aprevoir.superior,
              element: []
            },
            {
              type: DepenseAprevoir.achat_materiel,
              label: "achat_materiel",
              mainColor: this.colors.depensee_Aprevoir.superior,
              element: []
            },
            {
              type: DepenseAprevoir.sous_traitance,
              label: "sous_traitance",
              mainColor: this.colors.depensee_Aprevoir.superior,
              element: []
            }
          ]
        },
        {
          type: TypePrevisionnel.marge_Previsionnel,
          label: "marge_Previsionnel",
          icon: "fa-flag-checkered",
          colors: {
            positive: this.colors.marge_Previsionnel.main,
            negative: this.colors.marge_Previsionnel.inferior,
          },
          element: [
            {
              type: MargePrevisionnel.margeMainOeuvre,
              label: "margeMainOeuvre",
              colors: {
                positive: this.colors.marge_Previsionnel.superior,
                negative: this.colors.marge_Previsionnel.inferior,
              },
              element: []
            },
            {
              type: MargePrevisionnel.margeMateriel,
              label: "margeMateriel",
              colors: {
                positive: this.colors.marge_Previsionnel.superior,
                negative: this.colors.marge_Previsionnel.inferior,
              },
              element: []
            },
            {
              type: MargePrevisionnel.retenueGarantier,
              label: "retenueGarantier",
              colors: {
                positive: this.colors.marge_Previsionnel.superior,
                negative: this.colors.marge_Previsionnel.inferior,
              },
              element: []
            }
          ]
        }
      ]
    },
    {
      type: TypeRecapitulatifFinancier.facturation_tresorie,
      label: "facturation_tresorie",
      mainColor: "",
      element: [
        {
          type: TypeFactureTresorie.caFacture,
          label: "caFacture",
          mainColor: this.colors.caFacture.main,
          icon: "fa-sign-in",
          element: [
            {
              type: CaFacture.payes,
              label: "EnCaisse",
              mainColor: this.colors.caFacture.superior,
              element: []
            },
            {
              type: CaFacture.enAttentepaiement,
              label: "enAttentepaiement",
              mainColor: this.colors.caFacture.superior,
              element: []
            }
          ]
        },
        {
          type: TypeFactureTresorie.depenseeEngagees,
          label: "depenseeEngagees",
          icon: "fa-sign-out",
          mainColor: this.colors.depenseeEngagees.main,
          element: [
            {
              type: DepenseEngagees.achatsMateriels,
              label: "achatsMateriels",
              mainColor: this.colors.depenseeEngagees.superior,
              element: [
                {
                  type: DepenseAchat.enAttentepaiement,
                  label: "enAttentepaiement",
                  mainColor: "",
                },
                {
                  type: DepenseAchat.payes,
                  label: "payes",
                  mainColor: "",
                }
              ]
            },
            {
              type: DepenseEngagees.interventions,
              label: "interventions",
              mainColor: this.colors.depenseeEngagees.superior,
              element: [
                {
                  type: InterventionsousElement.deplacement,
                  label: "nbDeplacement",
                  mainColor: ""
                },
                {
                  type: InterventionsousElement.panier,
                  label: "nbPanier",
                  mainColor: ""
                }
              ]
            },
            {
              type: DepenseEngagees.sousTraitance,
              label: "sousTraitance",
              mainColor: this.colors.depenseeEngagees.superior,
              element: [
                {
                  type: DepenseSousTraitent.enAttentepaiement,
                  label: "enAttentepaiement",
                  mainColor: ""
                },
                {
                  type: DepenseSousTraitent.payes,
                  label: "payes",
                  mainColor: ""
                }
              ]
            }
          ]
        },
        {
          type: TypeFactureTresorie.margeReele,
          label: "margeReele",
          icon: "fa-flag-checkered",
          colors: {
            positive: this.colors.margeReele.main,
            negative: this.colors.margeReele.inferior,
          },
          element: [
            {
              type: MargeReelle.margeMainOeuvre,
              label: "margeMainOeuvre",
              colors: {
                positive: this.colors.margeReele.superior,
                negative: this.colors.margeReele.inferior,
              },
              element: []
            },
            {
              type: MargeReelle.margeMateriel,
              label: "margeMateriel",
              colors: {
                positive: this.colors.margeReele.superior,
                negative: this.colors.margeReele.inferior,
              },
              element: []
            },
            {
              type: MargeReelle.retenueGarantier,
              label: "retenueGarantier",
              mainColor: this.colors.margeReele.superior,
              element: []
            }
          ]
        }
      ]
    }
  ];


}

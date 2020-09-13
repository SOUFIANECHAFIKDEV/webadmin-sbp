import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Devis } from 'app/Models/Entities/Devis';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { Facture } from 'app/Models/Entities/Facture';


@Component({
    selector: 'app-facture-situtaion',
    templateUrl: './facture-situation.component.html',
    styleUrls: ['./facture-situation.component.scss'],
    providers: []
})
export class FactureSitutaion implements OnInit, OnChanges {
    @Input('devis') devisInfos: Devis;
    // acomptes: Acompte[] = [];
    factureTableColumns: any[];
    statutFacture: typeof StatutFacture = StatutFacture;
    typeFacture: typeof TypeFacture = TypeFacture;
    showBtnAdd: boolean = true;
    resteAPayer: number = 0;
    constructor(
        private router: Router,
        private translate: TranslateService,
        private route: ActivatedRoute) { }

    ngOnInit() {
        this.translate.get('labels').subscribe(labels => {
            this.factureTableColumns = [
                labels.reference,
                labels.statut,
                labels.dateCreation,
                labels.dateEcheance,
                labels.pourcentage,
                labels.totalTTC,
                labels.actions,
            ];
        });
    }

    ngOnChanges() {
    
        const condition = this.devisInfos == undefined ? false : (this.devisInfos.facture == undefined ? false : true);
        console.log(this.devisInfos);
        if (condition) {

            const condi = (factures: Facture[]): boolean => {
                let showOrNot = true;
                factures.forEach(facture => {
                    if (facture.status == this.statutFacture.Cloture) {
                        showOrNot = false;
                    } else if (facture.typeFacture == this.typeFacture.Generale) {
                        showOrNot = false;
                    }
                });
                return showOrNot;
            };
            this.showBtnAdd = condi(this.devisInfos.facture);

            this.devisInfos.facture = this.devisInfos.facture.map((facture, index) => {
                if (facture.typeFacture == this.typeFacture.Situation) {
                    const situations = JSON.parse(this.devisInfos.situation) as { idFacture: number, pourcentage: number, resteAPayer: number }[];
                    const situationFActureIndex: number = situations.findIndex(X => X.idFacture == facture.id);
                    const { pourcentage, resteAPayer } = situations[situationFActureIndex];
                    facture.pourcentage = pourcentage;
                    facture.restePayer = resteAPayer;
                    const length = this.devisInfos.facture.length - 1;
                    if (index == length) {
                        this.resteAPayer = resteAPayer;
                    }
                }
                return facture;
            });
        }

    }

    navigateTo() {
    
        this.route.params.subscribe(params => {
            let url = params['idChantier'] != null ?
                `/chantiers/${params['idChantier']}/documents/devis/${params['id']}/factureSituation`
                : `devis/factureSituation/${this.devisInfos.id}`;
            this.router.navigate([url]);
        });
    }

    HasNoBills(): boolean {
        const condition = this.devisInfos == undefined ? false : (this.devisInfos.facture == undefined ? false : true);
        if (condition) {
            return this.devisInfos.facture.filter(x => x.typeFacture == this.typeFacture.Situation).length == 0;
        }
    }
}
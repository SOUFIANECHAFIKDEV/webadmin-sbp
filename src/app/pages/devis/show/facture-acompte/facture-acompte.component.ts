import { Component, Input, OnInit, OnChanges } from '@angular/core';
import { Devis } from 'app/Models/Entities/Devis';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { StatutFacture } from 'app/Enums/StatutFacture.Enum';
import { TypeFacture } from 'app/Enums/TypeFacture.enum';
import { FactureService } from 'app/services/facture/facture.service';
import { Facture } from 'app/Models/Entities/Facture';
declare var swal: any;
declare var toastr: any;
@Component({
    selector: 'app-facture-acompte',
    templateUrl: './facture-acompte.component.html',
    styleUrls: ['./facture-acompte.component.scss'],
    providers: []
})
export class FactureAcompte implements OnInit, OnChanges {
    @Input('devis') devisInfos: Devis;
    factureTableColumns: any[];
    statutFacture: typeof StatutFacture = StatutFacture;
    typeFacture: typeof TypeFacture = TypeFacture;
    showBtnAdd: boolean = true;
    resteAPayer: number = 0;
    constructor(
        private router: Router,
        private translate: TranslateService,
        private factureService: FactureService,
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
        if (condition) {
            const condi = (factures: Facture[]): boolean => {
                let showOrNot = true;
                factures.forEach(facture => {
                    if (facture.typeFacture == this.typeFacture.Situation) {
                        if (facture.status != this.statutFacture.Brouillon && facture.status != this.statutFacture.Annule) {
                            showOrNot = false;
                        }
                    }
                    else  if (facture.typeFacture == this.typeFacture.Acompte) {
                        if (facture.status == this.statutFacture.Cloture) {
                            showOrNot = false;
                        }
                    } 
                    else if (facture.typeFacture == this.typeFacture.Generale) {
                        showOrNot = false;
                    }
                });
                return showOrNot;
            };

            this.showBtnAdd = condi(this.devisInfos.facture);
            this.devisInfos.facture = this.devisInfos.facture.map((facture, index) => {
                if (facture.typeFacture == this.typeFacture.Acompte) {
                    const acomptes = JSON.parse(this.devisInfos.acomptes) as { idFacture: number, pourcentage: number, resteAPayer: number }[];
                    const acompteFActureIndex: number = acomptes.findIndex(X => X.idFacture == facture.id);
                    const { pourcentage, resteAPayer } = acomptes[acompteFActureIndex];
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
                `/chantiers/${params['idChantier']}/documents/devis/${params['id']}/factureAcompte`
                : `devis/factureAcompte/${this.devisInfos.id}`;
            this.router.navigate([url]);
        });
    }

    HasNoBills(): boolean {
        const condition = this.devisInfos == undefined ? false : (this.devisInfos.facture == undefined ? false : true);
        if (condition) {
            return this.devisInfos.facture.filter(x => x.typeFacture == this.typeFacture.Acompte).length == 0;
        }
    }
}
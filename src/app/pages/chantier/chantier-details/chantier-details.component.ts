import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Historique } from 'app/Models/Entities/Historique';
import { AppSettings } from 'app/app-settings/app-settings';
import { TranslateService } from '@ngx-translate/core';
import { Chantier } from 'app/Models/Entities/Chantier';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { IFormType } from 'app/pages/Produits/lots/lots-form/IFormType.enum';
import { StatutChantier } from 'app/Enums/StatutChantier.Enum';
import { ChantierChangeStatusResponseEnum } from 'app/Enums/ChantierChangeStatusResponse.Enum';
import { ChantierChangeStatusResponse, NbDocumentsChantieModel } from 'app/Models/ChantierChangeStatusResponse';
import { RecapitulatifFinancierModel } from 'app/Models/RecapitulatifFinancierModel';
import { RetenueGarantieModel } from 'app/Models/RetenueGarantieModel';
import { StatutRetenueGarantie } from 'app/Enums/DelaiGaranties.Enum';

declare var jQuery: any;
declare var swal: any;
declare var toastr: any;
@Component({
    selector: 'app-chantier-details',
    templateUrl: './chantier-details.component.html',
    styleUrls: ['./chantier-details.component.scss']
})
export class ShowComponent implements OnInit {

    chantier: Chantier;
    historique: Historique[] = [];
    formType: typeof IFormType = IFormType;
    id: number;
    statutChantier: typeof StatutChantier = StatutChantier;
    statuts: { id: number, label: string, color: string }[];
    processing: boolean = false;
    recapitulatifFinancierData: RecapitulatifFinancierModel = null;
    statutsRetenueGarantie: { id: number, label: string, color: string }[];
    constructor(
        private chantierService: ChantierService,
        private route: ActivatedRoute,
        private translate: TranslateService) { }

    ngOnInit() {
        this.statutChantier.EnEtude
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);

        this.refresh();
        this.translate.get("statuts").subscribe((statuts: { id: number, label: string, color: string }[]) => {
            this.statuts = statuts;
        });
        this.translate.get("statutsRetenue").subscribe((statuts: { id: number, label: string, color: string }[]) => {
            this.statutsRetenueGarantie = statuts;
        });
    }

    refresh(event?: any) {
        this.route.params.subscribe(async params => {
            this.processing = true;
            this.id = params["id"];
            this.chantier = await this.getChantier(params["id"]);
            this.historique = JSON.parse(this.chantier.historique);
            this.processing = false;
        });
    }

    getChantier(id: number): Promise<Chantier> {
        return new Promise((resolve, reject) => {
            this.chantierService.Get(id).subscribe(chantier => {
                resolve(chantier);
            }, err => {
                reject(err);
            });
        });
    }
    public formConfig = {
        type: null,
        defaultData: null
    }

    openEditForm() {
        this.setformConfig(this.chantier, this.formType.update);
        jQuery("#Model").modal("show");
    }

    setformConfig(defaultData, type) {

        this.formConfig.defaultData = defaultData;
        this.formConfig.type = type;
    }

    update(chantier: Chantier) {

        this.chantierService.Update(chantier.id, chantier).subscribe(res => {
            this.translate.get("update").subscribe(async text => {
                //this.chantier = await this.getChantier(this.id);
                this.chantier = res
                this.historique = JSON.parse(this.chantier.historique);
                jQuery("#Model").modal("hide");
                toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            });
        }, err => {
            this.translate.get("update").subscribe(text => {
                toastr.danger(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            });
        });
    }
    getLabelleByStatut(statut): string {
        if (statut == undefined) return;
        let statuts = this.statuts.filter(S => S.id == statut)[0];
        return statuts == undefined ? "" : statuts.label;
    }

    /** changer le statut du chantier  */
    changeStatutChantier(changeStatut: StatutChantier) {
        debugger
        this.translate.get(this.getTransalteLocationRequest(changeStatut)).subscribe(text => {
            swal({
                title: `${text.title} " ${this.chantier.nom} "`,
                text: text.question,
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
                    this.chantierService.changeStatut({
                        idChantier: this.chantier.id, statutChantier: changeStatut
                    }).subscribe(async (res: ChantierChangeStatusResponse) => {

                        if (res.result == ChantierChangeStatusResponseEnum.changedSuccessfully) {
                            swal(text.success, "", "success");
                            this.chantier = res.chantier
                            this.historique = JSON.parse(this.chantier.historique);
                        }
                        if (res.result == ChantierChangeStatusResponseEnum.hasBillsNotPaid) {
                            swal(text.hasBillsNotPaid, "", "error");
                        }

                        if (res.result == ChantierChangeStatusResponseEnum.serverError) {
                            swal(text.error, "", "error");
                        }
                    }, err => {
                        swal(text.error, "", "error");
                    });
                } else {
                    swal(text.cancel, "", "error");
                }
            });
        });
    }

    /**
     * @summary fonction générique s'utiliser dans la fonction du changement du statut de retenue de garantie 
     * @todo déterminer la requête pour récupérer la traduction à partirdu ficher json de traduction
     * @param statut le statut du chantier qui nous voulons récupérer leur traduction
     */
    getTransalteLocationRequest(statut: StatutChantier): string {
        (statut)
        let StatusLabel: string = this.statutChantier[statut].toLowerCase();
        (StatusLabel)
        return `changeStatut.${StatusLabel}`;
    }
    nbDocuments: NbDocumentsChantieModel = new NbDocumentsChantieModel();
    getNbDocuments() {
        // this.processing = true;
        this.chantierService.GetNbDocuments(this.id).subscribe((nbDocuments: NbDocumentsChantieModel) => {
            this.nbDocuments = nbDocuments;
        },
            (err) => console.log(err));
    }

    GetRecapitulatifFinancier() {
        debugger
        this.processing = true;
        this.chantierService.GetRecapitulatifFinancier(this.chantier.id).subscribe(res => {
            this.recapitulatifFinancierData = res;

        }, (err) => this.translate.get('errors').subscribe(text => {
            toastr.warning(text.serveur, '', {
                positionClass: 'toast-top-center',
                containerId: 'toast-top-center',
            });
        })
            , () => { this.processing = false; }
        );
    }
    statutRetenueGarantie: typeof StatutRetenueGarantie = StatutRetenueGarantie;

    listRetenueGaranties: RetenueGarantieModel[] = [];
    getRetenueGarantie() {
        this.processing = true;
        this.chantierService.GetRetenieGarantie(this.chantier.id).subscribe(res => {
            this.listRetenueGaranties = res;
        }, (err) => this.translate.get('errors').subscribe(text => {
            toastr.warning(text.serveur, '', {
                positionClass: 'toast-top-center',
                containerId: 'toast-top-center',
            });
        })
            , () => { this.processing = false; }
        );
    }

    changeStatut({ idFacture: idFature, StatusRetenueGarantie: statut }) {

        this.chantierService.changeStatutRetenueGarantie({ idFacture: idFature, StatusRetenueGarantie: statut }).subscribe(res => {
            this.translate.get(this.getTransalteChangeStatutRetenueLocationRequest(statut)).subscribe(text => {
                if (res) {
                    swal(text.success, "", "success");
                    this.getRetenueGarantie();
                } else {
                    swal(text.ImpossibleDeChangerStatut, "", "error");
                }
            });
        });

    }

    getTransalteChangeStatutRetenueLocationRequest(statut: StatutRetenueGarantie): string {
        debugger
        (statut)

        let StatusLabel: string = this.statutRetenueGarantie[statut].toLowerCase();
        (StatusLabel)
        return `changeStatutRetenueGarantie.${StatusLabel}`;
    }

}

import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BonCommandeFournisseurListModel, BonCommandeFournisseur } from 'app/Models/Entities/BonCommandeFournisseur';

@Injectable({
    providedIn: 'root',
})
export class BonCommandeFournisseurService {


    constructor(private http: HttpClient) { }

    GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, dateDebut?, dateFin?, idChantier?, IdFournisseur?, Statut?): Observable<BonCommandeFournisseurListModel> {
        let body = {
            SearchQuery: SearchQuery,
            PagingParams: { PageNumber: PageNumber, PageSize: PageSize },
            SortingParams: { SortDirection: SortDirection, OrderBy: OrderBy },
            dateDebut: dateDebut == null ? null : dateDebut,
            dateFin: dateFin == null ? null : dateFin,
            idChantier: idChantier,
            IdFournisseur: IdFournisseur,
            Statut: Statut,
        };

        return this.http.post<BonCommandeFournisseurListModel>(AppSettings.API_ENDPOINT + "BonCommandeFournisseur", body, AppSettings.RequestOptions());
    }

    Get(id) {
        return this.http.get<BonCommandeFournisseur>(AppSettings.API_ENDPOINT + "BonCommandeFournisseur/" + id, AppSettings.RequestOptions());
    }

    Add(body): Observable<BonCommandeFournisseur> {
        return this.http.post<BonCommandeFournisseur>(AppSettings.API_ENDPOINT + "BonCommandeFournisseur/Create", body, AppSettings.RequestOptions());
    }

    Update(id, body): Observable<BonCommandeFournisseur> {
    
        return this.http.put<BonCommandeFournisseur>(AppSettings.API_ENDPOINT + "BonCommandeFournisseur/" + id, body, AppSettings.RequestOptions());
    }

    Delete(id) {
        return this.http.delete(AppSettings.API_ENDPOINT + "BonCommandeFournisseur/" + id, AppSettings.RequestOptions());
    }


    CheckUniqueReference(nom: string) {
        return this.http.get(AppSettings.API_ENDPOINT + "BonCommandeFournisseur/CheckUniqueReference/" + nom, AppSettings.RequestOptions());
    }

    saveMemos(id: number, memos: string): Observable<boolean> {
        return this.http.post<boolean>(
            AppSettings.API_ENDPOINT + 'BonCommandeFournisseur/memos/' + id,
            memos,
            AppSettings.RequestOptions()
        );
    }

}
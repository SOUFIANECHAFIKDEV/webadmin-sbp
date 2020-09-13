import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'app/app-settings/app-settings';
import { Paiement } from 'app/Models/Entities/Paiement';
import { PaiementDataModel } from 'app/Models/PaiementListModel';

@Injectable({
  providedIn: 'root'
})
export class PaiementService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, idCompte?, dateDebut?, dateFin?): Observable<PaiementDataModel> {

    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "idCompte": idCompte,
      "dateDebut": dateDebut == null ? null : dateDebut,
      "dateFin": dateFin == null ? null : dateFin
    };

    return this.http.post<PaiementDataModel>(AppSettings.API_ENDPOINT + "Paiements/All", body, AppSettings.RequestOptions());
  }

  Add(paiement): Observable<Paiement> {
    return this.http.post<Paiement>(AppSettings.API_ENDPOINT + "Paiements/Create", paiement, AppSettings.RequestOptions());
  }
  Get(id): Observable<Paiement> {
    return this.http.get<Paiement>(AppSettings.API_ENDPOINT + "Paiements/" + id, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Paiement> {
    return this.http.put<Paiement>(AppSettings.API_ENDPOINT + "Paiements/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Paiements/" + id, AppSettings.RequestOptions());
  }

  MovementCompteACompte(compteDebiter: number, compteCrediter: number, montant: number, datePaiement: Date, idModePaiement: number, historique: string): Observable<boolean> {
    debugger
    let body = {
      "compteDebiter": compteDebiter,
      "compteCrediter": compteCrediter,
      "montant": montant,
      "datePaiement": datePaiement,
      "idModePaiement": idModePaiement,
      "historique": historique
    }
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "Paiements/MovementCompteACompte", body, AppSettings.RequestOptions());
  }

}

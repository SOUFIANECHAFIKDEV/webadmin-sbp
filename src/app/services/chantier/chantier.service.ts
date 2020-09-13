import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { AppSettings } from 'app/app-settings/app-settings';
import { ChantierListModel } from 'app/Models/ChantierListModel';
import { Chantier } from 'app/Models/Entities/Chantier';
import { StatutChantier } from 'app/Enums/StatutChantier.Enum';
import { ChangeStatutBodyRequest, changementTauxAvencementBodyRequest } from 'app/Models/changeStatutBodyRequest';
import { ChantierChangeStatusResponse, NbDocumentsChantieModel, ChangeStatusRetenueGarentieResponse } from 'app/Models/ChantierChangeStatusResponse';
import { RecapitulatifFinancierModel } from 'app/Models/RecapitulatifFinancierModel';
import { RetenueGarantieModel } from 'app/Models/RetenueGarantieModel';
import { Facture } from 'app/Models/Entities/Facture';

@Injectable()
export class ChantierService {

  constructor(private http: HttpClient) { }


  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, statut?: StatutChantier, clientId?): Observable<ChantierListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "statut": statut,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "clientId": clientId,
    };
    return this.http.post<ChantierListModel>(AppSettings.API_ENDPOINT + "Chantier", body, AppSettings.RequestOptions());
  }

  Get(id) {
    return this.http.get<Chantier>(AppSettings.API_ENDPOINT + "Chantier/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<Chantier> {
    return this.http.post<Chantier>(AppSettings.API_ENDPOINT + "Chantier/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Chantier> {
    return this.http.put<Chantier>(AppSettings.API_ENDPOINT + "Chantier/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Chantier/" + id, AppSettings.RequestOptions());
  }

  CheckUniqueName(reference: string) {
    return this.http.get(AppSettings.API_ENDPOINT + "Chantier/CheckUniqueName/" + reference, AppSettings.RequestOptions());
  }

  UpdateDocumentation(id, docs): Observable<Chantier> {
    return this.http.put<Chantier>(AppSettings.API_ENDPOINT + "Chantier/documentation/" + id, { id, docs }, AppSettings.RequestOptions());
  }

  changeStatut(body: ChangeStatutBodyRequest): Observable<ChantierChangeStatusResponse> {
    return this.http.put<ChantierChangeStatusResponse>(AppSettings.API_ENDPOINT + "Chantier/changeStatut", body, AppSettings.RequestOptions());
  }

  GetNbDocuments(idChantier: number): Observable<NbDocumentsChantieModel> {
    return this.http.get<NbDocumentsChantieModel>(AppSettings.API_ENDPOINT + "Chantier/nbDocuments/" + idChantier, AppSettings.RequestOptions());
  }

  GetRecapitulatifFinancier(id) {
    return this.http.get<RecapitulatifFinancierModel>(AppSettings.API_ENDPOINT + "Chantier/GetRecapitulatifFinancier/" + id, AppSettings.RequestOptions());
  }
  changementTauxAvencement(body: changementTauxAvencementBodyRequest): Observable<Chantier> {
    return this.http.put<Chantier>(AppSettings.API_ENDPOINT + "Chantier/changementTauxAvencement", body, AppSettings.RequestOptions());
  }
  GetRetenieGarantie(id) {
    return this.http.get<RetenueGarantieModel[]>(AppSettings.API_ENDPOINT + "Chantier/GetRetenueGarantie/" + id, AppSettings.RequestOptions());
  }
  changeStatutRetenueGarantie(body: ChangeStatusRetenueGarentieResponse): Observable<Facture> {
    debugger
    return this.http.put<Facture>(AppSettings.API_ENDPOINT + "Chantier/changeStatutRetenueGarantie", body, AppSettings.RequestOptions());
  }
}

import { Injectable } from '@angular/core';

import { FicheInterventionListModel } from 'app/Models/FicheInterventionListModel';
import { Observable } from 'rxjs';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { FicheIntervention } from 'app/Models/Entities/FicheIntervention';
import { SendMailParams } from 'app/Models/SendMailParams';
import { ChangeStatutBodyRequestIntervention } from 'app/Models/ChangeStatutBodyRequestIntervention';

@Injectable({
  providedIn: 'root'
})
export class FicheInterventionService {


  constructor(private http: HttpClient) { }


  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, Statut?, dateDebut?, dateFin?, IdChantier?, IdClient?, idTechnicien?): Observable<FicheInterventionListModel> {

    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Statut": Statut,
      "dateDebut": dateDebut == null ? null : dateDebut,
      "dateFin": dateFin == null ? null : dateFin,
      "IdChantier": IdChantier,
      "IdClient": IdClient,
      "idTechnicien": idTechnicien,
      "all": "true"
    };
    return this.http.post<FicheInterventionListModel>(AppSettings.API_ENDPOINT + "FicheIntervention", body, AppSettings.RequestOptions());

  }

  Get(id) {
    return this.http.get<FicheIntervention>(AppSettings.API_ENDPOINT + "FicheIntervention/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<FicheIntervention> {

    return this.http.post<FicheIntervention>(AppSettings.API_ENDPOINT + "FicheIntervention/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<FicheIntervention> {
    return this.http.put<FicheIntervention>(AppSettings.API_ENDPOINT + "FicheIntervention/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "FicheIntervention/" + id, AppSettings.RequestOptions());
  }

  CheckUniqueReference(reference: string) {
    return this.http.get(AppSettings.API_ENDPOINT + "FicheIntervention/CheckUniqueReference/" + reference, AppSettings.RequestOptions());
  }

  generatePDF(id) {

    return this.http.post(AppSettings.API_ENDPOINT + "FicheIntervention/GeneratePDF/" + id, AppSettings.RequestOptions());
  }
  ficheInterventionChantier(idchantier) {
    return this.http.post(AppSettings.API_ENDPOINT + "FicheIntervention/FicheInterventionChantier/" + idchantier, AppSettings.RequestOptions());

  }
  /*
    generatePDF(id) {
    
    return this.http.post(AppSettings.API_ENDPOINT + "FicheInterventions/GeneratePDF/" + id, AppSettings.RequestOptions());
  }
  */

  sendEmail(idDevis: number, mailParams: SendMailParams): Observable<any> {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + `FicheIntervention/sendEmail/${idDevis}`, mailParams, AppSettings.RequestOptions());
  }
  getParametrageFicheIntervention(type) {

    return this.http.get(AppSettings.API_ENDPOINT + "Parametrages/" + type, AppSettings.RequestOptions());

  }
  changeStatut(body: ChangeStatutBodyRequestIntervention): Observable<boolean> {
    return this.http.put<boolean>(AppSettings.API_ENDPOINT + "FicheIntervention/changeStatut", body, AppSettings.RequestOptions());
  }


  saveMemos(id: number, memos: string): Observable<boolean> {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "FicheIntervention/memos/" + id, memos, AppSettings.RequestOptions());
  }
  getParametrageIntervention(type) {

    return this.http.get(AppSettings.API_ENDPOINT + "Parametrages/" + type, AppSettings.RequestOptions());

  }
}

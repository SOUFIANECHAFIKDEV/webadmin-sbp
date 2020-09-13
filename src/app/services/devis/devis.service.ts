import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DevisListModel } from 'app/Models/DevisListModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';
import { Devis } from 'app/Models/Entities/Devis';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { SendMailParams } from 'app/Models/SendMailParams';
import { ChangeStatutBodyRequestDevis } from 'app/Models/ChangeStatutBodyRequestDevis';
import { StatutDevis } from 'app/Enums/StatutDevis';

@Injectable({
  providedIn: 'root'
})
export class DevisService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, Statut?, IdChantier?): Observable<DevisListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Statut": Statut,
      "IdChantier": IdChantier,
      "all": "true"
    };
    return this.http.post<DevisListModel>(AppSettings.API_ENDPOINT + "Devis", body, AppSettings.RequestOptions());
  }

  Get(id) {
    return this.http.get<Devis>(AppSettings.API_ENDPOINT + "Devis/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<Devis> {

    return this.http.post<Devis>(AppSettings.API_ENDPOINT + "Devis/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Devis> {
    return this.http.put<Devis>(AppSettings.API_ENDPOINT + "Devis/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Devis/" + id, AppSettings.RequestOptions());
  }

  CheckUniqueReference(reference: string) {
    return this.http.get(AppSettings.API_ENDPOINT + "Devis/CheckUniqueReference/" + reference, AppSettings.RequestOptions());
  }
  generatePDF(id) {

    return this.http.post(AppSettings.API_ENDPOINT + "Devis/GeneratePDF/" + id, AppSettings.RequestOptions());
  }


  sendEmail(idDevis: number, mailParams: SendMailParams): Observable<any> {

    return this.http.post<boolean>(AppSettings.API_ENDPOINT + `Devis/sendEmail/${idDevis}`, mailParams, AppSettings.RequestOptions());
  }
  getParametrageDevis(type) {

    return this.http.get(AppSettings.API_ENDPOINT + "Parametrages/" + type, AppSettings.RequestOptions());

  }
  changeStatut(body: ChangeStatutBodyRequestDevis): Observable<boolean> {
    return this.http.put<boolean>(AppSettings.API_ENDPOINT + "Devis/changeStatut", body, AppSettings.RequestOptions());
  }

  // generateBC(body): Observable<Devis> {
  //   debugger
  //   return this.http.post<Devis>(AppSettings.API_ENDPOINT + "Devis/generateBC", body, AppSettings.RequestOptions());
  // }
  generateBC(body): Observable<Devis> {

    return this.http.post<Devis>(AppSettings.API_ENDPOINT + "Devis/generateBC/", body, AppSettings.RequestOptions());
  }
}

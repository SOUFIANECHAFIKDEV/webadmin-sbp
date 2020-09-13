import { Injectable } from '@angular/core';
import { Avoir } from 'app/Models/Entities/Avoir';
import { Observable } from 'rxjs';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { AvoirListModel } from 'app/Models/AvoirsListModel';
import { FactureReferenceModel } from 'app/Models/FactureReferenceModel';

@Injectable({
  providedIn: 'root'
})
export class AvoirService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, Statut?: number[], dateDebut?, dateFin?, idChantier?, IdClient?, maxTotal?: number): Observable<AvoirListModel> {

    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Statut": Statut,
      "dateDebut": dateDebut == null ? null : dateDebut,
      "dateFin": dateFin == null ? null : dateFin,
      // "idClient": idClient,
      idChantier: idChantier,
      IdClient: IdClient,
      "maxTotal": maxTotal,

    };

    return this.http.post<AvoirListModel>(AppSettings.API_ENDPOINT + "Avoirs/All", body, AppSettings.RequestOptions());
  }

  Get(id): Observable<Avoir> {
    return this.http.get<Avoir>(AppSettings.API_ENDPOINT + "Avoirs/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<any> {
    return this.http.post<any>(AppSettings.API_ENDPOINT + "Avoirs/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Avoir> {
    return this.http.put<Avoir>(AppSettings.API_ENDPOINT + "Avoirs/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Avoirs/" + id, AppSettings.RequestOptions());
  }

  saveMemos(id: number, memos: string): Observable<boolean> {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "Avoirs/memos/" + id, memos, AppSettings.RequestOptions());
  }

  generatePDF(id) {
    return this.http.post(AppSettings.API_ENDPOINT + "Avoirs/GeneratePDF/" + id, null, AppSettings.RequestOptions());
  }

  GenerateReference(dateCreation): Observable<FactureReferenceModel> {
    let body = {
      "DateCreation": dateCreation
    };
    return this.http.post<FactureReferenceModel>(AppSettings.API_ENDPOINT + "Avoirs/GenerateReference", body, AppSettings.RequestOptions());
  }
  CheckUniqueReference(reference: string) {
    return this.http.get(
      AppSettings.API_ENDPOINT + 'Avoirs/CheckUniqueReference/' + reference,
      AppSettings.RequestOptions()
    );
  }

}

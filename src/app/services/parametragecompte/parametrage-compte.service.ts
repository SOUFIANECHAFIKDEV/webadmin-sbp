import { Injectable } from '@angular/core';

import { ParametrageListModel } from 'app/Models/ParametrageListModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';
import { ParametrageCompte } from 'app/Models/Entities/ParametrageCompte';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ParametrageCompteService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<ParametrageListModel> {
      let body = {
          "SearchQuery": SearchQuery,
          "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
          "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy }
      };

      return this.http.post<ParametrageListModel>(AppSettings.API_ENDPOINT + "parametrageCompte", body, AppSettings.RequestOptions());
  }

  Get(id) {
      return this.http.get<ParametrageCompte>(AppSettings.API_ENDPOINT + "parametrageCompte/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<ParametrageCompte> {
      
      return this.http.post<ParametrageCompte>(AppSettings.API_ENDPOINT + "parametrageCompte/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<ParametrageCompte> {
      return this.http.put<ParametrageCompte>(AppSettings.API_ENDPOINT + "parametrageCompte/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
      return this.http.delete(AppSettings.API_ENDPOINT + "parametrageCompte/" + id, AppSettings.RequestOptions());
  }


  CheckUniqueNom(nom: string) {
      return this.http.get(AppSettings.API_ENDPOINT + "parametrageCompte/CheckUniqueNom/" + nom, AppSettings.RequestOptions());
  }
}

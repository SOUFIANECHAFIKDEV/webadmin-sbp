import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';
import { VilleListModel } from 'app/Models/VilleListModel';
import { Ville } from 'app/Models/Entities/Ville';

@Injectable()
export class VilleService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<VilleListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<VilleListModel>(AppSettings.API_ENDPOINT + "Villes", body, AppSettings.RequestOptions());
  }

  Search(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<VilleListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<VilleListModel>(AppSettings.API_ENDPOINT + "Villes/Search", body, AppSettings.RequestOptions());
  }

  Get(id) {
    return this.http.get<Ville>(AppSettings.API_ENDPOINT + "Villes/" + id, AppSettings.RequestOptions());
  }

}

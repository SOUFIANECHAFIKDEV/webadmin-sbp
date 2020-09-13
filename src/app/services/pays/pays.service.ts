import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'app/app-settings/app-settings';
import { PaysListModel } from 'app/Models/PaysListModel';
import { Observable } from 'rxjs';
import { Pays } from 'app/Models/Entities/Pays';

@Injectable()
export class PaysService {


  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<PaysListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<PaysListModel>(AppSettings.API_ENDPOINT + "Pays", body, AppSettings.RequestOptions());
  }

  Get(id) {
    return this.http.get<Pays>(AppSettings.API_ENDPOINT + "Pays/" + id, AppSettings.RequestOptions());
  }
}

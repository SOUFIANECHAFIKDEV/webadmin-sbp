import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PeriodeComptablesListModel } from 'app/Models/PeriodeComptablesListModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { PeriodeComptable } from 'app/Models/Entities/PeriodeComptable';

@Injectable({
  providedIn: 'root'
})
export class PeriodeComptableService {

  constructor(private http: HttpClient) { }
  GetAllPeriodeComptable(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<PeriodeComptablesListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };
    return this.http.post<PeriodeComptablesListModel>(AppSettings.API_ENDPOINT + "PeriodeComptables", body, AppSettings.RequestOptions());
  }

  UpdatePeriodeComptable(id, body): Observable<PeriodeComptable> {
    return this.http.put<PeriodeComptable>(AppSettings.API_ENDPOINT + "PeriodeComptables/ " + id, body, AppSettings.RequestOptions());
  }

  AddPeriodeComptable(body): Observable<PeriodeComptable> {
    return this.http.post<PeriodeComptable>(AppSettings.API_ENDPOINT + "PeriodeComptables/Create", body, AppSettings.RequestOptions());
  }

  CloturePeriode(id) {
    return this.http.get(AppSettings.API_ENDPOINT + "PeriodeComptables/CloturePeriode/" + id, AppSettings.RequestOptions());
  }

}

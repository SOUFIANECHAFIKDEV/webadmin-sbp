import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FicheInterventionMaintenance } from 'app/Models/Entities/FicheInterventionMaintenance';
import { Observable } from 'rxjs';
import { AppSettings } from 'app/app-settings/app-settings';

@Injectable({
  providedIn: 'root'
})
export class FicheInterventionMaintenanceService {

  constructor(private http: HttpClient) { }
  Get(id) {
    return this.http.get<FicheInterventionMaintenance>(AppSettings.API_ENDPOINT + "FicheInterventionMaintenance/" + id, AppSettings.RequestOptions());
  }
  Add(body): Observable<FicheInterventionMaintenance> {

    return this.http.post<FicheInterventionMaintenance>(AppSettings.API_ENDPOINT + "FicheInterventionMaintenance/Create", body, AppSettings.RequestOptions());
  }
  CheckUniqueReference(reference: string) {
    return this.http.get(
      AppSettings.API_ENDPOINT + 'FicheInterventionMaintenance/CheckUniqueReference/' + reference,
      AppSettings.RequestOptions()
    );
  }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<any> {
    debugger
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "all": "true"
    };
    return this.http.post<any>(AppSettings.API_ENDPOINT + "FicheInterventionMaintenance", body, AppSettings.RequestOptions());

  }
}

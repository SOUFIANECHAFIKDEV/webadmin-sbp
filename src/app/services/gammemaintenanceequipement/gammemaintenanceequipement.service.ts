import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { GammeMaintenanceEquipementListModel } from 'app/Models/GammeMaintenanceEquipementListModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { GammeMaintenanceEquipement } from 'app/Models/Entities/GammeMaintenanceEquipement';

@Injectable({
  providedIn: 'root'
})
export class GammeMaintenanceEquipementService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery, PageNumber, PageSize, OrderBy, SortDirection): Observable<GammeMaintenanceEquipementListModel> {
    debugger
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },

    };

    return this.http.post<GammeMaintenanceEquipementListModel>(AppSettings.API_ENDPOINT + 'GammeMaintenanceEquipement/', body, AppSettings.RequestOptions());
  }

  Get(id): Observable<GammeMaintenanceEquipement> {
    return this.http.get<GammeMaintenanceEquipement>(AppSettings.API_ENDPOINT + 'GammeMaintenanceEquipement/' + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<GammeMaintenanceEquipement> {
    return this.http.post<GammeMaintenanceEquipement>(AppSettings.API_ENDPOINT + "GammeMaintenanceEquipement/Create", body, AppSettings.RequestOptions());

  }
  Update(id, body): Observable<GammeMaintenanceEquipement> {
    return this.http.put<GammeMaintenanceEquipement>(AppSettings.API_ENDPOINT + "GammeMaintenanceEquipement/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id): Observable<GammeMaintenanceEquipement> {
    return this.http.delete<GammeMaintenanceEquipement>(AppSettings.API_ENDPOINT + "GammeMaintenanceEquipement/" + id, AppSettings.RequestOptions());
  }

  CheckUniqueNom(nom: string) {
    return this.http.get(AppSettings.API_ENDPOINT + "GammeMaintenanceEquipement/CheckUniqueNom/" + nom, AppSettings.RequestOptions());
  }
}

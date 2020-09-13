import { Injectable } from '@angular/core';
import { ChangeStatutBodyRequestVisiteMaintenance } from 'app/Models/ChangeStatutBodyRequestDevis';
import { AppSettings } from 'app/app-settings/app-settings';
import { VisiteMaintenance } from 'app/Models/Entities/VisiteMaintenance';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { VilleListModel } from 'app/Models/VilleListModel';
import { VisiteMaintenanceListModel } from 'app/Models/VisiteMaintenanceListModel';

@Injectable({
  providedIn: 'root'
})
export class VisiteMaintenanceService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, Statut?: number, Annee?: number, Mois?: number/*, IdContrat?*/, IdClient?): Observable<VisiteMaintenanceListModel> {
    debugger
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      //"statuts": Status,
      "Statut": Statut,
      "Annee": Annee,
      "Mois": Mois,
      // "IdContrat": IdContrat,
      "IdClient": IdClient,
      "all": 'true',
    };

    return this.http.post<VisiteMaintenanceListModel>(AppSettings.API_ENDPOINT + 'VisiteMaintenance/All', body, AppSettings.RequestOptions());
  }
  Get(id): Observable<VisiteMaintenance> {
    return this.http.get<VisiteMaintenance>(AppSettings.API_ENDPOINT + "VisiteMaintenance/" + id, AppSettings.RequestOptions());
  }
  changeStatut(body: ChangeStatutBodyRequestVisiteMaintenance): Observable<VisiteMaintenance> {
    return this.http.put<VisiteMaintenance>(AppSettings.API_ENDPOINT + "VisiteMaintenance/changeStatut", body, AppSettings.RequestOptions());
  }
}

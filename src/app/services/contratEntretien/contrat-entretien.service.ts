import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ContratEntretien } from 'app/Models/Entities/ContratEntretien';
import { ContratEntretienListModel } from 'app/Models/ContratEntretienListModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { identifierModuleUrl } from '@angular/compiler';
import { ChangeStatutBodyRequestContratEntretien } from 'app/Models/ChangeStatutBodyRequestDevis';


@Injectable({
  providedIn: 'root'
})
export class ContratEntretienService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery, PageNumber, PageSize, OrderBy, SortDirection, Statut, dateDebut, dateFin, IdClient): Observable<ContratEntretienListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Statut": Statut,
      "dateDebut": dateDebut == null ? null : dateDebut,
      "dateFin": dateFin == null ? null : dateFin,
      "IdClient": IdClient,
    };
    return this.http.post<ContratEntretienListModel>(AppSettings.API_ENDPOINT + "ContratEntretien/All/", body, AppSettings.RequestOptions());
  }

  Get(id): Observable<ContratEntretien> {
    return this.http.get<ContratEntretien>(AppSettings.API_ENDPOINT + "ContratEntretien/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<ContratEntretien> {
    return this.http.post<ContratEntretien>(AppSettings.API_ENDPOINT + "ContratEntretien/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<ContratEntretien> {
    return this.http.put<ContratEntretien>(AppSettings.API_ENDPOINT + "ContratEntretien/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id): Observable<ContratEntretien> {
    return this.http.delete<ContratEntretien>(AppSettings.API_ENDPOINT + "ContratEntretien/" + id, AppSettings.RequestOptions());
  }

  saveMemos(id: number, memos: string): Observable<boolean> {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "ContratEntretien/memos/" + id, memos, AppSettings.RequestOptions());
  }
  changeStatut(body: ChangeStatutBodyRequestContratEntretien): Observable<ContratEntretien> {
    return this.http.put<ContratEntretien>(AppSettings.API_ENDPOINT + "ContratEntretien/changeStatut", body, AppSettings.RequestOptions());
  }

  exportGammeMaintenanceEquipement(id: number): Observable<any> {
    return this.http.post<any>(AppSettings.API_ENDPOINT + "ContratEntretien/ExportGammeMaintenanceEquipement/" + id, AppSettings.RequestOptions());
  }
}

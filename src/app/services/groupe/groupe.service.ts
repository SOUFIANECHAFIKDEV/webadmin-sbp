import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';
import { GroupeListModel } from 'app/Models/GroupeListModel';
import { Groupe } from 'app/Models/Entities/Groupe';

@Injectable({
  providedIn: 'root'
})
export class GroupesService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<GroupeListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<GroupeListModel>(AppSettings.API_ENDPOINT + "Groupes", body, AppSettings.RequestOptions());
  }

  Get(id) {
    return this.http.get<Groupe>(AppSettings.API_ENDPOINT + "Groupes/" + id, AppSettings.RequestOptions());
  }

  Add(Nom): Observable<Groupe> {
    return this.http.post<Groupe>(AppSettings.API_ENDPOINT + "Groupes/Create", { Nom }, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Groupe> {
    return this.http.put<Groupe>(AppSettings.API_ENDPOINT + "Groupes/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Groupes/" + id, AppSettings.RequestOptions());
  }

  CheckUniqueNom(nom: string) {
    return this.http.get(AppSettings.API_ENDPOINT + "Groupes/CheckUniqueNom/" + nom, AppSettings.RequestOptions());
  }

}

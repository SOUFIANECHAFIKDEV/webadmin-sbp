import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { FournisseurListModel } from "../../Models/FournisseurListModel"
import { Observable } from 'rxjs';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';

@Injectable()
export class FournisseurService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<FournisseurListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<FournisseurListModel>(AppSettings.API_ENDPOINT + "Fournisseurs", body, AppSettings.RequestOptions());
  }

  Get(id) {
    return this.http.get<Fournisseur>(AppSettings.API_ENDPOINT + "Fournisseurs/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<Fournisseur> {
    return this.http.post<Fournisseur>(AppSettings.API_ENDPOINT + "Fournisseurs/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Fournisseur> {
    return this.http.put<Fournisseur>(AppSettings.API_ENDPOINT + "Fournisseurs/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Fournisseurs/" + id, AppSettings.RequestOptions());
  }

  CheckUniqueReference(reference: string) {
    return this.http.get(AppSettings.API_ENDPOINT + "Fournisseurs/CheckUniqueReference/" + reference, AppSettings.RequestOptions());
  }

  saveMemos(id : number, memos : string): Observable<boolean> {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "Fournisseurs/memos/" + id, memos, AppSettings.RequestOptions());
  }
}

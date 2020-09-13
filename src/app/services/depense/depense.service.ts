import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DepenseListModel } from 'app/Models/DepenseListModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';
import { Depense } from 'app/Models/Entities/depense';

@Injectable({
  providedIn: 'root'
})
export class DepenseService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, Statut?, IdChantier?, IdFournisseur?): Observable<DepenseListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Statut": Statut,
      "IdChantier": IdChantier,
      "IdFournisseur": IdFournisseur,
      "all": "true"
    };
    return this.http.post<DepenseListModel>(AppSettings.API_ENDPOINT + "Depense", body, AppSettings.RequestOptions());
  }

  Get(id) {
    return this.http.get<Depense>(AppSettings.API_ENDPOINT + "Depense/" + id, AppSettings.RequestOptions());
  }
  Add(depense, BonCommandeFournisseurIds?: number[]): Observable<Depense> {

    let body = {
      "depense": depense,
      "BonCommandeFournisseurIds": BonCommandeFournisseurIds == null ? [] : BonCommandeFournisseurIds,
    }
    return this.http.post<Depense>(AppSettings.API_ENDPOINT + "Depense/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Depense> {

    return this.http.put<Depense>(AppSettings.API_ENDPOINT + "Depense/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Depense/" + id, AppSettings.RequestOptions());
  }


  saveMemos(id: number, memos: string): Observable<boolean> {

    return this.http.post<boolean>(
      AppSettings.API_ENDPOINT + 'Depense/memos/' + id,
      memos,
      AppSettings.RequestOptions()
    );
  }
}

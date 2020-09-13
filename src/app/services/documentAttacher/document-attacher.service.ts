import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DocumentAttacherListModel } from 'app/Models/DocumentAttacherListModel';
import { DocumentAttacher } from 'app/Models/Entities/DocumentAttacher';

@Injectable({
  providedIn: 'root'
})
export class DocumentAttacherService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, idChantier?, labels?, rubrique?): Observable<DocumentAttacherListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "IdChantier": parseInt(idChantier),
      "Labels": labels,
      "Rubrique": rubrique,
      "Includes": ""
    };

    return this.http.post<DocumentAttacherListModel>(AppSettings.API_ENDPOINT + "DocumentAttacher", body, AppSettings.RequestOptions());
  }


  Get(id) {

    return this.http.get<DocumentAttacher>(AppSettings.API_ENDPOINT + "DocumentAttacher/" + id, AppSettings.RequestOptions());
  }
  Add(body): Observable<DocumentAttacher> {

    return this.http.post<DocumentAttacher>(AppSettings.API_ENDPOINT + "DocumentAttacher/Create", body, AppSettings.RequestOptions());
  }


  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "DocumentAttacher/" + id, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<DocumentAttacher> {
    return this.http.put<DocumentAttacher>(AppSettings.API_ENDPOINT + "DocumentAttacher/" + id, body, AppSettings.RequestOptions());
  }

}

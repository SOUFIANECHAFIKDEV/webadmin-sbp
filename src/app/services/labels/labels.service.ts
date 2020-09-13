import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { LabelListModel } from "../../Models/LabelsListModel";
import { Observable } from 'rxjs';
import { Label } from 'app/Models/Entities/Label';


@Injectable()
export class LabelService {

  constructor(private http: HttpClient) { }



  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<LabelListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<LabelListModel>(AppSettings.API_ENDPOINT + "Labels", body, AppSettings.RequestOptions());
  }

  Add(label): Observable<Label> {
    return this.http.post<Label>(AppSettings.API_ENDPOINT + "Labels/Create", { label }, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Labels/" + id, AppSettings.RequestOptions());
  }

  Update(id, label): Observable<Label> {
    return this.http.put<Label>(AppSettings.API_ENDPOINT + "Labels", { id: id, label: label }, AppSettings.RequestOptions());
  }

}
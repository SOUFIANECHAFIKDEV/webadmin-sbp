import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { LabelListModel } from "../../Models/LabelsListModel";
import { Observable } from 'rxjs';
import { Label } from 'app/Models/Entities/Label';
import { Lots } from 'app/Models/Entities/Lots';
import { LotsListModel } from 'app/Models/LotsListModel';


@Injectable()
export class LotsService {

  constructor(private http: HttpClient) { }



  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<LotsListModel> {
    
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<LotsListModel>(AppSettings.API_ENDPOINT + "Lots", body, AppSettings.RequestOptions());
  }

  Add(Lot: Lots): Observable<Lots> {
    return this.http.post<Lots>(AppSettings.API_ENDPOINT + "Lots/Create", Lot, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Lots/" + id, AppSettings.RequestOptions());
  }

  Update(id, Lot: Lots): Observable<Lots> {
    return this.http.put<Lots>(AppSettings.API_ENDPOINT + `Lots/${id}`, Lot, AppSettings.RequestOptions());
  }
  getLotProduitById(id){
    return this.http.post(AppSettings.API_ENDPOINT + "Lots/getLotProduitById" + id, AppSettings.RequestOptions());
  }
  CheckUniqueReference(nom: string) {
    return this.http.get(AppSettings.API_ENDPOINT + "Lots/CheckUniqueReference/" + nom, AppSettings.RequestOptions());
  }

}
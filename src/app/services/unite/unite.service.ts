import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Unite } from 'app/Models/Entities/Unite';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';
import { UniteListModel } from 'app/Models/UniteListModel';

@Injectable({
    providedIn: 'root'
})
export class UniteService {
    constructor(private http: HttpClient) { }

    GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<UniteListModel> {
        let body = {
            "SearchQuery": SearchQuery,
            "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
            "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy }
        };

        return this.http.post<UniteListModel>(AppSettings.API_ENDPOINT + "Unites", body, AppSettings.RequestOptions());
    }

    Add(body): Observable<Unite> {
        return this.http.post<Unite>(AppSettings.API_ENDPOINT + "Unites/Create", body, AppSettings.RequestOptions());
    }

    Delete(id) {
        return this.http.delete(AppSettings.API_ENDPOINT + "Unites/" + id, AppSettings.RequestOptions());
    }

    Update(id, body): Observable<Unite> {
        return this.http.put<Unite>(AppSettings.API_ENDPOINT + "Unites/" + id, body, AppSettings.RequestOptions());
      }

}
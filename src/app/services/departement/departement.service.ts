import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';
import { DepartementListModel } from 'app/Models/DepartementListModel';
import { Departement } from 'app/Models/Entities/Depatement';

@Injectable()
export class DepartementService {

    constructor(private http: HttpClient) { }

    GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<DepartementListModel> {
        let body = {
            "SearchQuery": SearchQuery,
            "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
            "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
            "Includes": ""
        };

        return this.http.post<DepartementListModel>(AppSettings.API_ENDPOINT + "Departements", body, AppSettings.RequestOptions());
    }

    Get(id): Observable<Departement> {
        return this.http.get<Departement>(AppSettings.API_ENDPOINT + "Departements/" + id, AppSettings.RequestOptions());
    }

    Search(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<Departement[]> {
        
        let body = {
            "SearchQuery": SearchQuery,
            "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
            "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
            "Includes": ""
        };

        return this.http.post<Departement[]>(AppSettings.API_ENDPOINT + "Departements/search", body, AppSettings.RequestOptions());
    }
}
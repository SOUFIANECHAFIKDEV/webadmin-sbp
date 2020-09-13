import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { ModereglementListModel } from "../../Models/ModereglementListModel"
import { Observable } from 'rxjs';
import { Modereglement } from 'app/Models/Entities/Modereglement';
import { HttpHeaders } from "@angular/common/http";

@Injectable()
export class ModereglementService {


    constructor(private http: HttpClient) { }

    GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<ModereglementListModel> {
        let body = {
            "SearchQuery": SearchQuery,
            "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
            "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy }
        };

        return this.http.post<ModereglementListModel>(AppSettings.API_ENDPOINT + "modelRegelement", body, AppSettings.RequestOptions());
    }

    Get(id) {
        return this.http.get<Modereglement>(AppSettings.API_ENDPOINT + "modelRegelement/" + id, AppSettings.RequestOptions());
    }

    Add(body): Observable<Modereglement> {
        return this.http.post<Modereglement>(AppSettings.API_ENDPOINT + "modelRegelement/Create", body, AppSettings.RequestOptions());
    }

    Update(id, body): Observable<Modereglement> {
        return this.http.put<Modereglement>(AppSettings.API_ENDPOINT + "modelRegelement/" + id, body, AppSettings.RequestOptions());
    }

    Delete(id) {
        return this.http.delete(AppSettings.API_ENDPOINT + "modelRegelement/" + id, AppSettings.RequestOptions());
    }

    
}
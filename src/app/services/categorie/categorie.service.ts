import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { CategorieListModel } from "../../Models/CategorieListModel"
import { Observable } from 'rxjs';
import { Categorie } from 'app/Models/Entities/Categorie';
import { HttpHeaders } from "@angular/common/http";

@Injectable()
export class CategorieService {


    constructor(private http: HttpClient) { }

    GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<CategorieListModel> {
        let body = {
            "SearchQuery": SearchQuery,
            "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
            "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy }
        };

        return this.http.post<CategorieListModel>(AppSettings.API_ENDPOINT + "categorie", body, AppSettings.RequestOptions());
    }

    Get(id) {
        return this.http.get<Categorie>(AppSettings.API_ENDPOINT + "categorie/" + id, AppSettings.RequestOptions());
    }

    Add(body): Observable<Categorie> {
        return this.http.post<Categorie>(AppSettings.API_ENDPOINT + "categorie/Create", body, AppSettings.RequestOptions());
    }

    Update(id, body): Observable<Categorie> {
        return this.http.put<Categorie>(AppSettings.API_ENDPOINT + "categorie/" + id, body, AppSettings.RequestOptions());
    }

    Delete(id) {
        return this.http.delete(AppSettings.API_ENDPOINT + "categorie/" + id, AppSettings.RequestOptions());
    }


    CheckUniqueNom(nom: string) {
        return this.http.get(AppSettings.API_ENDPOINT + "categorie/CheckUniqueNom/" + nom, AppSettings.RequestOptions());
    }
    
}
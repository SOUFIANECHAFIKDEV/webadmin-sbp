import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { UserListModel } from "../../Models/UserListModel"
import { Observable } from 'rxjs';
import { User } from 'app/Models/Entities/User';
import { Profile } from 'app/Models/Entities/Profile';

@Injectable()
export class UtilisateurService {


    constructor(private http: HttpClient) { }

    GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, profileType?: number[]): Observable<UserListModel> {
        debugger
        let body = {
            "SearchQuery": SearchQuery,
            "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
            "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
            "Includes": "",
            "profileType": profileType
        };

        return this.http.post<UserListModel>(AppSettings.API_ENDPOINT + "account", body, AppSettings.RequestOptions());
    }

    Get(id) {
        return this.http.get<User>(AppSettings.API_ENDPOINT + "account/" + id, AppSettings.RequestOptions());
    }

    Add(body): Observable<User> {
        return this.http.post<User>(AppSettings.API_ENDPOINT + "account/Create", body, AppSettings.RequestOptions());
    }

    Update(body): Observable<User> {

        return this.http.put<User>(AppSettings.API_ENDPOINT + "account/updateUserInfos", body, AppSettings.RequestOptions());
    }

    Delete(id) {
        return this.http.delete(AppSettings.API_ENDPOINT + "account/" + id, AppSettings.RequestOptions());
    }

    CheckUniqueUserName(userName: string) {
        return this.http.get(AppSettings.API_ENDPOINT + "account/CheckUniqueUserName/" + userName, AppSettings.RequestOptions());
    }

    getUserClientInfos(idClient: number) {
        return this.http.get(AppSettings.API_ENDPOINT + "account/getUserClientInfos/" + idClient, AppSettings.RequestOptions());
    }
}
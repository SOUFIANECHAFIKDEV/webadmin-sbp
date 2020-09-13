import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { ClientListModel } from '../../Models/ClientListModel';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { AppSettings } from 'app/app-settings/app-settings';
import { Client } from 'app/Models/Entities/Client';

@Injectable()
export class ClientService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, typeClient?): Observable<ClientListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "typeClient": typeClient,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<ClientListModel>(AppSettings.API_ENDPOINT + "Clients", body, AppSettings.RequestOptions());
  }

  GetAllPresta(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?): Observable<ClientListModel> {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "Includes": ""
    };

    return this.http.post<ClientListModel>(AppSettings.API_ENDPOINT + "Clients", body, AppSettings.RequestOptions());
  }
  Get(id) {
    return this.http.get<Client>(AppSettings.API_ENDPOINT + "Clients/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<Client> {
    return this.http.post<Client>(AppSettings.API_ENDPOINT + "Clients/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Client> {

    return this.http.put<Client>(AppSettings.API_ENDPOINT + "Clients/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Clients/" + id, AppSettings.RequestOptions());
  }

  CheckUniqueCodeClient(codeclient: string) {

    return this.http.get(AppSettings.API_ENDPOINT + "Clients/CheckUniqueCodeClient/" + codeclient, AppSettings.RequestOptions());
  }

  saveMemos(id: number, memos: string): Observable<boolean> {
    debugger
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "Clients/memos/" + id, memos, AppSettings.RequestOptions());
  }

  updateMemos(id: number, memos: string): Observable<boolean> {
    debugger
    const body = {
      id : id,
      memos : memos
    };

    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "Clients/UpdateMemos", body, AppSettings.RequestOptions());
  }
  
}

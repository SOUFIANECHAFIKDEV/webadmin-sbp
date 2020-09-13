import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigMessagerie } from 'app/Models/Entities/ConfigMessagerie';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigMessagerieService {

  constructor(private http: HttpClient) { }

  Get(id) {
    return this.http.get<ConfigMessagerie>(AppSettings.API_ENDPOINT + "ConfigMessagerie/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<ConfigMessagerie> {
    return this.http.post<ConfigMessagerie>(AppSettings.API_ENDPOINT + "ConfigMessagerie/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<ConfigMessagerie> {
    return this.http.put<ConfigMessagerie>(AppSettings.API_ENDPOINT + "ConfigMessagerie/" + id, body, AppSettings.RequestOptions());
  }


}

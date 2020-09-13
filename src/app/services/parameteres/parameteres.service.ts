import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Numerotation, Parametrage } from '../../Models/Entities/Numerotation';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ParameteresService {

  constructor(private http: HttpClient) { }

  Get(type) {
    
    return this.http.get<Parametrage>(AppSettings.API_ENDPOINT + "Parametrages/" + type, AppSettings.RequestOptions());
  }

  Add(body): Observable<Numerotation> {
    return this.http.post<Numerotation>(AppSettings.API_ENDPOINT + "Parametrages/Create", body, AppSettings.RequestOptions());
  }

  Update(type, Contenu): Observable<Numerotation> {
    
    return this.http.put<Numerotation>(AppSettings.API_ENDPOINT + "Parametrages/" + type, {Contenu} , AppSettings.RequestOptions());
  }

  Generate(id) {
    return this.http.get(AppSettings.API_ENDPOINT + "Parametrages/Generate/" + id, AppSettings.RequestOptions());
  }

  Increment(id) {
    return this.http.get<Numerotation>(AppSettings.API_ENDPOINT + "Parametrages/Increment/" + id, AppSettings.RequestOptions());
  }

}

import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileManagerService {

  constructor(private http: HttpClient) { }

  Get(name) {
    return this.http.get<any>(AppSettings.API_ENDPOINT + "FileManager/" + name, AppSettings.RequestOptions());
  }

  Add(body): Observable<boolean> {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "FileManager/Create", body, AppSettings.RequestOptions());
  }

  Delete(name) {
    return this.http.delete(AppSettings.API_ENDPOINT + "FileManager/" + name, AppSettings.RequestOptions());
  }

  DeleteFiles(filesnames:string[]) {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "FileManager/DeleteFiles", filesnames, AppSettings.RequestOptions());
  }

  
}

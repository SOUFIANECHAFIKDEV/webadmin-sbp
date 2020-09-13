import { Injectable } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { module } from 'app/Models/Entities/module';

@Injectable()
export class moduleService {

    constructor(private http: HttpClient) { }

    GetModels(): Observable<module[]> {
        return this.http.get<module[]>(AppSettings.API_ENDPOINT + "Modules/All" , AppSettings.RequestOptions());
    }

}
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AppSettings } from 'app/app-settings/app-settings';
import { LoginModel } from '../../Models/LoginModel';
import { catchError, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';
import { User } from 'app/Models/Entities/User';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  Login(UserName: string, Password: string): Observable<any> {
    return this.http.post<LoginModel>(AppSettings.API_ENDPOINT + "Account/login", { UserName, Password }, AppSettings.RequestOptions())
  }

  erroHandler(error: HttpErrorResponse) {
    return Observable.throw(error.message || "Server Error")
  }

  logout(): void {
    localStorage.removeItem('token');
  }

  isAuthenticated() {
    return localStorage.getItem('token') != null ? true : false;
  }

  recoverAccount(email, subject, body): Observable<any> {
    let data = {
      email: email,
      subject: subject,
      body: body
    }
    return this.http.post(AppSettings.API_ENDPOINT + "Account/recoverAccount",data, AppSettings.RequestOptions())
  }

  changePassword(idUser: number, password: string): Observable<any> {
    return this.http.post<LoginModel>(AppSettings.API_ENDPOINT + "Account/changePassword", { idUser, password }, AppSettings.RequestOptions())
  }

  getUser(): User {
    return localStorage.getItem("PDB_USER") != null ? JSON.parse(localStorage.getItem("PDB_USER")) as User : null
  }
}


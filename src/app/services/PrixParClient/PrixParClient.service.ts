// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { AppSettings } from 'app/app-settings/app-settings';
// import { PaysListModel } from 'app/Models/PaysListModel';
// import { Observable } from 'rxjs';
// import { PrixParClients } from '../../Models/Entities/prixParClient';
// @Injectable()
// export class PrixParClientService {
//   constructor(private http: HttpClient) { }

//   ajouterNouveauPrixParClient(prixParClients: PrixParClients[]): Observable<PrixParClients> {
//     return this.http.post<PrixParClients>(AppSettings.API_ENDPOINT + "PrixParClient", prixParClients, AppSettings.RequestOptions());
//   }

//   Delete(id) {
//     return this.http.delete(AppSettings.API_ENDPOINT + "PrixParClient/" + id, AppSettings.RequestOptions());
//   }

//   Update(id, body): Observable<PrixParClients> {
//     return this.http.put<PrixParClients>(AppSettings.API_ENDPOINT + "PrixParClient/" + id, body, AppSettings.RequestOptions());
//   }

//   getPrixByClientByProduit(idClient, idProduit) {
//     return this.http.get<PrixParClients>(AppSettings.API_ENDPOINT + "PrixParClient/PrixByClientByProduit/" + idClient + "/" + idProduit, AppSettings.RequestOptions());
//   }

// }

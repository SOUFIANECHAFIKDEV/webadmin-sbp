import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';
import { Facture } from 'app/Models/Entities/Facture';
import { FactureListModel } from 'app/Models/FactureListModel';
import { FactureReferenceModel } from 'app/Models/FactureReferenceModel';
import { SendMailParams } from 'app/Models/SendMailParams';
import { Avoir } from 'app/Models/Entities/Avoir';
import { AddFactureSituationbodyRequest, AddFactureAcomptebodyRequest } from 'app/Models/Entities/Devis';

@Injectable({
  providedIn: 'root',
})
export class FactureService {
  constructor(private http: HttpClient) { }

  GetAll(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, Statut?: number[], dateDebut?, dateFin?, idChantier?, IdClient?): Observable<FactureListModel> {

    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      //"statuts": Status,
      "Statut": Statut,

      "dateDebut": dateDebut == null ? null : dateDebut,
      "dateFin": dateFin == null ? null : dateFin,
      "idChantier": idChantier,
      "IdClient": IdClient,
      "all": 'true',
    };

    return this.http.post<FactureListModel>(AppSettings.API_ENDPOINT + 'Factures/All', body, AppSettings.RequestOptions());
  }

  Get(id): Observable<Facture> {
    return this.http.get<Facture>(
      AppSettings.API_ENDPOINT + 'Factures/' + id,
      AppSettings.RequestOptions()
    );
  }


  Add(facture, FicheInterventionIds?: number[]): Observable<any> { // Facture | FactureReferenceModel
    let body = {
      "facture": facture,
      "FicheInterventionIds": FicheInterventionIds == null ? [] : FicheInterventionIds,
    }
    return this.http.post<any>(AppSettings.API_ENDPOINT + "Factures/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Facture> {
    return this.http.put<Facture>(
      AppSettings.API_ENDPOINT + 'Factures/' + id,
      body,
      AppSettings.RequestOptions()
    );
  }

  Delete(id) {
    return this.http.delete(
      AppSettings.API_ENDPOINT + 'Factures/' + id,
      AppSettings.RequestOptions()
    );
  }

  CheckUniqueReference(reference: string) {
    return this.http.get(
      AppSettings.API_ENDPOINT + 'Factures/CheckUniqueReference/' + reference,
      AppSettings.RequestOptions()
    );
  }
  saveMemos(id: number, memos: string): Observable<boolean> {
    return this.http.post<boolean>(
      AppSettings.API_ENDPOINT + 'Factures/memos/' + id,
      memos,
      AppSettings.RequestOptions()
    );
  }

  annulerFacture(id: number, avoir: Avoir): Observable<any> { // avoir or configurer période comptable
    return this.http.post<any>(AppSettings.API_ENDPOINT + "Factures/AnnulerFacture/" + id, avoir, AppSettings.RequestOptions());
  }

  GenerateReference(dateCreation): Observable<FactureReferenceModel> {
    let body = {
      DateCreation: dateCreation,
    };
    return this.http.post<FactureReferenceModel>(
      AppSettings.API_ENDPOINT + 'Factures/GenerateReference',
      body,
      AppSettings.RequestOptions()
    );
  }

  generatePDF(id) {
    return this.http.post(
      AppSettings.API_ENDPOINT + 'Factures/GeneratePDF/' + id,
      AppSettings.RequestOptions()
    );
  }

  exportFactureParPeriod(body) {
    return this.http.post(
      AppSettings.API_ENDPOINT + 'Factures/exportFactureParPeriod',
      body,
      AppSettings.RequestOptions()
    );
  }

  exportreleveRelanceFacture(body) {
    return this.http.post(
      AppSettings.API_ENDPOINT + 'Factures/exportreleveRelanceFacture',
      body,
      AppSettings.RequestOptions()
    );
  }

  getParametrageDocument() {
    return this.http.get(
      AppSettings.API_ENDPOINT + 'parametrageDocument',
      AppSettings.RequestOptions()
    );
  }

  sendEmail(idFacture: number, mailParams: SendMailParams): Observable<any> {
    return this.http.post<boolean>(
      AppSettings.API_ENDPOINT + `Factures/sendEmail/${idFacture}`,
      mailParams,
      AppSettings.RequestOptions()
    );
  }

  CreateFactureFromCommandeFranchise(id: number): Observable<any> {
    return this.http.get(
      AppSettings.API_ENDPOINT + 'Factures/CreateFactureFromCommandeFranchise/' + id,
      AppSettings.RequestOptions()
    );
  }

  CreateFactureSituation(bodyRequest: AddFactureSituationbodyRequest): Observable<Facture> {
    return this.http.post<Facture>(
      AppSettings.API_ENDPOINT + 'Factures/CreateFactureSituation', bodyRequest, AppSettings.RequestOptions()
    );
  }

  CreateFactureAcomptes(bodyRequest: AddFactureAcomptebodyRequest): Observable<Facture> {
    return this.http.post<Facture>(
      AppSettings.API_ENDPOINT + 'Factures/CreateAcompteSituation', bodyRequest, AppSettings.RequestOptions()
    );
  }

}
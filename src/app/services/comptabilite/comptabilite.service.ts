import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { PagedJournalVenteList, PagedJournalBanqueList } from 'app/Models/JournalVenteModel';
import { AppSettings } from 'app/app-settings/app-settings';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ComptabiliteService {

  constructor(private http: HttpClient) { }

  JournalVente(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, dateMinimal?, dateMaximale?, periode?): Observable<PagedJournalVenteList> {

    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "dateMinimal": dateMinimal == null ? null : dateMinimal,
      "dateMaximale": dateMaximale == null ? null : dateMaximale,
      "periode": periode,

    };

    return this.http.post<PagedJournalVenteList>(AppSettings.API_ENDPOINT + "Comptabilites/JournalVente", body, AppSettings.RequestOptions());
  }


  JournalAchat(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, dateMinimal?, dateMaximale?, periode?): Observable<PagedJournalVenteList> {

    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "dateMinimal": dateMinimal == null ? null : dateMinimal,
      "dateMaximale": dateMaximale == null ? null : dateMaximale,
      "periode": periode,

    };

    return this.http.post<PagedJournalVenteList>(AppSettings.API_ENDPOINT + "Comptabilites/JournalAchat", body, AppSettings.RequestOptions());
  }

  ComptabiliteComptes(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, dateMinimal?, dateMaximale?, isCaisse?, periode?): Observable<PagedJournalBanqueList> {

    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "dateMinimal": dateMinimal == null ? null : dateMinimal,
      "dateMaximale": dateMaximale == null ? null : dateMaximale,
      "isCaisse": isCaisse,
      "periode": periode
    };

    return this.http.post<PagedJournalBanqueList>(AppSettings.API_ENDPOINT + "Comptabilites/ComptabiliteComptes", body, AppSettings.RequestOptions());
  }

  ExporterComptabiliteComptes(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, dateMinimal?, dateMaximale?, isCaisse?, periode?) {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "dateMinimal": dateMinimal == null ? null : dateMinimal,
      "dateMaximale": dateMaximale == null ? null : dateMaximale,
      "isCaisse": isCaisse,
      "periode": periode
    };

    return this.http.post<any>(AppSettings.API_ENDPOINT + "Comptabilites/ExportComptabiliteComptes", body, AppSettings.RequestOptions());
  }

  ExporterJournalVente(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, dateMinimal?, dateMaximale?, periode?) {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "dateMinimal": dateMinimal == null ? null : dateMinimal,
      "dateMaximale": dateMaximale == null ? null : dateMaximale,
      "periode": periode
    };

    return this.http.post<any>(AppSettings.API_ENDPOINT + "Comptabilites/ExportJournalVente", body, AppSettings.RequestOptions());
  }

  ExporterJournalAchat(SearchQuery?, PageNumber?, PageSize?, OrderBy?, SortDirection?, dateMinimal?, dateMaximale?, periode?) {
    let body = {
      "SearchQuery": SearchQuery,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "dateMinimal": dateMinimal == null ? null : dateMinimal,
      "dateMaximale": dateMaximale == null ? null : dateMaximale,
      "periode": periode

    };

    return this.http.post<any>(AppSettings.API_ENDPOINT + "Comptabilites/ExportJournalAchat", body, AppSettings.RequestOptions());
  }

}

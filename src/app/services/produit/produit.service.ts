import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ProduitListModel } from '../../Models/ProduitListModel';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import { Observable } from 'rxjs';
import { AppSettings } from 'app/app-settings/app-settings';
import { Produit } from 'app/Models/Entities/Produit';
import { Tva } from '../../Models/Entities/Tva';
import { Unite } from '../../Models/Entities/Unite';
import { Categorie } from '../../Models/Entities/Categorie';

@Injectable()
export class ProduitService {

  constructor(private http: HttpClient) { }

  GetAll(SearchQuery, PageNumber, PageSize, OrderBy, SortDirection, IdFournisseur, labels, Categorie?: string): Observable<ProduitListModel> {
    debugger
    let body = {
      "SearchQuery": SearchQuery,
      "labels": labels,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "IdFournisseur": IdFournisseur,
      "Categorie": Categorie == undefined ? "" : Categorie,
      "Includes": ""
    };
    return this.http.post<ProduitListModel>(AppSettings.API_ENDPOINT + "Produits", body, AppSettings.RequestOptions());
  }

  Get(id) {
    return this.http.get<Produit>(AppSettings.API_ENDPOINT + "Produits/" + id, AppSettings.RequestOptions());
  }

  Add(body): Observable<Produit> {

    return this.http.post<Produit>(AppSettings.API_ENDPOINT + "Produits/Create", body, AppSettings.RequestOptions());
  }

  Update(id, body): Observable<Produit> {
    return this.http.put<Produit>(AppSettings.API_ENDPOINT + "Produits/" + id, body, AppSettings.RequestOptions());
  }

  Delete(id) {
    return this.http.delete(AppSettings.API_ENDPOINT + "Produits/" + id, AppSettings.RequestOptions());
  }

  CheckUniqueReference(reference: string) {
    return this.http.get(AppSettings.API_ENDPOINT + "Produits/CheckUniqueReference/" + reference, AppSettings.RequestOptions());
  }

  saveMemos(id: number, memos: string): Observable<boolean> {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + "Produits/memos/" + id, memos, AppSettings.RequestOptions());
  }

  getListeTva() {
    return this.http.get<any>(AppSettings.API_ENDPOINT + "Produits/ListeTva", AppSettings.RequestOptions());
  }

  getTvaById(id: number) {
    return this.http.get<any>(AppSettings.API_ENDPOINT + "Produits/getTvaById/" + id, AppSettings.RequestOptions());
  }

  getListeUnite() {
    return this.http.get<any>(AppSettings.API_ENDPOINT + "Produits/ListeUnite", AppSettings.RequestOptions());
  }

  getUniteById(id: number) {
    return this.http.get<any>(AppSettings.API_ENDPOINT + "Produits/getUniteById/" + id, AppSettings.RequestOptions());
  }

  getListeCategorie() {
    return this.http.get<any>(AppSettings.API_ENDPOINT + "Produits/ListeCategorie", AppSettings.RequestOptions());
  }

  getCategorieById(id: number) {
    return this.http.get<any>(AppSettings.API_ENDPOINT + "Produits/getCategorieById/" + id, AppSettings.RequestOptions());
  }


  getLotProduits(SearchQuery, PageNumber, PageSize, OrderBy, SortDirection, labels, produits): Observable<ProduitListModel> {

    let body = {
      "SearchQuery": SearchQuery,
      "labels": labels,
      "PagingParams": { "PageNumber": PageNumber, "PageSize": PageSize },
      "SortingParams": { "SortDirection": SortDirection, "OrderBy": OrderBy },
      "produits": produits,
      "Includes": ""
    };

    return this.http.post<ProduitListModel>(AppSettings.API_ENDPOINT + "Produits/getLotProduits", body, AppSettings.RequestOptions());
  }

  UpdateFicheTehcnique(id: number, UpdateFicheTehcnique): Observable<boolean> {
    return this.http.post<boolean>(AppSettings.API_ENDPOINT + `Produits/UpdateFicheTehcnique/${id}`, UpdateFicheTehcnique, AppSettings.RequestOptions());
  }
}

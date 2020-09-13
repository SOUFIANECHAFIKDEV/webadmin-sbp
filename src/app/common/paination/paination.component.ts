import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'paination',
  templateUrl: './paination.component.html',
  styleUrls: ['./paination.component.scss']
})
export class PainationComponent {
  @Input('painationInfo') painationInfo: painationModel = {
    hasNextPage: false,
    hasPreviousPage: false,
    nextPageNumber: 1,
    pageNumber: 1,
    pageSize: 10,
    previousPageNumber: 1,
    totalItems: 2,
    totalPages: 1,
    list: []
  };

  @Input('pageSizes') pageSizes: number[] = [10,25,50,100];
  @Output('chagePageNamber') chagePageNamber = new EventEmitter();
  @Output('changePageSize') changePageSize = new EventEmitter();


  constructor() { }

  Premier() {
    
    if (this.painationInfo.pageNumber != 1) {
      this.chagePageNamber.emit(1);
      (1);
    }
  }

  Precedent() {
    
    // if (this.painationInfo.pageNumber != 1) {
    if (this.painationInfo.hasPreviousPage) {
      let pageNumber: number = this.painationInfo.pageNumber - 1;
      this.chagePageNamber.emit(pageNumber);
      (pageNumber);
    }
  }

  Suivant() {
    
    // if (this.painationInfo.pageNumber != this.painationInfo.totalPages) {
    if (this.painationInfo.hasNextPage) {
      this.chagePageNamber.emit(this.painationInfo.pageNumber + 1);
      (this.painationInfo.pageNumber + 1);
    }
  }

  Dernier() {
    
    if (this.painationInfo.pageNumber != this.painationInfo.totalPages) {
      this.chagePageNamber.emit(this.painationInfo.totalPages);
      (this.painationInfo.totalPages);
    }
  }
  changePage(pageNb) {
    this.chagePageNamber.emit(pageNb);
    (pageNb);
  }

  PageSize(size) {
    this.changePageSize.emit(size);
    (size);
  }
}

class painationModel {
  list: [];
  hasNextPage: Boolean;
  hasPreviousPage: Boolean;

  nextPageNumber: number;
  previousPageNumber: number;

  pageNumber: number;
  pageSize: number;

  totalItems: number;
  totalPages: number;
}


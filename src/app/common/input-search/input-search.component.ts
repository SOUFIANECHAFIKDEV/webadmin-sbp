import { Component } from '@angular/core';

@Component({
  selector: 'input-search',
  templateUrl: './input-search.component.html',
  styleUrls: ['./input-search.component.scss']
})
export class InputSearchComponent {
  readOnly = false;
  constructor() {
    console.log('InputSearchComponent');
  }

  serach() {
    console.log('serach');
  }

  showlist() {
    console.log('showlist');
  }

  onSearch(inputString, event) {
    console.log(inputString);
    console.log(event);
  }
}

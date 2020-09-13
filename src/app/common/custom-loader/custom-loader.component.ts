import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'custom-loader',
  templateUrl: './custom-loader.component.html',
  styleUrls: ['./custom-loader.component.scss']
})
export class CustomLoaderComponent implements OnInit {
  @Input('displayLoader') display:boolean = true;
  constructor() { }

  ngOnInit() {
  }

}

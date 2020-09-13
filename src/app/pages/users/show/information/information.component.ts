import { Component, OnInit, Input } from '@angular/core';
import { Fournisseur } from 'app/Models/Entities/Fournisseur';
import { Contact } from 'app/Models/Entities/Contact';
import { User } from '../../../../Models/Entities/User';

@Component({
  selector: 'user-information',
  templateUrl: './information.component.html',
  styleUrls: ['./information.component.scss']
})
export class InformationComponent implements OnInit {
  @Input('user') user: User;
  constructor() { }

  ngOnInit() {
    
  }

  
}

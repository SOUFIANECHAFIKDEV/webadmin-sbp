import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class loginLayoutComponent {
  constructor(private renderer: Renderer2, private elRef: ElementRef) {
    this.renderer.addClass(document.body, '1-column');
    this.renderer.setAttribute(document.body, 'data-col', '1-column'); // fixed-navbar
    this.renderer.removeClass(document.body, 'fixed-navbar');

  }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.renderer.setAttribute(document.body, 'data-col', '');
    this.renderer.removeClass(document.body, '1-column');
    this.renderer.addClass(document.body, 'fixed-navbar');
  }
}



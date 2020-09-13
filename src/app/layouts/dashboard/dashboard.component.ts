import { Component, OnInit, OnDestroy, Renderer2, ElementRef } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardLayoutComponent implements OnDestroy {
  
    constructor(private renderer: Renderer2, private elRef: ElementRef) {
      this.renderer.addClass(document.body, '2-columns');
      this.renderer.setAttribute(document.body, 'data-col', '2-columns');
     }

     ngOnInit() {
      const el = this.elRef.nativeElement.querySelector('#stackFooter')
      this.renderer.removeClass(el, 'footer-static');
      this.renderer.addClass(el, 'fixed-bottom');
            
     }
  
    ngOnDestroy() {
      this.renderer.removeClass(document.body, '2-columns');
      const el = this.elRef.nativeElement.querySelector('#stackFooter')
      this.renderer.addClass(el, 'footer-static');
      this.renderer.removeClass(el, 'fixed-bottom');
      // this.renderer.removeAttribute(document.body, 'data-col');
    }
  
  }
  


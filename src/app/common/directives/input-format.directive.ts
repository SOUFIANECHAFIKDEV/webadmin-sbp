import { Directive, HostListener, ElementRef, Input } from '@angular/core';

@Directive({
  selector: '[appInputRemoveDefaultZero]'
})
export class InputFormatDirective {
  constructor(private el: ElementRef) { }

  @HostListener('click') onclick() {
    let value: number = this.el.nativeElement.value;
    this.el.nativeElement.value = (value == 0 ? null : value)
  }

  @HostListener('blur') onblur() {
    let value: any = this.el.nativeElement.value;
    this.el.nativeElement.value = (value == '' ? 0 : value);
  }

}

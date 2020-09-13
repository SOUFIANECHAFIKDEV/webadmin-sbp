import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { TranslateService } from "@ngx-translate/core";
declare var swal: any;

@Component({
  selector: 'modal-image',
  templateUrl: './modal-image.component.html',
  styleUrls: ['./modal-image.component.scss']
})
export class ModalImageComponent {
  @Input('images') images: { name: string, base64: string }[] = [];
  public showImageByIndex = 0;
  @Output('deleteImage') delete = new EventEmitter();
  @Input('readOnly') public readOnly = false;

  constructor(private translate: TranslateService) { }

  Increment() {
    this.showImageByIndex = this.showImageByIndex == (this.images.length - 1) ? 0 : (this.showImageByIndex + 1);
  }

  decrement() {
    this.showImageByIndex = this.showImageByIndex == 0 ? (this.images.length - 1) : (this.showImageByIndex - 1);
  }
  imgOnclick() {
    
    let modal = document.getElementById('myModal');
    modal.style.display = "block";
  }
  span = document.getElementsByClassName("close")[0];
  spanOnClick() {
    
    let modal = document.getElementById('myModal');
    modal.style.display = "none";
  }

  deleteImage() {
    this.translate.get("images.delete").subscribe(text => {
      swal({
        title: text.title,
        text: text.question,
        icon: "warning",
        buttons: {
          cancel: {
            text: text.cancel,
            value: null,
            visible: true,
            className: "",
            closeModal: false
          },
          confirm: {
            text: text.confirm,
            value: true,
            visible: true,
            className: "",
            closeModal: false
          }
        }
      }).then(isConfirm => {
        if (isConfirm) {
          this.delete.emit(this.showImageByIndex);
          if (this.images.length == 0) {
            this.spanOnClick();
          } else {
            this.showImageByIndex = 0;
          }
          swal(text.success, "", "success");
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }
}

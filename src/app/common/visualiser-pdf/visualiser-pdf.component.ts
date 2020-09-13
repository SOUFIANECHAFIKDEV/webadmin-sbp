import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AppSettings } from 'app/app-settings/app-settings';

@Component({
  selector: 'app-visualiser-pdf',
  templateUrl: './visualiser-pdf.component.html',
  styleUrls: ['./visualiser-pdf.component.scss']
})
export class VisualiserPdfComponent implements OnChanges {

  displayData;
  @Input('base64') base64 = null;

  ngOnChanges() {
    this.VisualiserPDF();
  }

  VisualiserPDF() {

    if (this.base64 == null) return;

    // Get time stamp for fileName.
    var stamp = new Date().getTime();

    // file type 
    var fileType = 'application/pdf';

    // file data
    var fileData = AppSettings._base64ToArrayBuffer(this.base64);

    // file extension
    var extension = "pdf";

    let pdfSrc = AppSettings.printPdf(fileData, "document_" + stamp + "." + extension, fileType, extension);

    this.displayData = {
      pdfSource: {
        url: pdfSrc
      },
      base64: this.base64
    }
  }
}

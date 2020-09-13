import { FileManagerService } from './../../services/fileManager/file-manager.service';
import { Pipe, PipeTransform } from '@angular/core';


@Pipe({
  name: 'GetImageBase64ByName',
  pure: false
})
export class GetImageBase64ByName implements PipeTransform {
  private imageBase64: any = null;
  private cachedImageName = null;

  constructor(private fileManagerService: FileManagerService) { }

  transform(imageBase64: any, args?: any): any {

    if (!imageBase64 || typeof (parseInt(imageBase64)) != "number") {
      return null;
    }

    if (imageBase64 !== this.cachedImageName) {
      this.imageBase64 = null;
      this.cachedImageName = imageBase64;

      this.fileManagerService.Get(imageBase64).subscribe(response => {
        this.imageBase64 = response.data;
      });
    }

    return this.imageBase64;
  }

}

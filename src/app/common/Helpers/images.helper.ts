import { stringify } from "querystring";
import { Injectable } from '@angular/core';
import { FileManagerService } from "app/services/fileManager/file-manager.service";
import { AppSettings } from '../../app-settings/app-settings';

@Injectable()
export class ImagesHelper {
    public files = null;
    constructor(private fileManagerService: FileManagerService, private appSettings: AppSettings) { }
    ajouterImages(imagesliste: imagesModel[]) {
        let imagesIds: string[] = [];
        imagesliste.forEach(image => {
            imagesIds.push(image.name)
        });
        return { imagesliste, imagesIds }
    }

    modifierImages(imagesInDb: string[], newImages: imagesModel[]): { imagesPourAjouter: imagesModel[], imagesPourSupprimer: string[], imagesIds: string } {
        let imagesIds: string = "[";
        let imagesPourSupprimer: string[] = [];
        let imagesPourAjouter: imagesModel[] = [];

        //selection les images supprimer
        imagesInDb.forEach(imageInDb => {
            let result = newImages.filter(I => I.name == imageInDb).length == 0 ? true : false;
            if (result) {
                imagesPourSupprimer.push(imageInDb);
            }
        });

        //selectionner les images pour upload
        newImages.forEach(newImage => {
            //selection les nom des images pour enregistrer dans la base de donnée
            // imagesIds.push(newImage.name);

            let result = imagesInDb.filter(I => I == newImage.name).length == 0 ? true : false;
            if (result) {
                imagesPourAjouter.push(newImage);
            }
        });

        // selection les nom des images pour enregistrer dans la base de donnée
        newImages.forEach((image, index) => {
            imagesIds = imagesIds + '"' + image.name + '"';

            if ((newImages.length - 1) != index) {
                imagesIds = imagesIds + ',';
            }
        });

        imagesIds = imagesIds + "]";
        // imagesIds.push(image.name);
        return {
            imagesPourAjouter: imagesPourAjouter,
            imagesPourSupprimer: imagesPourSupprimer,
            imagesIds: imagesIds
        }
    }

    getimagesSources(images:any): Promise<any[]> {
        return new Promise((resolve, reject) => {
            try {
                let imagesBase64 = [];
                if (images == undefined) {
                    resolve(imagesBase64);
                }
                (images).forEach(img => {
                    this.fileManagerService.Get(img).subscribe(res => {
                        imagesBase64.push({
                            name: img,
                            // base64: res.data
                            base64: res
                        });
                    });
                })
                resolve(imagesBase64)
            } catch (ex) {
                reject(ex)
            }
        });
    }

    // startUpload(event: FileList): imagesModel | void { //to do
    //     
    //     const file = event.item(0)
    //     var reader = new FileReader();
    //     reader.readAsDataURL(file);
    //     this.files = null;
    //     let image: imagesModel;
    //     reader.onload = () => {
    //         return new Promise((resolve,reject)=>{
    //             resolve({
    //                 base64 : reader.result.toString(),
    //                 name : AppSettings.guid(),
    //             });
    //         });
    //         image.base64 = reader.result.toString();
    //         image.name = AppSettings.guid();
    //         // return {
    //         //     base64: reader.result.toString(),
    //         //     name: AppSettings.guid()
    //         // };
    //         return image;
    //     }

    // }

}
class imagesModel {
    base64: string;
    name: string;
}
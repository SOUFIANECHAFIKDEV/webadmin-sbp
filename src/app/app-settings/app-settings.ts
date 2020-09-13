import { HttpHeaders } from "@angular/common/http";
import { User } from "app/Models/Entities/User";

export class AppSettings {

    // public static API_ENDPOINT = 'http://demo.artinove.net/Sbp_API/api/;
    public static API_ENDPOINT = 'http://localhost:57759/api/';
    // public static API_ENDPOINT = 'http://demo.artinove.net/Sbp_API/api/';
    // public static API_ENDPOINT = 'https://api.cvc-sbp.fr/api/';

    static RequestOptions() {
        return {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.getItem("token") != null ? localStorage.getItem("token") : ""
            })
        };
    }

    /* User connecter */
    static user: User = new User();

    /* La langue de site web */
    static lang = 'fr';

    /* Pagination par default */
    static SIZE_PAGE = 10;

    /* Maximum données obtenir à partir de l'api */
    static MAX_GET_DATA = 5000000;

    /* Contient les ids des pays à des villes */
    static SHOW_CITY_OF_COUNTRY = [75]

    /** NBR ITEM CHARGER BY PAGE */
    static NBR_ITEM_PER_PAGE = 30

    /*------------------------------------------------------------------*/
    /*                  Regular expression                              */
    /*------------------------------------------------------------------*/
    static regexURL = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;
    static regexEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    static regexPhone = /^\+?\d*$/;

    /*------------------------------------------------------------------*/
    /*                  Commun Function                                 */
    /*------------------------------------------------------------------*/
    static downloadBase64(data, fileName, fileType, extension) {
        let buffer, blob, url, a;
        if (fileType.includes("application/octet-stream")) {
            fileType = "application/" + extension;
        }

        var binary_string = window.atob(data.split(',')[1]);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        buffer = bytes.buffer;

        blob = new Blob([buffer], { type: fileType });

        // Set view.
        if (blob) {
            // Read blob.
            url = window.URL.createObjectURL(blob);

            // Create link.
            a = document.createElement("a");
            // Set link on DOM.
            document.body.appendChild(a);
            // Set link's visibility.
            a.style = "display: none";
            // Set href on link.
            a.href = url;
            // Set file name on link.
            a.download = fileName;

            // Trigger click of link.
            a.click();

            // Clear.
            window.URL.revokeObjectURL(url);
        }
    }

    // create file from binary file data and download it .
    public static printPdf(data, fileName, fileType, extension) {
        // Set objects for file generation.
        var blob;
        // Get time stamp for fileName.
        var stamp = new Date().getTime();

        // Set MIME type and encoding.
        fileType = (fileType || "application/pdf");
        //extension = fileType.split("/")[1].split(";")[0];
        // Set file name.
        fileName = (fileName || stamp + "." + extension);

        // Set data on blob.
        blob = new Blob([data], { type: fileType });

        // Set view.
        if (blob) {
            //
            return window.URL.createObjectURL(blob);
        } else {
            // Handle error.
        }
        return data;
    }
    static guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    }

    static ConvertEmptyValueToNull(values) {
        for (var i in values) {
            if (values[i] == "") {
                values[i] = null
            }
        }
        return values;
    }

    /**
     * FORMATER DATETIME
     */
    static formaterDatetime(date: string) {
        let convertDate = new Date(date);
        let year = convertDate.getFullYear()
        let month = (convertDate.getMonth() + 1).toString().length == 1 ? "0" + (convertDate.getMonth() + 1) : (convertDate.getMonth() + 1)
        let day = convertDate.getDate().toString().length == 1 ? "0" + convertDate.getDate() : convertDate.getDate()
        let heure = convertDate.getHours().toString().length == 1 ? "0" + convertDate.getHours() : convertDate.getHours();
        let minutes = convertDate.getMinutes().toString().length == 1 ? "0" + convertDate.getMinutes() : convertDate.getMinutes();
        return year + "-" + month + "-" + day + "T" + heure + ":" + minutes;
    }

    static _base64ToArrayBuffer(base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    }

    // create file from binary file data and download it .
    static setFile(data, fileName, fileType, extension) {
        // Set objects for file generation.
        var blob, url, a;
        // Get time stamp for fileName.
        var stamp = new Date().getTime();

        // Set MIME type and encoding.
        fileType = (fileType || "application/pdf");
        //extension = fileType.split("/")[1].split(";")[0];
        // Set file name.
        fileName = (fileName || "FCCClient_" + stamp + "." + extension);

        // Set data on blob.
        blob = new Blob([data], { type: fileType });

        // Set view.
        if (blob) {
            // Read blob.
            url = window.URL.createObjectURL(blob);

            // Create link.
            a = document.createElement("a");
            // Set link on DOM.
            document.body.appendChild(a);
            // Set link's visibility.
            a.style = "display: none";
            // Set href on link.
            a.href = url;
            // Set file name on link.
            a.download = fileName;

            // Trigger click of link.
            a.click();

            // Clear.
            window.URL.revokeObjectURL(url);
        } else {
            // Handle error.
        }
        return data;
    }
    /* Name variable in token */
    static SELECTED_PRODUIT = "selected_products"

    /**
     * Formater Number
     */
    static formaterNumber(montant) {
        return parseFloat(Number(montant).toFixed(2))
    }

    static objectSize(obj) {
        var size = 0, key;
        for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
        }
        return size;
    };
    /***
     * compare two  date
     */
    static compareDate(date1, date2) {
        //Note: 00 is month i.e. January
        var dateOne = new Date(date1); //Year, Month, Date
        var dateTwo = new Date(date2); //Year, Month, Date
        if (dateOne > dateTwo) {
            return true;
        } else {
            return false;
        }
    }
}
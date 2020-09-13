export class SendMailParams {

    Subject: string;
    content: string;
    path: string;
    messageTo: string[];
    Bcc: string[];
    Cc: string[];
    attachments: Attachments[];
}

export class Attachments {
    File: string;
    name: string;
}

export class SendMailToPush {
    factureBase64: string;
    fileName: string;
    idDoc: number;
    clientEmail: string;
    module: modules;
}

export enum modules {
    factures,
    FT
}

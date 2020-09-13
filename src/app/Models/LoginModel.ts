export class LoginModel {
    public token: string;
    public user: user;
}

class user {
    public id: number;
    public nom: string;
    public prenom: string;
    public actif: number;
    public dernierecon: string;
    public joinDate: string;
    public email: string;
    public phonenumber: string;
    public accessfailedcount: number;
    public username: string;
}
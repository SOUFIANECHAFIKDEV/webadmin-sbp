import { Component, OnInit, ViewChild } from "@angular/core";
import { UserListModel } from "app/Models/UserListModel";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { TranslateService } from "@ngx-translate/core";
import { AppSettings } from "app/app-settings/app-settings";
import { UtilisateurService } from "app/services/users/user.service";
import { UsersProfil } from "./../../../Enums/UserProfil.Enum";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { LoginService } from '../../../services/login/login.service'
import { PreviousRouteService } from "app/services/previous-route/previous-route.service";
import { UserProfile } from "app/Enums/user-profile.enum";
import { Router } from "@angular/router";

declare var swal: any;
declare var toastr: any;
declare var jQuery: any;

@Component({
    selector: "app-index",
    templateUrl: "./index.component.html",
    styleUrls: ["./index.component.scss"]
})
export class IndexComponent implements OnInit {
    @ViewChild(DataTableDirective)
    dtElement: DataTableDirective;
    Users: UserListModel;
    userTableColumns: any = [];
    dtOptions: DataTables.Settings = {};
    dtTrigger: Subject<any> = new Subject();
    dataTablesLang = {};
    i = 0;
    total;
    checkedColumns: any = [];
    pageLength = AppSettings.SIZE_PAGE;
    processing: boolean = false;
    initPage = 0;
    profils = [];
    profilUser
    IdUser
    constructor(
        private utilisateurService: UtilisateurService,
        private translate: TranslateService,
        private formBuilder: FormBuilder,
        private loginService: LoginService,
        private previousRouteService: PreviousRouteService,
        private router: Router,
        private usersProfil: UsersProfil,
    ) { }

    ngOnInit() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        this.translate.get("dataTables").subscribe((text: string) => {

            this.dataTablesLang = text;
            this.InitDataTable();
        });
        this.getDataTablesTrans();
        this.translate.get("labels").subscribe(labels => {
            this.userTableColumns = [labels.nom, labels.prenom, labels.Actif, labels.Profile, labels.dernierConnect, labels.JointDate, labels.email, labels.mobile, labels.Username, labels.action]
        });
        this.getProfils();
        this.IdUser = this.loginService.getUser().id;

    }

    GetAll(search, pNumber, pSize, cSort, sDir) {
        this.utilisateurService
            .GetAll(search, pNumber, pSize, cSort, sDir)
            .subscribe(Response => {
                this.Users = Response;

            });
    }

    InitDataTable() {
        this.processing = true;
        // recupérer old paramétere
        let oldChoices = JSON.parse(localStorage.getItem("module_user_info"));
        this.pageLength = !oldChoices || oldChoices.page_length == null ? AppSettings.SIZE_PAGE : parseInt(oldChoices.page_length);
        let order = !oldChoices || oldChoices.sort == null ? [[0, 'asc']] : [[parseInt(oldChoices.sort), oldChoices.dir]];

        // Garder pagination
        var previousUrl = this.previousRouteService.getPreviousUrl();

        if (previousUrl.includes("/utilisateurs/detail") || previousUrl.includes("/utilisateurs/modifier")) {
            if (oldChoices && oldChoices.start != null) this.initPage = oldChoices.start;
        }

        this.dtOptions = {
            pagingType: "full_numbers",
            pageLength: this.pageLength,
            displayStart: this.initPage,
            serverSide: true,
            processing: false,
            search: { search: oldChoices && oldChoices.search != null ? oldChoices.search : "" },
            data: [],
            order: order,
            language: this.dataTablesLang,
            columnDefs: [{ orderable: false, targets: 9 }],
            ajax: (dataTablesParameters: any, callback) => {
                this.saveChoices(dataTablesParameters.length, dataTablesParameters.search.value, dataTablesParameters.order[0].column, dataTablesParameters.order[0].dir, dataTablesParameters.start);;
                this.utilisateurService
                    .GetAll(
                        dataTablesParameters.search.value,
                        dataTablesParameters.start / dataTablesParameters.length + 1,
                        dataTablesParameters.length,
                        dataTablesParameters.columns[dataTablesParameters.order[0].column].data,
                        dataTablesParameters.order[0].dir,
                        this.profilUser != null ? [this.profilUser] : [],
                        //this.profilUser
                    )
                    .subscribe(data => {
                        this.Users = data;
                        this.GetInitParameters();
                        if (this.i == 0) {
                            this.total = data.totalItems;
                            this.i++;
                        }
                        callback({
                            recordsTotal: this.total,
                            recordsFiltered: data.totalItems,
                            data: []
                        });
                        // this.processing = false;
                    }, err => this.translate.get("errors").subscribe(errors => {
                        if (this.processing) {
                            this.processing = false;
                            toastr.warning(errors.serveur, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
                        }
                    }));
            },
            columns: [
                { data: "Nom" },
                { data: "Prenom" },
                { data: "Actif" },
                { data: "Dernierecon" },
                { data: "JoinDate" },
                { data: "Email" },
                { data: "Phonenumber" },
                { data: "Accessfailedcount" },
                { data: "Username" },
                { data: "action" }
            ]
        };
    }

    delete(id, i) {
        this.translate.get("list.delete").subscribe(text => {
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
                    this.utilisateurService.Delete(id).subscribe(res => {
                        if (res) {
                            swal(text.success, "", "success");
                            // this.rerender();
                            this.Users.list.splice(i, 1);
                        } else {
                            //swal(text.error, "", "error");
                            swal(text.ImpossibleDeSuppression, "", "error");
                        }
                    });
                } else {
                    swal(text.cancel, "", "error");
                }
            });
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.GetInitParameters()
            this.InitDataTable();
            this.dtTrigger.next();
            this.rerender();
        }, 500);
        setTimeout(() => {
            this.processing = false;
        }, 1000);
    }

    ngOnDestroy(): void {
        // Do not forget to unsubscribe the event
        this.dtTrigger.unsubscribe();
    }

    rerender(): void {
        this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
            // Destroy the table first
            dtInstance.destroy();
            // Call the dtTrigger to rerender again
            this.dtTrigger.next();
        });
    }

    getDataTablesTrans() {
        this.translate.setDefaultLang(AppSettings.lang);
        this.translate.use(AppSettings.lang);
        this.translate.get("dataTables").subscribe((text: string) => {
            this.dataTablesLang = text;
        });
        this.InitDataTable();
    }

    SetCheckedColmuns(arr) { /* arr : is array of colmun checked */
        localStorage.setItem("module_user_colmuns", JSON.stringify(arr))
    }

    GetInitParameters() {
        let data = JSON.parse(localStorage.getItem("module_user_colmuns"));
        this.checkedColumns = (data == null ? [] : data)
    }

    saveChoices(length, search, sort, dir, start) {
        localStorage.setItem("module_user_info", JSON.stringify({ page_length: length, search: search, sort: sort, dir: dir, start: start }));
    }

    checkPasswords(group: FormGroup) {

        let password = group.controls.password.value;
        let confirmPassword = group.controls.confirmPassword.value;

        return password === confirmPassword ? null : { notSame: true }
    }

    changePasswordForm = this.formBuilder.group({
        password: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['']
    }, { validator: this.checkPasswords })


    iduser: any;
    changePassword() {
        this.loginService.changePassword(this.iduser, this.changePasswordForm.value.password).subscribe(res => {
            this.translate.get("changePassword").subscribe(text => {
                toastr.success(text.msg, text.title, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
            });
            jQuery("#changePassword").modal("hide");
        });
    }

    getProfils() {
        this.translate.get("labels").subscribe(labels => {
            this.profils.push({ id: UserProfile.admin, libelle: labels.admin });
            this.profils.push({ id: UserProfile.technicien, libelle: labels.technicien });
            this.profils.push({ id: UserProfile.manager, libelle: labels.manager });
        });
    }

    setUserIdInlocalStorage(id: number) {
        localStorage.setItem("SBP_changePassword_UserId", id.toString());
    }

    /**
   * double clique pour passer au details de chantier
   */
    preventSingleClick = false;
    timer: any;
    delay: Number;

    doubleClick(idUser) {
        this.preventSingleClick = true;
        clearTimeout(this.timer);
        this.router.navigate(['/utilisateurs/detail', idUser]);
    }
}

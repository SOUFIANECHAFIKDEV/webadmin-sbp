import { Component, OnInit, OnChanges, Output, EventEmitter, Input, Inject } from '@angular/core';
import { UtilisateurService } from 'app/services/users/user.service';
import { AppSettings } from 'app/app-settings/app-settings';
import { User } from 'app/Models/Entities/User';
import { UserProfile } from 'app/Enums/user-profile.enum';
import { TranslateService } from "@ngx-translate/core";
import { DOCUMENT } from '@angular/common';
declare var toastr: any;
declare var jQuery: any;

@Component({
  selector: 'select-user',
  templateUrl: './select-user.component.html',
  styleUrls: ['./select-user.component.scss']
})

export class SelectUserComponent implements OnInit, OnChanges {
  page: number = 1;
  totalPage: number = 1;
  techniciens: User[] = [];
  search: string = '';
  @Input('selected') technicienTmp: User[] = [];
  @Output('returnSelectedItems') emitReturnSelectedItems = new EventEmitter();

  @Input('readOnly') readOnly = false;
  @Input('usersToDispaly') technicientToDispaly: User[] = [];
  @Input('listTechnicien') listTechnicien: [] = null;
  constructor(private utilisateurService: UtilisateurService,
    private translate: TranslateService, @Inject(DOCUMENT) private document: any) { }

  ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.getTechniciens(this.technicientToDispaly);
  }

  ngOnChanges() {

    this.getTechniciens();
    console.log("listTechnicien", this.listTechnicien)
  }


  removeTmpFromOrigin() {
    this.technicienTmp.forEach((technicien, index) => {
      this.techniciens = this.techniciens.filter(res => res.id != technicien.id);
      // this.technicienTmp.splice(index, 1);
    });
  }

  getTechniciens(technicientToDispaly?) {

    this.utilisateurService.GetAll(this.search, this.page, AppSettings.NBR_ITEM_PER_PAGE, "nom", "desc", /*UserProfile.technicien*/this.listTechnicien).subscribe(res => {
      this.techniciens = res.list;
      this.totalPage = res.totalPages;
      this.removeTmpFromOrigin();

    }, err => { });
  }

  returnSelectedItems() {

    if (this.technicienTmp.length === 0) {
      this.translate.get("errors").subscribe(errors => {
        toastr.warning(errors.technicienRequired, "", { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
      return;
    }
    jQuery("#selectUserModal").modal("hide");
    this.emitReturnSelectedItems.emit(this.technicienTmp);
    const technicienTmp = this.technicienTmp;
    this.technicientToDispaly = [].concat(technicienTmp);
  }

  // On cas de scroll dans popup des lots
  onScrollLots() {
    if (this.totalPage != this.page) {
      this.page++;
      this.getTechniciens()
    }
  }


  addTmpTechnicien(index) {

    this.technicienTmp.unshift(this.techniciens[index]);
    this.techniciens.splice(index, 1);
    (this.technicienTmp);
  }

  removeTmpTechnicien(index) {

    this.techniciens.unshift(this.technicienTmp[index]);
    this.technicienTmp.splice(index, 1);
    (this.technicienTmp);
  }
  delete(index) {
    this.techniciens.unshift(this.technicientToDispaly[index]);
    this.technicientToDispaly.splice(index, 1);
    this.technicienTmp.splice(index, 1);
  }
  navigateToDtailsPage(id) {
    (this.document.location.origin);
    const origin = this.document.location.origin;
    const url = `${origin}/utilisateurs/detail/${id}`;
    window.open(url, '_blank');
  }
}
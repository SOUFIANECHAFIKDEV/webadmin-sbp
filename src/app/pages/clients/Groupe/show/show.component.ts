import { Component, OnInit, Output, EventEmitter, Input, ViewChild } from '@angular/core';
import { Groupe } from 'app/Models/Entities/Groupe';
import { FormBuilder } from '@angular/forms';
import { GroupesService } from 'app/services/groupe/groupe.service';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { ClientService } from 'app/services/client/client.service';
import { Client } from 'app/Models/Entities/Client';
import * as _ from 'lodash';
declare var toastr: any;
declare var jQuery: any;
declare var swal: any;
@Component({
  selector: 'show-Groupe',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponentGroupe implements OnInit {
  form;


  @Output('refresh') refresh = new EventEmitter();
  @Input('groupe') groupe: Groupe;
  client: any
  listClients: Client[] = [];
  IdChantier
  constructor(
    private fb: FormBuilder,
    private groupesService: GroupesService,
    private translate: TranslateService,
    private clientService: ClientService,
  ) { }

  async ngOnInit() {
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);

    await this.getClients();

    console.log("groupe", this.groupe)
  }

  getClients() {
    this.clientService.GetAll("", 1, AppSettings.NBR_ITEM_PER_PAGE, "nom", "asc").subscribe((res) => {
      this.listClients = res.list.filter(client => client.idGroupe == null);
    });

  }
  async addclientToGroupe() {

    let id = this.IdChantier
    this.client.idGroupe = this.groupe.id;

    try {
      await this.update(this.client);
      this.listClients.forEach((x, index) => {
        if (x.id = this.client.id) {
          this.listClients.splice(index, 0);
        }
      })

      this.refresh.emit();
      this.translate.get('add').subscribe(text => {
        toastr.success(text.msg, text.title, {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
      //afficher msg success
    } catch (ex) {
      //afficher msg d error
      this.translate.get('errors').subscribe(text => {
        toastr.warning(text.serveur, '', {
          positionClass: 'toast-top-center',
          containerId: 'toast-top-center',
        });
      });
    }
  }

  /**
   * Supprimer client pour groupe
   * @param client 
   * @param index 
   */
  async removeClientFromGroupe(client, index) {
    this.translate.get("groupes.delete").subscribe(text => {
      swal({
        title: text.title,
        text: text.questionclient,
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
      }).then(async isConfirm => {
        if (isConfirm) {
          try {
            client.idGroupe = null;
            await this.update(client);
            await this.getClients();
            this.listClients.unshift(client);
            this.groupe.clients.splice(index, 0);
            swal(text.success, "", "success");
            this.refresh.emit();

          } catch (ex) {
            swal(text.error, "", "error");
          }
        } else {
          swal(text.cancel, "", "error");
        }
      });
    });
  }
  update(client: Client) {
    return new Promise((resolve, reject) => {
      this.clientService.Update(client.id, client).subscribe(res => {
        resolve(res)
      }, error => {
        reject(error)
      })
    })

  }
  name: string;


  lgbtnclick() {
    alert(this.name);
    console.log(Error);
  }
  @ViewChild("InputString") public InputString;
  setSelectedClient(value) {

    this.client = value;

  }
}

import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AppSettings } from 'app/app-settings/app-settings';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Memo } from 'app/Models/Entities/Memo';
import { FileManagerModel } from 'app/Models/FileManagerModel';
import { FileManagerService } from 'app/services/fileManager/file-manager.service';
import { PieceJoin } from 'app/Models/Entities/PieceJoint';
import { MenuItem } from 'app/custom-module/primeng/api';
import { Avoir } from 'app/Models/Entities/Avoir';
import { AvoirService } from 'app/services/avoir/avoir.service';
import { CreateAvoir } from 'app/Enums/CreateAvoir.Enum';
import { StatutAvoir } from 'app/Enums/StatutAvoir.Enum';
import { ICalcule } from 'app/calcule/ICalcule';
import { Calcule } from 'app/calcule/Calcule';
import { Client } from 'app/Models/Entities/Client';
import { Chantier } from 'app/Models/Entities/Chantier';
import { ChantierService } from 'app/services/chantier/chantier.service';
import { ClientService } from 'app/services/client/client.service';
import { LoginService } from 'app/services/login/login.service';
import { Historique } from 'app/Models/Entities/Historique';
import { AvoirState } from '../avoir-state';

declare var toastr: any;
declare var jQuery: any;
declare var swal: any;

@Component({
  selector: 'app-show',
  templateUrl: './show.component.html',
  styleUrls: ['./show.component.scss']
})
export class ShowComponent implements OnInit {

  id
  avoir: Avoir;
  historique
  memos: Memo[] = [];
  processIsStarting: boolean = false;
  items: MenuItem[] = []
  statutAvoir: typeof StatutAvoir = StatutAvoir
  loading = false;
  calcule: ICalcule = new Calcule()
  client: Client;
  chantiers: Chantier[] = [];
  statuts: { id: number; label: string; color: string }[];
  articles = [];
  articlesInfo: any = {};
  processing: boolean = false;
  base64 = null
  constructor(
    private translate: TranslateService,
    private avoirService: AvoirService,
    private route: ActivatedRoute,
    private fileManagerService: FileManagerService,
    private router: Router,
    private chantierService: ChantierService,
    private clientService: ClientService,
    private loginService: LoginService,
  ) { }

  async ngOnInit() {
    this.processing = true;
    this.translate.setDefaultLang(AppSettings.lang);
    this.translate.use(AppSettings.lang);
    this.translate
      .get('statuts').subscribe((statuts: { id: number; label: string; color: string }[]) => {
        this.statuts = statuts;
      });
    this.route.params.subscribe(async params => {
      this.id = params["id"];
      this.refresh();
      await this.init(this.id);
      if (this.avoir.idChantier != null) {
        this.client = this.avoir.chantier.client;

      }

    });


  }

  async init(id) {
    this.avoir = await this.getAvoir(id);
    this.historique = JSON.parse(this.avoir.historique);
    //await this.getChantiers('');
    //this.ficheIntervention.idChantier.toString();
    // this.client = await this.loadChantierInformation(this.avoir.idChantier);
    this.memos = this.avoir.memos ? (JSON.parse(this.avoir.memos) as Memo[]) : [];
    this.processing = false;
  }

  getAvoir(id): Promise<Avoir> {
    return new Promise((resolve, reject) => {
      this.avoirService.Get(id).subscribe(
        res => {
          this.avoir = res;
          this.articles = JSON.parse(res.prestations);
          this.historique = JSON.parse(this.avoir.historique) as Historique[];

          resolve(res);
        },
        err => {
          this.translate.get('errors').subscribe(text => {
            toastr.warning(text.serveur, '', {
              positionClass: 'toast-top-center',
              containerId: 'toast-top-center',
            });
          });
        }
      );
    });
  }




  getclientById(idClient): Promise<Client> {
    return new Promise((resolve, reject) => {
      this.clientService.Get(idClient).subscribe(
        res => {
          this.processing = true;
          resolve(res);
          this.processing = false;

        },
        err => {
          reject(err);
        }

      );

    });
  }
  // Enrgister memo
  // async saveMemo(memo: Memo) {
  //   debugger
  //   this.processIsStarting = true;

  //   let files: FileManagerModel[] = memo.pieceJointes.map(PJ => {
  //     let file = new FileManagerModel();
  //     file.base64 = PJ.file;
  //     PJ.file = "";
  //     file.name = PJ.name;
  //     return file;
  //   });

  //   const addFiles = (files): Promise<boolean> => {
  //     return new Promise((resolve, reject) => this.fileManagerService.Add(files).subscribe(res => res ? resolve() : reject(), err => reject()));
  //   };

  //   try {
  //     const memos = [{
  //       commentaire: memo.commentaire,
  //       date: memo.date,
  //       idUser: memo.idUser,
  //       pieceJointes: memo.pieceJointes
  //     }, ...this.memos];

  //     await addFiles(files);

  //     this.avoirService.saveMemos(this.id, "'" + JSON.stringify(memos.toString()) + "'")
  //       .subscribe(res => {
  //         console.log(res);
  //         this.refresh();
  //         this.processIsStarting = false;
  //       })
  //   } catch (err) {
  //     this.translate.get("errors").subscribe(text => {
  //       toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
  //     });
  //   }
  // }

  async saveMemo(memo: Memo) {
    debugger
    this.processIsStarting = true;

    let files: FileManagerModel[] = memo.pieceJointes.map(PJ => {
      let file = new FileManagerModel();
      file.base64 = PJ.file;
      PJ.file = "";
      file.name = PJ.name;
      return file;
    });

    const addFiles = (files): Promise<boolean> => {
      return new Promise((resolve, reject) => this.fileManagerService.Add(files).subscribe(res => res ? resolve() : reject(), err => reject()));
    };

    try {
      const memos = [{
        commentaire: memo.commentaire,
        date: memo.date,
        idUser: memo.idUser,
        pieceJointes: memo.pieceJointes
      }, ...this.memos];

      await addFiles(files);

      this.avoirService.saveMemos(this.id, "'" + JSON.stringify(memos).toString() + "'")
        .subscribe(res => {
          this.memos = memos;
          this.processIsStarting = false;
        })

    } catch (err) {
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    }
  }


  // Telecharger les memos 
  downloadPieceJointe(event) {
    let pieceJointe = event as PieceJoin;
    this.fileManagerService.Get(pieceJointe.name).subscribe(
      value => {
        pieceJointe.file = value['data'] as string;
        AppSettings.downloadBase64(value['data'], pieceJointe.orignalName, pieceJointe.file.substring("data:".length, pieceJointe.file.indexOf(";base64")), pieceJointe.type)
      }
    )
  }

  // Dupliquer avoir
  dupliquerAvoir() {
    AvoirState.avoir = this.avoir;
    this.router.navigate(['/avoirs/ajouter', CreateAvoir.DUPLIQUER]);

  }

  // Refresh avoir aprés l'ajout de paiement ou init component
  refresh() {
    this.items = []
    this.avoirService.Get(this.id).subscribe(
      res => {
        this.avoir = res;
        this.historique = JSON.parse(res.historique);
        this.memos = this.avoir.memos ? JSON.parse(this.avoir.memos) as Memo[] : [];
        this.translate.get("labels").subscribe(text => {
          this.items.push({ label: text.dupliquer, icon: 'pi pi-copy', command: () => { this.dupliquerAvoir(); } })
          this.items.push({ label: text.print, icon: 'pi pi-print', command: () => { this.imprimerPDF(); } })
          // if (this.avoir) {
          //   this.items.push({
          //     label: text.PdfView, icon: 'pi pi-eye', command: () => {
          //       this.generatePDFBase64(this.avoir.id);
          //       jQuery("#PdfView").modal("show");
          //     }
          //   })
          // }
        })
      }
    )
  }

  // generatePDF() {
  //   this.loading = true;
  //   this.avoirService.generatePDF(this.id).subscribe(
  //     res => {
  //       // Get time stamp for fileName.
  //       var stamp = new Date().getTime();

  //       // file type 
  //       var fileType = 'application/pdf';

  //       // file extension
  //       var extension = "pdf";

  //       AppSettings.downloadBase64("," + res, "AV_" + stamp + "." + extension, fileType, extension)
  //       this.loading = false;
  //     }
  //   )
  // }

  // Imprimer pdf 
  imprimerPDF() {
    this.loading = true;
    this.avoirService.generatePDF(this.id).subscribe(
      res => {
        this.loading = false;

        var stamp = new Date().getTime();

        // file type 
        var fileType = 'application/pdf';

        // file data 
        var fileData = AppSettings._base64ToArrayBuffer(res);

        // file extension
        var extension = "pdf";
        let pdfSrc = AppSettings.printPdf(fileData, "AV_" + stamp + "." + extension, fileType, extension);

        // let printwWindow = window.open(pdfSrc);
        // printwWindow.print();

        var objFra = document.createElement('iframe');   // Create an IFrame.
        objFra.style.visibility = "hidden";    // Hide the frame.
        objFra.src = pdfSrc                   // Set source.
        document.body.appendChild(objFra);  // Add the frame to the web page.
        objFra.contentWindow.focus();       // Set focus.
        objFra.contentWindow.print();      // Print it.

      }
    )
  }

  generatePDFBase64(id: number): void {
    this.avoirService.generatePDF(id).subscribe(res => {
      this.base64 = res;
    }, err => {
      jQuery("#PdfView").modal("hide");
      this.translate.get("errors").subscribe(text => {
        toastr.warning('', text.serveur, { positionClass: 'toast-top-center', containerId: 'toast-top-center' });
      });
    });;
  }

}

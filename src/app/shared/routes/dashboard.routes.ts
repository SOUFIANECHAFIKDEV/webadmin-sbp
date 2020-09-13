import { Routes } from '@angular/router';

export const FIXED_NAVBAR_FOOTER_ROUTES: Routes = [

    {
        path: 'dashboard',
        loadChildren: './pages/dashboard/dashboard-page.module#DashboardPagesModule'
    },
    {
        path: 'utilisateurs',
        loadChildren: './pages/users/users.module#UtilisateurModule'
    },
    {
        path: 'clients',
        loadChildren: './pages/clients/clients.module#ClientsModule'
    },
    {
        path: 'fournisseurs',
        loadChildren: './pages/fournisseur/fournisseur.module#FournisseurModule'
    },
    {
        path: 'devis',
        loadChildren: './pages/devis/devis.module#DevisModule'
    },
    // {
    //     path: 'devis',
    //     loadChildren: './pages/devis/devis.module#DevisModule'
    // },

    {
        path: 'produits',
        loadChildren: './pages/Produits/produit.module#ProduitModule'
    },
    {
        path: 'chantiers',
        loadChildren: './pages/chantier/chantier.module#ChantierModule'
    },
    {
        path: 'ficheintervention',
        loadChildren: './pages/ficheintervention/ficheintervention.module#FicheinterventionModule'
    },
    {
        path: 'factures',
        loadChildren: './pages/factures/factures.module#FacturesModule'
    },
    {
        path: 'paiements',
        loadChildren: './pages/paiements/paiements.module#PaiementsModule'
    },

    {
        path: 'avoirs',
        loadChildren: './pages/avoirs/avoirs.module#AvoirsModule'
    },
    /*
     {
        path: 'ficheintervention',
        loadChildren: './pages/ficheintervention/ficheintervention.module#FicheinterventionModule'
    },
    */
    {
        path: 'gammemaintenanceequipements',
        loadChildren: './pages/gamme-maintenance-equipement/gamme-maintenance-equipement.module#GammeMaintenanceEquipementModule'

    },
    {
        path: 'contratentretiens',
        loadChildren: './pages/contartEntretien/contratEntretien.module#ContratEntretienModule'

    },
    //C:\Users\Admin\Documents\webadmin-sbp3\src\app\pages\visiteMaintenence\visiteMaintenance.module.ts
    //C:\Users\Admin\Documents\webadmin-sbp3\src\app\pages\visiteMaintenence\visiteMaintenance.module.ts
    {
        path: 'visitesMaintenance',
        loadChildren: './pages/visiteMaintenence/visiteMaintenance.module#VisiteMaintenanceModule'
    },
    // {
    //     path: 'ficheinterventionmaintenance',
    //     loadChildren: './pages/ficheInterventionMaintenance/ficheinterventionmaintenance.module#FicheInterventionMaintenanceModule'
    // },
    {
        path: 'parameteres',
        loadChildren: './pages/parameteres/parameteres.module#ParameteresModule'
    },

    {
        path: 'lots',
        loadChildren: './pages/Produits/lots/lots.module#LotsModule'
    },

    {
        path: 'groupes',
        loadChildren: './pages/clients/Groupe/Groupe.module#GroupesModule'
        //
    },
    {
        path: 'bonCommandeFournisseur',
        loadChildren: './pages/bonCommandeFournisseur/bonCommandeFournisseur.module#BonCommandeFournisseurModule'
        //
    },

    {
        path: 'depense',
        loadChildren: './pages/depense/depense.module#DepenseModule'
        //
    }
    ,
    {
        path: 'comptabilite',
        loadChildren: './pages/comptabilite/comptabilite.module#ComptabiliteModule'
    }
];
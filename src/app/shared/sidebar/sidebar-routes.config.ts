import { RouteInfo } from './sidebar.metadata';

export const ROUTES: RouteInfo[] = [

    { path: '/dashboard', title: 'Dashboard', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    //--------------Section----------------
    { isTitleSection: true, path: '', title: 'Contatcts', icon: 'fa fa-id-card', class: 'menu-item-section', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },

    { path: '/utilisateurs', title: 'Users', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: false },
    {
        path: '', title: 'Clients', icon: '', class: 'menu-item has-sub', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, actif: true, submenu: [
            { path: '/clients', title: 'Clients', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
            { path: '/groupes', title: 'Groupes', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
        ]
    },
    { path: '/fournisseurs', title: 'Fournisseurs', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    //--------------Section----------------
    { isTitleSection: true, path: '', title: 'Gestion Chantier', icon: 'fa fa-wrench', class: 'menu-item-section', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/chantiers', title: 'Chantiers', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/devis', title: 'Devis', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/ficheintervention', title: 'FicheIntervention', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/factures', title: 'Factures', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/avoirs', title: 'Avoirs', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/bonCommandeFournisseur', title: 'Bon de commande Fournisseur', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/depense', title: 'Dépense', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/paiements', title: 'Paiements', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    //--------------Section----------------
    { isTitleSection: true, path: '', title: 'Gestion maintenance', icon: 'fa fa-stethoscope', class: 'menu-item-section', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/gammemaintenanceequipements', title: 'Gamme de maintenance équipement', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/contratentretiens', title: 'Contrat entretien', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/visitesMaintenance', title: 'Visites de maintenance', icon: 'fa fa-files-o', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },

    // { path: '/ficheinterventionmaintenance', title: 'Fiche intervention maintenance', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    //--------------Section----------------
    { isTitleSection: true, path: '', title: 'Bibliothèque', icon: 'fa fa-cubes', class: 'menu-item-section', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/produits', title: 'Articles', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/lots', title: 'Fournisseurs', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },

    //--------------Section----------------
    { isTitleSection: true, path: '', title: 'Comptabilité', icon: 'fa fa-list-ol', class: 'menu-item-section', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
    { path: '/comptabilite', title: 'Journaux comptables', icon: '', class: 'nav-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },

    { isTitleSection: true, path: '', title: 'Administration', icon: 'fa fa-sliders', class: 'menu-item-section', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },


    {
        path: '', title: 'parameteres', icon: '', class: 'menu-item has-sub', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, actif: true,
        submenu: [
            { path: '/parameteres/numerotationPrefixe', title: 'Numérotations et préfixes', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
            { path: '/parameteres/parametrageDocument', title: 'Paramétrage documents', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
            { path: '/parameteres/modelregelement', title: 'Modes de réglement', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },

            { path: '/parameteres/prix', title: 'Coûts par défaut', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [] },
            { path: '/parameteres/horairetravail', title: 'Horaires du travail', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
            { path: '/parameteres/tva', title: 'Tva par défaut', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },

            { path: '/parameteres/labels', title: 'Labels articles', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
            { path: '/parameteres/typedocument', title: 'Types de document', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },


            { path: '/parameteres/parametragecompte', title: 'Comptes bancaires', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
            { path: '/parameteres/comptabilite', title: 'Comptabilité', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },

            { path: '/parameteres/messagerie', title: 'Messagerie', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
            { path: '/parameteres/synagenda', title: 'Synchronisation agenda google', icon: '', class: 'menu-item', badge: '', badgeClass: '', isExternalLink: false, isNavHeader: false, submenu: [], actif: true },
        ]
    }
];
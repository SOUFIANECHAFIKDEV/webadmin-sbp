export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
    badge: string;
    badgeClass: string;
    isExternalLink: boolean;
    isNavHeader: boolean;
    submenu : RouteInfo[];
    actif?:boolean
    isTitleSection? : boolean;
}

import { UserProfile } from "app/Enums/user-profile.enum";
import { User } from "app/Models/Entities/User";


export class RoleUtils {

  /**
   * check current user is admin of ecolave
   */
  // static isAdminEcolave(): boolean {
  //     const currentUser = this.getUser();
  //     return (currentUser['idProfile'] === UserProfile.superAdmin ||
  //         currentUser['idProfile'] === UserProfile.admin) &&
  //         currentUser.idSociete === AppSettings.idEcolaveSociete;
  // }

  /**
   * check current user is super admin
   * @param currentUser the current user obj
   */
  // static isSuperAdmin(): boolean {
  //     const currentUser = this.getUser();
  //     return currentUser['idProfile'] === UserProfile.superAdmin
  // }

  /**
   * check current user is super admin
   * @param currentUser the current user obj
   */
  // static isFranchise(): boolean {
  //     const currentUser = this.getUser();
  //     return currentUser['idProfile'] === UserProfile.franchise
  // }

  /**
   * check current user is super admin
   * @param currentUser the current user obj
   */
  static isAdmin(): boolean {
    const currentUser = this.getUser();
    return currentUser['idProfile'] === UserProfile.admin
  }

  /**
    * get current user
    */
  static getUser(): User {
    return localStorage.getItem('PDB_USER') != null ? JSON.parse(localStorage.getItem('PDB_USER')) as User : null
  }

  /**
   * check current user is super admin
   * @param currentUser the current user obj
   */
  // static isManager(): boolean {
  //     const currentUser = this.getUser();
  //     return currentUser['idProfile'] === UserProfile.manager
  // }

  /**
   * check current user is super admin
   * @param currentUser the current user obj
   */
  // static isTechnicienRestreint(): boolean {
  //     const currentUser = this.getUser();
  //     return currentUser['idProfile'] === UserProfile.technicienRestreint
  // }

  /**
   * check current user is super admin
   * @param currentUser the current user obj
   */
  // static isClientAdmin(): boolean {
  //     const currentUser = this.getUser();
  //     return currentUser['idProfile'] === UserProfile.clientAdmin
  // }

  /**
   * check current user is super admin
   * @param currentUser the current user obj
   */
  // static isClientUtilisateur(): boolean {
  //     const currentUser = this.getUser();
  //     return currentUser['idProfile'] === UserProfile.clientUtilisateur
  // }

  /**
   * get current user
   */
  // static getUser(): User {
  //     return localStorage.getItem(AppSettings.USER) != null ? JSON.parse(localStorage.getItem(AppSettings.USER)) as User : null
  // }

  /**
   * get current profile
   */
  // static getProfile(): UserProfile {
  //     const currentUser = this.getUser();
  //     return currentUser == null ? '' : currentUser['idProfile'];
  // }

  /**
   * get id franchise from current user
   */
  // static getIdFranchise() {
  //     const currentUser = this.getUser();
  //     return currentUser['idFranchise'];
  // }

  /**
  * get id societe from current user
  */
  // static getIdSociete(): string {
  //     const currentUser = this.getUser();
  //     return currentUser['idSociete'];
  // }

}
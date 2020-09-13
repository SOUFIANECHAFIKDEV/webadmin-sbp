import { UserProfile } from '../../Enums/user-profile.enum';

export class ShowCrudInProduitModule{
    showOrNot():boolean{
        let ECOLAVE_USER = JSON.parse(localStorage.getItem("ECOLAVE_USER"));
        let currentlyUserProfile = ECOLAVE_USER.idProfile;
        let UsersProfiles = UserProfile;
        return (currentlyUserProfile == UsersProfiles.admin );
        // return false
      }
}
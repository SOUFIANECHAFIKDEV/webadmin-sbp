import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './connecter/login.component';
import { RecorverPasswordComponent } from './recorver-password/recorver-password.component';
import { ChangePasswordComponent } from 'app/pages/login/change-password/change-password.component';

const routes: Routes = [{
  path: '',
  children: [
    {
      path: '',
      component: LoginComponent,
      data: {
        title: 'Login'
      }
    },
    {
      path: 'recover-password',
      component: RecorverPasswordComponent,
      data: {
        title: 'Récupérer mot de passe'
      }
    },
    {
      path: 'change-password',
      component: ChangePasswordComponent,
      data: {
        title: 'changer le mote de passe'
      }
    }
  ]
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }

import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {RegisterComponent} from './register/register.component';
import {LoginComponent} from './login/login.component';
import {HomeComponent} from './home/home.component';
import {ProfileComponent} from './profile/profile.component';
import {BoardUserComponent} from './board-user/board-user.component';
import {BoardModeratorComponent} from './board-moderator/board-moderator.component';
import {BoardAdminComponent} from './board-admin/board-admin.component';
import {MenuloginComponent} from './menulogin/menulogin.component';
import {MenuadminComponent} from './admin/menuadmin/menuadmin.component';
import {ResetPasswordComponent} from './reset-password/reset-password.component';
import {ForgetPasswordComponent} from './forget-password/forget-password.component';
import {BadgeComponent} from './badge/badge.component';
import {AuthGuard} from './auth.guard';
import {ComponentComponent} from './admin/component/component.component';
import {PageNotFoundComponent} from './page-not-found/page-not-found.component';
import { CollaborateurGuard } from './guard/collaborateur.guard';

const routes: Routes = [


    {
        path: '',
        component: ComponentComponent,
        loadChildren: () => import ('./admin/admin.module').then((m) => m.AdminModule),
        canActivate: [AuthGuard] // Apply AuthGuard to this route
    },

    
    {
        path: 'collaborateur',
        loadChildren: () => import ('./collaborateur/collaborateur.module').then((m) => m.CollaborateurModule),
        canActivate: [CollaborateurGuard] // Apply AuthGuard to this route
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'register',
        component: RegisterComponent
    },
    {
        path: 'resetpwd',
        component: ResetPasswordComponent
    }, {
        path: 'forgetpwd',
        component: ForgetPasswordComponent
    }, {
        path: '**',
        component: PageNotFoundComponent
    },


    { path: '', component: MenuloginComponent ,
    children: [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'user', component: BoardUserComponent },
    { path: 'mod', component: BoardModeratorComponent },
    // { path: 'admin', component: BoardAdminComponent },
    {path: 'resetpwd', component: ResetPasswordComponent},
    {path: 'forgetpwd', component: ForgetPasswordComponent},
    { path: 'badge', component: BadgeComponent, canActivate: [AuthGuard] }, // Protected route

    ]},

    { path: 'menu', component: MenuadminComponent ,
    children: [
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { path: 'profile', component: ProfileComponent },
    { path: 'user', component: BoardUserComponent },
    { path: 'mod', component: BoardModeratorComponent },
    { path: 'admin', component: BoardAdminComponent },

    ]},
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BadgeComponent } from './badge/badge.component';

const routes: Routes = [

  { path: 'dashboard', component: HomeComponent },
  { path: 'badge', component: BadgeComponent },


];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollaborateurRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { BadgeComponent } from './badge/badge.component';
import { AttestaionsComponent } from './attestaions/attestaions.component';
import { MaladeComponent } from './malade/malade.component';
import { QuestionsRhComponent } from './questions-rh/questions-rh.component';

const routes: Routes = [

  { path: 'dashboard', component: HomeComponent },
  { path: 'badge', component: BadgeComponent },
  { path: 'attestaions', component: AttestaionsComponent },
  { path: 'malade', component: MaladeComponent },
  { path: 'questionsRh', component: QuestionsRhComponent },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CollaborateurRoutingModule { }

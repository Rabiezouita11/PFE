import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollaborateurRoutingModule } from './collaborateur-routing.module';
import { HomeComponent } from './home/home.component';
import { BadgeComponent } from './badge/badge.component';


@NgModule({
  declarations: [HomeComponent, BadgeComponent],
  imports: [
    CommonModule,
    CollaborateurRoutingModule
  ]
})
export class CollaborateurModule { }

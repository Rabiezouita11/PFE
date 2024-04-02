import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollaborateurRoutingModule } from './collaborateur-routing.module';
import { HomeComponent } from './home/home.component';


@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    CollaborateurRoutingModule
  ]
})
export class CollaborateurModule { }

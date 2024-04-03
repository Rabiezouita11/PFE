import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollaborateurRoutingModule } from './collaborateur-routing.module';
import { HomeComponent } from './home/home.component';
import { BadgeComponent } from './badge/badge.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';


@NgModule({
  declarations: [HomeComponent, BadgeComponent],
  imports: [
    CommonModule,
    CollaborateurRoutingModule,
    FormsModule
  ]
})
export class CollaborateurModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CollaborateurRoutingModule } from './collaborateur-routing.module';
import { HomeComponent } from './home/home.component';
import { BadgeComponent } from './badge/badge.component';
import { FormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MaladeComponent } from './malade/malade.component';
import { AttestaionsComponent } from './attestaions/attestaions.component';
import { QuestionsRhComponent } from './questions-rh/questions-rh.component';


@NgModule({
  declarations: [HomeComponent, BadgeComponent, MaladeComponent, AttestaionsComponent, QuestionsRhComponent],
  imports: [
    CommonModule,
    CollaborateurRoutingModule,
    FormsModule
  ]
})
export class CollaborateurModule { }

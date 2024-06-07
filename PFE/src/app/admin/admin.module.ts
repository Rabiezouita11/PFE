import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { ComponentComponent } from './component/component.component';
import { SidbarComponent } from './sidbar/sidbar.component';
import { FooterComponent } from './footer/footer.component';
import { BadgeComponent } from './badge/badge.component';
import { AbsencesComponent } from './absences/absences.component';
import { QuestionsRhComponent } from './questions-rh/questions-rh.component';
import { AttestationsComponent } from './attestations/attestations.component';
import { FormsModule } from '@angular/forms';
import { UsersComponent } from './users/users.component';
import { NavComponent } from './nav/nav.component';
import { DemandeAttestationsComponent } from './demande-attestations/demande-attestations.component';


@NgModule({
  declarations: [DashboardComponent, HeaderComponent, ComponentComponent, SidbarComponent, FooterComponent, BadgeComponent, AbsencesComponent, QuestionsRhComponent, AttestationsComponent, UsersComponent, NavComponent, DemandeAttestationsComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    FormsModule
  ],
  exports: [HeaderComponent, FooterComponent],

})
export class AdminModule { }

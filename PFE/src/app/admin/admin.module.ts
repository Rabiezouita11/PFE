import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { ComponentComponent } from './component/component.component';
import { SidbarComponent } from './sidbar/sidbar.component';
import { FooterComponent } from './footer/footer.component';


@NgModule({
  declarations: [DashboardComponent, HeaderComponent, ComponentComponent, SidbarComponent, FooterComponent],
  imports: [
    CommonModule,
    AdminRoutingModule
  ],
  exports: [HeaderComponent, FooterComponent],

})
export class AdminModule { }

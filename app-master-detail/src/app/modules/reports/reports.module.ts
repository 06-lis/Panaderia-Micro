import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReportsRoutingModule } from './reports-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FormsModule } from '@angular/forms';
import { ChartModule } from 'primeng/chart';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    FormsModule,
    ChartModule,
    CalendarModule,
    DropdownModule
  ]
})
export class ReportsModule { }

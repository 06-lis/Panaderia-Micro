import { ChangeDetectionStrategy, Component } from '@angular/core';


import { RouterModule } from '@angular/router';
// import { CustomerListComponent } from "./customer-list/customer-list.component";

@Component({
  selector: 'app-customer',
  imports: [
    RouterModule,
    // CustomerListComponent
],
  templateUrl: './customer.component.html',
  styleUrl: './customer.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerComponent { }

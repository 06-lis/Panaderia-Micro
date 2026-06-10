import { ChangeDetectionStrategy, Component, Input, OnInit} from '@angular/core';


import { MenuItem, PrimeIcons } from 'primeng/api';
// import {  } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { BadgeModule } from 'primeng/badge';
import { RippleModule } from 'primeng/ripple';
import { AvatarModule } from 'primeng/avatar';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-sidebar',
  imports: [
    RouterModule,
    MenuModule, BadgeModule, RippleModule, AvatarModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  @Input({ required: true }) icon!: string;
  @Input({ required: true }) title!: string;
  @Input({ required: true }) description!: string;
  @Input({ required: true }) path!: string;


}

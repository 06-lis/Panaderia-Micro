import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-sale',
  imports: [
    RouterOutlet
  ],
  templateUrl: './sale.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SaleComponent { }

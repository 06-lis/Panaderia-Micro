import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-product-edit',
  imports: [],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductEditComponent { }

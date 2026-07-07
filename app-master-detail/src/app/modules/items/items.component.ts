import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabsModule } from 'primeng/tabs';
import { ProductComponent } from '../product/product.component';
import { InsumoComponent } from '../insumo/insumo.component';
import { CategoryListComponent } from '../category/category-list/category-list.component';

@Component({
  selector: 'app-items',
  standalone: true,
  imports: [
    CommonModule, 
    TabsModule, 
    ProductComponent, 
    InsumoComponent, 
    CategoryListComponent
  ],
  templateUrl: './items.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ItemsComponent {}

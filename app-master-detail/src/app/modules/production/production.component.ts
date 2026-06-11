import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RecipeListComponent } from './recipe-list/recipe-list.component';
import { RecipeFormComponent } from './recipe-form/recipe-form.component';
import { ProductionListComponent } from './production-list/production-list.component';
import { ProductionFormComponent } from './production-form/production-form.component';

@Component({
  selector: 'app-production',
  standalone: true,
  imports: [
    CommonModule,
    RecipeListComponent,
    RecipeFormComponent,
    ProductionListComponent,
    ProductionFormComponent
  ],
  templateUrl: './production.component.html',
  styleUrl: './production.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductionComponent implements OnInit {
  currentTab: 'orders' | 'recipes' = 'orders';
  currentView: 'list' | 'add-recipe' | 'add-order' = 'list';

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {}

  setTab(tab: 'orders' | 'recipes'): void {
    this.currentTab = tab;
    this.currentView = 'list';
    this.cdr.markForCheck();
  }

  setView(view: 'list' | 'add-recipe' | 'add-order'): void {
    this.currentView = view;
    this.cdr.markForCheck();
  }
}

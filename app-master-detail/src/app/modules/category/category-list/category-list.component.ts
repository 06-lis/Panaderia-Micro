import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Category } from '../../../interfaces/category.interface';
import { CommonModule } from '@angular/common';
import { CategoryService } from '../service/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-category-list',
  imports: [
    CommonModule
  ],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryListComponent implements OnInit{

  constructor(
    private categoriaService:CategoryService,
    private cdr: ChangeDetectorRef,
    private router: Router // Inyectar el router
  ){}
  ngOnInit(): void {
    this.loadCategoira();
  }
  @Input() public categories: Category[] = [];
  loadCategoira():void{
    this.categoriaService.getCategoryAll().subscribe(
      (data) => {
        this.categories = data;
        console.log('Categorias cargadas:',this.categories);
        this.cdr.markForCheck();
      }
    );
  }

  agregarCategoria():void{
    this.router.navigate(['/dashboard/category/add']);
  }
}

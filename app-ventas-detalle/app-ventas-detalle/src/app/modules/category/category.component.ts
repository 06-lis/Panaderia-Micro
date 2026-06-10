import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CategoryListComponent } from "./category-list/category-list.component";
import { CategoryAddComponent } from "./category-add/category-add.component";
import { Category } from '../../interfaces/category.interface';
import { CategoryService } from './service/category.service';

@Component({
  selector: 'app-category',
  imports: [
    CategoryListComponent,
    CategoryAddComponent
],
  templateUrl: './category.component.html',
  styleUrl: './category.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryComponent implements OnInit{
  categories:Category[]=[];
  errorMessage: string | null = null;

  constructor(
    private categoryService:CategoryService,
     private cdr: ChangeDetectorRef
  ){}
  ngOnInit(): void {
    this.categoryService.getCategoryAll().subscribe(
      (data)=>{
        this.categories=data;
        console.log('Categorias cargadas:', this.categories);
        this.errorMessage = null;
        this.cdr.markForCheck();
      },
      ()=>{
        this.errorMessage = 'Hubo un error al cargar las categorias';
        this.cdr.markForCheck();
      }
    );
  }



 }

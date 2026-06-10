import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { RolListComponent } from './rol-list/rol-list.component';
import { RolService } from './rol.service';
import { Rol } from '../../interfaces/rol.interface';
import { RolAddComponent } from "./rol-add/rol-add.component";

@Component({
  selector: 'app-rol',
  imports: [
    RolListComponent,
    // RolAddComponent
],
  templateUrl: './rol.component.html',
  styleUrl: './rol.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RolComponent implements OnInit{
  roles: Rol[]=[];
  errorMessage: string | null = null;

  constructor(
      private rolService:RolService,
      private cdr: ChangeDetectorRef
    ){}
    ngOnInit(): void {
      this.loadRol();
    }

    loadRol():void{
      this.rolService.getRoles().subscribe(
        (data) => {
          this.roles = data;
          console.log('Roles cargados:', this.roles);
          this.errorMessage = null;
          this.cdr.markForCheck();
        },
        (error) => {
          this.errorMessage = 'Hubo un error al cargar los roles';
          this.cdr.markForCheck();
        }
      );
    }
 }

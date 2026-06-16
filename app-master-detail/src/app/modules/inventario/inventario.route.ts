import { Routes } from '@angular/router';
import { LotesComponent } from './lotes/lotes.component';
import { MovimientosComponent } from './movimientos/movimientos.component';
import { TraspasosComponent } from './traspasos/traspasos.component';
import { ConfiguracionComponent } from './configuracion/configuracion.component';

export const inventario_routes: Routes = [
  {
    path: 'lotes',
    component: LotesComponent,
  },
  {
    path: 'movimientos',
    component: MovimientosComponent,
  },
  {
    path: 'traspasos',
    component: TraspasosComponent,
  },
  {
    path: 'configuracion',
    component: ConfiguracionComponent,
  },
  {
    path: '',
    redirectTo: 'lotes',
    pathMatch: 'full',
  }
];

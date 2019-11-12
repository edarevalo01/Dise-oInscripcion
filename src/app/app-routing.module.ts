import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PregradoComponent } from './components/pregrado/pregrado.component';
import { PregradoContinuarComponent } from './components/pregrado-continuar/pregrado-continuar.component';


const routes: Routes = [
  { path: '',
    redirectTo: '/pregrado',
    //redirectTo: '/pregrado',
    pathMatch: 'full'
  },
   {
     //path: 'pregrado', 
     path: 'pregrado', 
     component: PregradoComponent
   },
   {
     path: 'pregrado-continuar',
     component: PregradoContinuarComponent
   }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }

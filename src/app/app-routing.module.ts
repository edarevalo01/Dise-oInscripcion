import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { PregradoComponent } from "./components/pregrado/pregrado.component";
import { PregradoContinuarComponent } from "./components/pregrado-continuar/pregrado-continuar.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "/inscripcion",
    pathMatch: "full"
  },
  {
    path: "inscripcion",
    component: PregradoComponent
  },
  {
    path: "continuar",
    component: PregradoContinuarComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })], //Produccion
  // ng build --prod --output-hashing=none
  //imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { Component } from "@angular/core";
import { UrlTree, Router } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "InscripcionLasalle";
  formReducido: boolean = false;
  formPeq: boolean = false;
  pantalla: number = 8;
  altura: number = 0;
  gridClass: string = "";

  constructor(private router: Router) {
    var paramUrl = this.obtenerParametro("programa");
    if (paramUrl != 0) {
      this.formReducido = true;
      this.formPeq = true;
      this.pantalla = 6;
      this.altura = 860;
      this.gridClass = "grid-styles-reducido";
    } else {
      this.pantalla = window.innerWidth <= 540 ? 6 : 8;
      this.resize();
    }
  }

  public onResize(event) {
    if (!this.formReducido) {
      this.pantalla = event.target.innerWidth <= 540 ? 6 : 8;
      this.resize();
    }
  }

  resize() {
    if (this.pantalla == 6) {
      this.formPeq = true;
      this.gridClass = "grid-styles-reducido";
      this.altura = 860;
    } else {
      this.formPeq = false;
      this.gridClass = "grid-styles-complete";
      this.altura = 663;
    }
  }

  public obtenerParametro(name: string) {
    const results = new RegExp("[?&]" + name + "=([^&#]*)").exec(window.location.href);
    if (!results) {
      return 0;
    }
    return results[1] || 0;
  }
}

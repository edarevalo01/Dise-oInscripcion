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

  constructor(private router: Router) {
    var paramUrl = this.obtenerParametro("programa");
    if (paramUrl != 0) {
      this.formReducido = true;
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

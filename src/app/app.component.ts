import { Component } from "@angular/core";
import { UrlTree, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent {
  title = "InscripcionLasalle";
  formReducido: boolean = false;
  public parametrosCookie: any;
  public darkMode: boolean = false;

  constructor(private router: Router, private cookieService: CookieService) {
    this.parametrosCookie = this.cookieService.get("dOdYDja");
    if (this.parametrosCookie) {
      this.parametrosCookie = JSON.parse(this.parametrosCookie);
    } else {
      this.parametrosCookie = {
        lead_source: "sepRebr5",
        programa: "",
        dark_mode: 0 //0 no, 1 si
      };
    }
    this.darkMode = this.parametrosCookie.dark_mode == 1;
    if (this.parametrosCookie.programa != "") {
      this.formReducido = true;
    }
  }
}

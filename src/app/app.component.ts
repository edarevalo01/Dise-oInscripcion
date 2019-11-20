import { Component, DoCheck } from "@angular/core";
import { UrlTree, Router } from "@angular/router";
import { CookieService } from "ngx-cookie-service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"]
})
export class AppComponent implements DoCheck {
  title = "InscripcionLasalle";
  formReducido: boolean = false;
  public parametrosCookie: any;
  public darkMode: boolean = false;

  constructor(private router: Router, private cookieService: CookieService) {
    this.parametrosCookie = this.cookieService.get("dOdY5Dj1a");
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

  changeColor() {
    var prms = {
      lead_source: this.parametrosCookie.lead_source,
      programa: this.parametrosCookie.programa,
      dark_mode: this.parametrosCookie.dark_mode == 0 ? 1 : 0 //0 no, 1 si
    };
    this.cookieService.set("dOdY5Dj1a", JSON.stringify(prms));
    console.log(prms);
  }

  ngDoCheck(): void {
    this.parametrosCookie = this.cookieService.get("dOdY5Dj1a");
    if (this.parametrosCookie) {
      this.parametrosCookie = JSON.parse(this.parametrosCookie);
      this.darkMode = this.parametrosCookie.dark_mode == 1;
    }
  }
}

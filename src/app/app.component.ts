import { Component } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
declare let gtag: Function;

@Component({
	selector: "app-root",
	templateUrl: "./app.component.html",
	styleUrls: ["./app.component.scss"]
})
export class AppComponent {
	title = "InscripcionLasalle";

	public formReducido: boolean = false;
	public parametrosUrl: any;
	public darkMode: boolean = false;

	constructor(private route: ActivatedRoute, private router: Router) {
		this.parametrosUrl = this.route.snapshot.queryParams;

		this.route.queryParams.forEach((parametro) => {
			if (parametro.programa) {
				this.formReducido = true;
			} else {
				this.formReducido = false;
			}

			if (parametro.dark_mode) {
				this.darkMode = parametro.dark_mode == 1;
			} else {
				this.darkMode = false;
			}
		});

		this.router.events.subscribe((e) => {
			if (e instanceof NavigationEnd) {
				console.log(e.urlAfterRedirects);
				gtag("config", "UA-159836892-1", { page_path: e.urlAfterRedirects });
			}
		});
	}
}

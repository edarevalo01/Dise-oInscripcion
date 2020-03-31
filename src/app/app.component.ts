import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

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

	constructor(private route: ActivatedRoute) {
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
	}
}

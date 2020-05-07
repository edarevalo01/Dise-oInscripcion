import { Component, OnInit } from "@angular/core";
import { PregradoService } from "src/app/services/pregrado.service";
import { ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";
import { CookieService } from "ngx-cookie-service";
import { StringResourceHelper } from "src/app/models/string-resource-helper";
import { Mensaje } from "src/app/models/Mensaje";

@Component({
	selector: "app-gracias",
	templateUrl: "./gracias.component.html",
	styleUrls: ["./gracias.component.scss"]
})
export class GraciasComponent implements OnInit {
	public stringHelper: StringResourceHelper;
	public tituloGracias: string = "";
	public mensajeGracias: string = "";
	public registrarInscripcionForm: any;
	public mensaje: Mensaje = new Mensaje();
	public pantalla: number = 2;

	mensajeService: any;
	public parametrosUrl: any;

	constructor(private services: PregradoService, private cookieService: CookieService, private route: ActivatedRoute) {
		this.stringHelper = new StringResourceHelper("titulos-mensajes");

		this.mensajeService = services.getMensajeGracias();

		this.parametrosUrl = this.route.snapshot.queryParams;
		if (!this.tituloGracias && !this.mensajeGracias && !this.parametrosUrl.redirect) {
			document.location.href = "https://www.lasalle.edu.co/";
		}

		if (this.parametrosUrl.redirect) {
			this.registrarInscripcionForm = JSON.parse(sessionStorage.getItem("gtifmp0t"));
			this.tituloGracias = this.registrarInscripcionForm.ftitGracias;
			this.mensajeGracias = this.registrarInscripcionForm.ftitmsgGracias;

			if (this.parametrosUrl.redirect == 2) {
				setTimeout(function () {
					this.document.location.href = environment.urlPaginaUniver;
				}, 2000);
			} else {
				var tipo = this.registrarInscripcionForm.ftipo;
				var programa = this.registrarInscripcionForm.fprograma;
				var documento = this.registrarInscripcionForm.fdocumento;
				this.finalRedireccion(tipo, documento, programa);
			}
		} else {
			this.registrarInscripcionForm = JSON.parse(sessionStorage.getItem("gtifmp0t"));
			this.tituloGracias = this.registrarInscripcionForm.ftitGracias;
			this.mensajeGracias = this.registrarInscripcionForm.ftitmsgGracias;

			if (this.registrarInscripcionForm.fgrado == "e") {
				setTimeout(function () {
					this.document.location.href = environment.urlPaginaUniver;
				}, 2000);
			} else {
				var tipo = this.registrarInscripcionForm.ftipo;
				var programa = this.registrarInscripcionForm.fprograma;
				var documento = this.registrarInscripcionForm.fdocumento;
				this.finalRedireccion(tipo, documento, programa);
			}
		}
	}

	finalRedireccion(tipo: string, documento: string, programa: string) {
		this.cookieService.delete(environment.cookiePregrado);
		this.cookieService.delete(environment.cookiePosgrado);
		if (tipo == "1") {
			var datos = {
				doc: documento,
				fac: {
					codigo: programa,
					inscripcion: this.registrarInscripcionForm.finscripcion,
					contacto: this.registrarInscripcionForm.fcontacto,
					correo: this.registrarInscripcionForm.fcorreo,
					nombre: this.registrarInscripcionForm.fnombre,
					fa: this.registrarInscripcionForm.ffa
				}
			};
			this.cookieService.set(environment.cookiePregrado, JSON.stringify(datos), 15 / 1440, "/", environment.dominio);
			setTimeout(function () {
				this.document.location.href = environment.urlPregrado;
			}, 2000);
		} else if (tipo == "2") {
			var datosPos = {
				doc: documento,
				fac: programa.substring(0, 2),
				jor: programa.substring(2, 3)
			};
			this.cookieService.set(environment.cookiePosgrado, JSON.stringify(datosPos), 15 / 1440, "/", environment.dominio);
			setTimeout(function () {
				this.document.location.href = environment.urlPosgrado;
			}, 2000);
		} else if (tipo == "3") {
			setTimeout(function () {
				this.document.location.href = environment.urlDoctorados.replace("?1", programa.substring(0, 1)).replace("?2", documento);
			}, 2000);
		}
	}

	public onResize(event) {
		this.pantalla = event.target.innerWidth <= 800 ? 1 : 2;
	}

	forzarContinuar() {
		var tipo = this.registrarInscripcionForm.ftipo;
		var programa = this.registrarInscripcionForm.fprograma;
		var documento = this.registrarInscripcionForm.fdocumento;
		this.finalRedireccion(tipo, documento, programa);
	}

	ngOnInit() {
		this.pantalla = window.innerWidth <= 800 ? 1 : 2;
	}
}

import { Component, OnInit } from "@angular/core";
import { PregradoService } from "src/app/services/pregrado.service";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { FormGroup } from "@angular/forms";
import { Programa } from "src/app/models/Programa";
import { CookieService } from "ngx-cookie-service";
import { StringResourceHelper } from "src/app/models/string-resource-helper";
import { Mensaje } from "src/app/models/Mensaje";

@Component({
	selector: "app-gracias",
	templateUrl: "./gracias.component.html",
	styleUrls: ["../pregrado/pregrado.component.scss"]
})
export class GraciasComponent implements OnInit {
	public stringHelper: StringResourceHelper;
	tituloGracias: string = "";
	mensajeGracias: string = "";
	registrarInscripcionForm: any;
	public mensaje: Mensaje = new Mensaje();
	public pantalla: number = 2;

	mensajeService: any;
	public parametrosUrl: any;

	constructor(
		private services: PregradoService,
		private cookieService: CookieService,
		private route: ActivatedRoute,
		private router: Router
	) {
		this.stringHelper = new StringResourceHelper("titulos-mensajes");
		this.mensajeService = services.getMensajeGracias();
		this.tituloGracias = this.mensajeService.titMensaje;
		this.mensajeGracias = this.mensajeService.mensajeGracias;
		this.parametrosUrl = this.route.snapshot.queryParams;
		if (!this.tituloGracias && !this.mensajeGracias && !this.parametrosUrl.redirect) {
			document.location.href = "https://www.lasalle.edu.co/";
		}
		if (this.parametrosUrl.redirect) {
			this.registrarInscripcionForm = JSON.parse(sessionStorage.getItem("gtifmp0t"));
			this.tituloGracias = this.registrarInscripcionForm.ftitGracias;
			this.mensajeGracias = this.registrarInscripcionForm.ftitmsgGracias;
			if (this.parametrosUrl.redirect == 2) {
				setTimeout(function() {
					this.document.location.href = environment.urlPaginaUniver;
				}, 5000);
			} else {
				this.registrarInscripcionForm = JSON.parse(sessionStorage.getItem("gtifmp0t"));
				var tipo = this.registrarInscripcionForm.ftipo;
				var programa = this.registrarInscripcionForm.fprograma;
				var documento = this.registrarInscripcionForm.fdocumento;
				this.tituloGracias = this.registrarInscripcionForm.ftitGracias;
				this.mensajeGracias = this.registrarInscripcionForm.ftitmsgGracias;
				if ("3" != tipo) {
					if ("1" == tipo || "2" == tipo) {
						services.validarContinuar(documento, programa.substring(0, 2), programa.substring(2, 3)).subscribe(
							(tiposObs) => {
								this.mensaje = tiposObs;
								if ("fail" != tiposObs.status && "go" == tiposObs.status) {
									if ("1" == tipo) {
										if (!this.cookieService.get(environment.cookiePregrado)) {
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
											this.cookieService.set(
												environment.cookiePregrado,
												JSON.stringify(datos),
												15 / 1440,
												"/",
												environment.dominio
											);
										}
										setTimeout(function() {
											this.document.location.href = environment.urlPregrado;
										}, 5000);
									}
									if ("2" == tipo) {
										if (!this.cookieService.get(environment.cookiePosgrado)) {
											var datosPos = {
												doc: documento,
												fac: programa.substring(0, 2),
												jor: programa.substring(2, 3)
											};
											this.cookieService.set(
												environment.cookiePosgrado,
												JSON.stringify(datosPos),
												15 / 1440,
												"/",
												environment.dominio
											);
										}
										setTimeout(function() {
											this.document.location.href = environment.urlPosgrado;
										}, 5000);
									}
								} else {
									this.tituloGracias = this.stringHelper.getResource("titMensaje");
									this.mensajeGracias = this.mensaje.mensaje;
									//this.openMensajes(this.stringHelper.getResource("titMensaje"), this.mensaje.mensaje, 0);
								}
							},
							(error) => {}
						);
					}
				} else {
					setTimeout(function() {
						this.document.location.href = environment.urlDoctorados
							.replace("?1", programa.substring(0, 1))
							.replace("?2", documento);
					}, 5000);
				}
			}
		}
	}

	public onResize(event) {
		this.pantalla = event.target.innerWidth <= 540 ? 1 : 2;
	}

	forzarContinuar() {
		this.registrarInscripcionForm = JSON.parse(sessionStorage.getItem("gtifmp0t"));
		var tipo = this.registrarInscripcionForm.ftipo;
		var programa = this.registrarInscripcionForm.fprograma;
		var documento = this.registrarInscripcionForm.fdocumento;
		console.log(tipo);
		if ("1" == tipo) {
			console.log("aca");
			if (!this.cookieService.get(environment.cookiePregrado)) {
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
			}
			setTimeout(function() {
				this.document.location.href = environment.urlPregrado;
			}, 0);
		}
		if ("2" == tipo) {
			console.log("si no aca");
			if (!this.cookieService.get(environment.cookiePosgrado)) {
				var datosPos = {
					doc: documento,
					fac: programa.substring(0, 2),
					jor: programa.substring(2, 3)
				};
				this.cookieService.set(environment.cookiePosgrado, JSON.stringify(datosPos), 15 / 1440, "/", environment.dominio);
			}
			setTimeout(function() {
				this.document.location.href = environment.urlPosgrado;
			}, 0);
		}
		if ("3" == tipo) {
			console.log("ooo si no aca");
			setTimeout(function() {
				this.document.location.href = environment.urlDoctorados.replace("?1", programa.substring(0, 1)).replace("?2", documento);
			}, 0);
		}
	}

	ngOnInit() {
		this.pantalla = window.innerWidth <= 540 ? 1 : 2;
	}
}

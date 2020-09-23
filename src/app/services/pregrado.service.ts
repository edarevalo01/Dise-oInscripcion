import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable } from "rxjs";
import { Programa } from "../models/Programa";
import { Mensaje } from "../models/Mensaje";
import { FormGroup } from "@angular/forms";

const httpOptions = {
	headers: new HttpHeaders({
		"Content-Type": "application/json"
	})
};

@Injectable({
	providedIn: "root"
})
export class PregradoService {
	private programas: Observable<Programa[]>;
	private mensaje: Observable<Mensaje>;
	private mensajesGracias: any = {
		titMensaje: "",
		mensajeGracias: ""
	};
	private formRegistro: FormGroup;
	private programaSelected: Programa;

	constructor(private http: HttpClient) {}

	//programas por tipo
	public getProgramasByTipo(tipo: string): Observable<Programa[]> {
		this.programas = this.http.get<Programa[]>(environment.urlBackend + tipo + "/" + environment.getProgramas);
		return this.programas;
	}

	//validar continuar
	public validarContinuar(documento: string, programa: string, jornada: string): Observable<Mensaje> {
		var urlC = "";
		if (!jornada) {
			var vDoc = "";
			switch (programa[0]) {
				case "1":
					vDoc = "DA";
					break;
				case "2":
					vDoc = "DE";
					break;
				case "3":
					vDoc = "ET";
					break;
			}
			urlC = environment.urlBackend + documento + "/" + vDoc + "/" + programa[1] + "/continuar.json";
		} else {
			urlC = environment.urlBackend + documento + "/" + programa + "/" + jornada + "/continuar.json";
		}
		this.mensaje = this.http.get<Mensaje>(urlC);
		return this.mensaje;
	}

	//guardar parte 1
	public guardarParte1(inter: FormGroup, progSelected: Programa, captcha: string, lead_source: string): Observable<Mensaje> {
		var tipo = inter.controls.tipoSelected.value;
		var tipoPrograma: string;
		var programa: string;
		var jornada: string;
		if (tipo != "3") {
			programa = inter.controls.programaSelected.value.substring(0, 2);
			jornada = inter.controls.programaSelected.value.substring(2, 3);
			if (tipo == "1") {
				tipoPrograma = "0";
			} else if (tipo == "2") {
				tipoPrograma = "1";
			}
		} else {
			programa = inter.controls.programaSelected.value.substring(0, 1) == "1" ? "DA" : "DE";
			jornada = inter.controls.programaSelected.value.substring(1, 2);
		}
		let nombres = inter.controls.primerNombre.value.trim().split(" ");
		let primerNombre = nombres[0];
		nombres.splice(0, 1);
		let segundoNombre = nombres.join(" ");

		let apellidos = inter.controls.primerApellido.value.trim().split(" ");
		let primerApellido = apellidos[0];
		apellidos.splice(0, 1);
		let segundoApellido = apellidos.join(" ");

		var interesado = {
			primerNombre: primerNombre
				.toUpperCase()
				.trim()
				.normalize("NFD")
				.replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, "$1")
				.normalize(),
			segundoNombre:
				null == segundoNombre
					? null
					: segundoNombre
							.toUpperCase()
							.trim()
							.normalize("NFD")
							.replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, "$1")
							.normalize(),
			primerApellido: primerApellido
				.toUpperCase()
				.trim()
				.normalize("NFD")
				.replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, "$1")
				.normalize(),
			segundoApellido:
				null == segundoApellido
					? null
					: segundoApellido
							.toUpperCase()
							.trim()
							.normalize("NFD")
							.replace(/([^n\u0300-\u036f]|n(?!\u0303(?![\u0300-\u036f])))[\u0300-\u036f]+/gi, "$1")
							.normalize(),
			tipoDocumento: inter.controls.tipoDocumentoSelected.value,
			documento: inter.controls.documento.value.trim(),
			email: inter.controls.correo.value.trim(),
			movil: inter.controls.celular.value.trim(),
			tipoPrograma: tipoPrograma,
			jornada: jornada,
			programa: programa,
			contactoUA: progSelected.contacto,
			origen: lead_source,
			captcha: captcha
		};

		this.mensaje = this.http.post<Mensaje>(
			environment.urlBackend + environment.guardarParte1,
			JSON.stringify(interesado),
			httpOptions
		);
		return this.mensaje;
	}

	setMensajeGracias(tituloMensaje: string, mensaje: string) {
		this.mensajesGracias.titMensaje = tituloMensaje;
		this.mensajesGracias.mensajeGracias = mensaje;
	}

	getMensajeGracias(): any {
		return this.mensajesGracias;
	}

	setFormRegistro(formRegistro: FormGroup, programa: Programa) {
		this.formRegistro = formRegistro;
		this.programaSelected = programa;
	}

	getFormRegistro(): FormGroup {
		return this.formRegistro;
	}

	getPrograma(): Programa {
		return this.programaSelected;
	}
}

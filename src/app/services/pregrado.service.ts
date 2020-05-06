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
		var interesado = {
			primerNombre: inter.controls.primerNombre.value.toUpperCase().trim(),
			segundoNombre: null == inter.controls.segundoNombre.value ? null : inter.controls.segundoNombre.value.toUpperCase().trim(),
			primerApellido: inter.controls.primerApellido.value.toUpperCase().trim(),
			segundoApellido:
				null == inter.controls.segundoApellido.value ? null : inter.controls.segundoApellido.value.toUpperCase().trim(),
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

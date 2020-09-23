import { Component, OnInit, Inject } from "@angular/core";
import { TipoDocumento } from "src/app/models/TipoDocumento";
import { TipoPrograma } from "src/app/models/TipoPrograma";
import { Programa } from "src/app/models/Programa";
import { PregradoService } from "src/app/services/pregrado.service";
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Router, ActivatedRoute } from "@angular/router";
import { environment } from "src/environments/environment";
import { Mensaje } from "src/app/models/Mensaje";
import { CookieService } from "ngx-cookie-service";
import { DOCUMENT } from "@angular/common";
import { StringResourceHelper } from "src/app/models/string-resource-helper";
import { stringify } from "querystring";

export class MyErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		const isSubmitted = form && form.submitted;
		return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
	}
}

export interface DialogData {
	mensaje: string;
	titulo: string;
	opcion: number;
}

@Component({
	selector: "app-pregrado",
	templateUrl: "./pregrado.component.html",
	styleUrls: ["./pregrado.component.scss"]
})
export class PregradoComponent implements OnInit {
	public stringHelper: StringResourceHelper;

	public tiposDocumento: TipoDocumento[] = [
		{ codigo: "T", nombre: "TI - Tarjeta de identidad" },
		{ codigo: "C", nombre: "CC - Cédula de ciudadanía" },
		{ codigo: "P", nombre: "PS - Pasaporte" }
	];
	public tipoDocumentoSelected: string;

	public tiposPrograma: TipoPrograma[] = [
		{ codigo: "1", nombre: "PREGRADO" },
		{ codigo: "2", nombre: "POSGRADO" },
		{ codigo: "3", nombre: "DOCTORADO" }
	];
	public parametrosUrl: any = null;
	public darkMode: boolean = false;
	public pantalla: number;

	public registrarInscripcionForm: FormGroup;
	public captchaForm: FormGroup;

	public siteKey: string;
	public programs: Programa[] = [];
	public msgHabeasData: string = "";
	public programaSelected: Programa;
	public mensaje: Mensaje = new Mensaje();
	public dialogRef: any;
	public progSelected: any;
	public tipSelected: string = "";
	public loading: boolean = false;

	public formReducido: boolean = false;
	public leadSource: string = "";
	public responsive: boolean = false;
	public progress: boolean = false;

	constructor(
		private pregradoServ: PregradoService,
		private formBuilder: FormBuilder,
		private dialog: MatDialog,
		private router: Router,
		private route: ActivatedRoute,
		private cookieService: CookieService,
		@Inject(DOCUMENT) private document: Document
	) {
		this.stringHelper = new StringResourceHelper("titulos-mensajes");
		sessionStorage.clear();

		this.msgHabeasData = this.stringHelper.getResource("msgHabeasData");
		this.registrarInscripcionForm = this.formBuilder.group({
			primerNombre: ["", [Validators.required, Validators.pattern("^[a-zA-Z0-9ñáéíóúÁÉÍÓÚ ]*$")]],
			segundoNombre: ["", Validators.pattern("^[a-zA-Z0-9ñáéíóúÁÉÍÓÚ]*$")],
			primerApellido: ["", [Validators.required, Validators.pattern("^[a-zA-Z0-9ñáéíóúÁÉÍÓÚ ]*$")]],
			segundoApellido: ["", Validators.pattern("^[a-zA-Z0-9ñáéíóúÁÉÍÓÚ]*$")],
			tipoDocumentoSelected: ["", Validators.required],
			documento: ["", [Validators.required, Validators.pattern("^[a-zA-Z0-9]*$")]],
			correo: ["", [Validators.required, Validators.email]],
			celular: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
			tipoSelected: ["", Validators.required],
			programaSelected: ["", Validators.required],
			terminos: [false, Validators.requiredTrue]
		});

		/* Formato parámetros por cookie */
		// var params = {
		// 	lead_source: "facebook",
		// 	programa: "85N"
		// 	// dark_mode: 0 //0 no, 1 si
		// };

		this.parametrosUrl = this.route.snapshot.queryParams;
		if (this.parametrosUrl.lead_source) {
			this.cookieService.set(environment.cookieLeadSource, this.parametrosUrl.lead_source, 15 / 1440, "/", environment.dominio);
			this.leadSource = this.parametrosUrl.lead_source;
		} else {
			this.cookieService.set(environment.cookieLeadSource, environment.leadSourceDefecto, 15 / 1440, "/", environment.dominio);
			this.leadSource = environment.leadSourceDefecto;
		}

		this.setProgramaByParams();
		if (this.parametrosUrl.dark_mode) {
			this.darkMode = this.parametrosUrl.dark_mode == 1;
		} else {
			this.darkMode = false;
		}
	}

	ngOnInit() {
		this.siteKey = environment.siteKey;
		if (!this.formReducido) {
			this.pantalla = window.innerWidth <= 800 ? 1 : 2;
		}
		this.responsive = this.pantalla == 1;
	}

	public onResize(event) {
		if (!this.formReducido) {
			this.pantalla = event.target.innerWidth <= 800 ? 1 : 2;
		}
		this.responsive = this.pantalla == 1;
	}

	setProgramaByParams() {
		if (this.parametrosUrl.programa) {
			this.formReducido = true;
			this.pantalla = 1;
			if (this.parametrosUrl.programa == "-1") {
				this.progSelected = null;
				this.tipSelected = null;
			} else {
				this.getProgramaParam(this.parametrosUrl.programa);
			}
		} else {
			this.formReducido = true;
			this.pantalla = 1;
			this.progSelected = null;
			this.tipSelected = null;
		}
	}

	public getProgramas() {
		var tipoPrograma = this.registrarInscripcionForm.controls.tipoSelected.value;
		if (tipoPrograma != "3") {
			this.programs = [];
			this.pregradoServ.getProgramasByTipo(tipoPrograma).subscribe(
				(tiposObs) => {
					this.setProgramasService(tiposObs);
				},
				(error) => {},
				() => {
					this.sortProgramas();
				}
			);
		} else {
			this.setDoctorados();
			this.sortProgramas();
		}
	}

	getProgramaParam(param): any {
		this.progress = true;
		this.getProgramaPregrado(param.substring(0, 2), param.substring(2, 3));
	}

	getProgramaPregrado(programa: string, jornada: string) {
		this.pregradoServ.getProgramasByTipo("1").subscribe(
			(resp) => {
				this.setProgramasService(resp);
			},
			(error) => {
				this.progress = false;
			},
			() => {
				var programaSearch = this.programs.filter((prog) => prog.codigo == programa && prog.jornada == jornada);
				this.programaSelected = programaSearch[0];
				if (this.programaSelected != undefined) {
					this.progSelected = this.programaSelected.codigo + this.programaSelected.jornada;
					this.registrarInscripcionForm.controls.programaSelected.setValue(this.progSelected);
					this.registrarInscripcionForm.controls.tipoSelected.setValue("1");
					this.tipSelected = "1";
					this.sortProgramas();
				} else {
					this.getProgramaPosgrado(programa, jornada);
				}
			}
		);
	}

	getProgramaPosgrado(programa: string, jornada: string) {
		this.tipSelected = "";
		this.programs = [];

		this.pregradoServ.getProgramasByTipo("2").subscribe(
			(resp) => {
				this.setProgramasService(resp);
			},
			(error) => {
				this.progress = false;
			},
			() => {
				var programaSearch = this.programs.filter((prog) => prog.codigo == programa && prog.jornada == jornada);
				this.programaSelected = programaSearch[0];
				if (this.programaSelected != undefined) {
					this.progSelected = this.programaSelected.codigo + this.programaSelected.jornada;
					this.registrarInscripcionForm.controls.programaSelected.setValue(this.progSelected);
					this.registrarInscripcionForm.controls.tipoSelected.setValue("2");
					this.tipSelected = "2";
					this.sortProgramas();
				} else {
					this.getProgramaDoctorado(programa, jornada);
				}
			}
		);
	}

	getProgramaDoctorado(programa: string, jornada: string) {
		this.tipSelected = "";
		this.programs = [];

		this.setDoctorados();
		if (programa == "DA") {
			this.registrarInscripcionForm.controls.programaSelected.setValue("1N");
			this.registrarInscripcionForm.controls.tipoSelected.setValue("3");
			this.progSelected = "DAN";
			this.tipSelected = "3";
		} else if (programa == "DE") {
			this.registrarInscripcionForm.controls.programaSelected.setValue("2N");
			this.registrarInscripcionForm.controls.tipoSelected.setValue("3");
			this.progSelected = "DEN";
			this.tipSelected = "3";
		} else if (programa == "ET") {
			this.registrarInscripcionForm.controls.programaSelected.setValue("3N");
			this.registrarInscripcionForm.controls.tipoSelected.setValue("3");
			this.progSelected = "ETN";
			this.tipSelected = "3";
		} else {
			this.progSelected = null;
			this.tipSelected = null;
			this.programs = [];
		}
		this.sortProgramas();
	}

	sortProgramas() {
		this.programs.sort((n1, n2) => {
			var comp = (n1.nombre + n1.jornada).localeCompare(n2.nombre + n2.jornada);
			if (comp > 1) {
				return 1;
			}
			if (comp < 1) {
				return -1;
			}
			return 0;
		});
		this.progress = false;
	}

	setDoctorados() {
		this.programs = [
			{
				codigo: "1",
				nombre: "DOCTORADO EN AGROCIENCIAS",
				jornada: "N",
				inscripcion: "S",
				jornadas: [],
				contacto: null,
				fa: null,
				correo: null
			},
			{
				codigo: "2",
				nombre: "DOCTORADO EN EDUCACIÓN",
				jornada: "N",
				inscripcion: "S",
				jornadas: [],
				contacto: null,
				fa: null,
				correo: null
			},
			{
				codigo: "3",
				nombre: "DOCTORADO EN ESTUDIOS DE DESARROLLO Y TERRITORIO",
				jornada: "N",
				inscripcion: "S",
				jornadas: [],
				contacto: null,
				fa: null,
				correo: null
			}
		];
	}

	setProgramasService(programasPeticion) {
		programasPeticion.forEach((program) => {
			program.jornadas.forEach((jornad) => {
				this.programs.push({
					nombre: program.nombre,
					jornada: jornad.jornada,
					codigo: program.codigo,
					inscripcion: jornad.inscripcion,
					jornadas: [],
					contacto: program.contacto,
					fa: program.fa,
					correo: program.correo
				});
			});
		});
	}

	public continuarProceso() {
		this.router.navigate(["/continuar"], {
			queryParams: { lead_source: this.parametrosUrl.lead_source, dark_mode: this.parametrosUrl.dark_mode }
		});
	}

	public enviarDatosInscripcion(captchaCode) {
		this.progress = true;
		var respCaptcha = captchaCode;
		if (this.registrarInscripcionForm.invalid) {
			this.registrarInscripcionForm.markAllAsTouched();
			this.openMensajes("Fallo en inscripción", "Por favor revise sus datos.", 0);
			this.progress = false;
			return;
		} else {
			this.registrarInscripcionForm.controls.terminos.setValue(false);
			var prog = this.registrarInscripcionForm.controls.programaSelected.value;
			this.getProgramaSeleccionado(prog);
			var cookieLs = this.cookieService.get(environment.cookieLeadSource).toString();
			this.pregradoServ.guardarParte1(this.registrarInscripcionForm, this.programaSelected, respCaptcha, cookieLs).subscribe(
				(tiposObs) => {
					this.mensaje = tiposObs;
				},
				(error) => {},
				() => {
					this.progress = false;
					if (this.mensaje.status == "ok") {
						var tipDoc = this.registrarInscripcionForm.controls.tipoDocumentoSelected.value;
						this.openGracias(tipDoc);
					} else if (this.mensaje.status == "go") {
						this.openMensajes("Un momento por favor...", this.mensaje.mensaje, 0);
						this.redireccionarLineaTiempo();
					} else if (this.mensaje.status == "fail") {
						this.openMensajes("Mensaje importante", this.mensaje.mensaje, 0);
					} else {
						//TODO: Si es un programa especial deberia tambien abrir la pantalla de gracias
						//			Parece que esto no lo guarda en el analytics...
						if (this.formReducido) {
							this.openMensajes(this.mensaje.status.toLocaleUpperCase(), this.mensaje.mensaje, 0);
							this.registrarInscripcionForm.reset();
							this.setProgramaByParams();
						} else {
							this.openMensajes(this.mensaje.status.toLocaleUpperCase(), this.mensaje.mensaje, 1);
							setTimeout(function () {
								this.document.location.href = environment.urlPaginaUniver;
							}, 5000);
						}
					}
				}
			);
		}
	}

	public getProgramaSeleccionado(progSelected: string): void {
		this.programaSelected = new Programa();
		for (let prog of this.programs) {
			if (prog.codigo + "" + prog.jornada == progSelected) {
				this.programaSelected = prog;
				break;
			}
		}
	}

	redireccionarLineaTiempo() {
		var programa = this.registrarInscripcionForm.controls.programaSelected.value;
		var documento = this.registrarInscripcionForm.controls.documento.value;
		var tipo = this.registrarInscripcionForm.controls.tipoSelected.value;
		this.progress = true;
		this.pregradoServ.validarContinuar(documento, programa.substring(0, 2), programa.substring(2, 3)).subscribe(
			(resp) => {
				this.progress = false;
				if (resp.status == "fail") {
					this.openMensajes("Mensaje", resp.mensaje, 0);
				} else if (resp.status == "go") {
					this.finalRedireccion(tipo, documento, programa);
				}
			},
			(error) => {
				this.progress = false;
				console.log(error);
			}
		);
	}

	finalRedireccion(tipo: string, documento: string, programa: string) {
		this.cookieService.delete(environment.cookiePregrado);
		this.cookieService.delete(environment.cookiePosgrado);
		if (tipo == "1") {
			var datos = {
				doc: documento,
				fac: {
					codigo: programa,
					inscripcion: this.programaSelected.inscripcion,
					contacto: this.programaSelected.contacto,
					correo: this.programaSelected.correo,
					nombre: this.programaSelected.nombre,
					fa: this.programaSelected.fa
				}
			};
			this.cookieService.set(environment.cookiePregrado, JSON.stringify(datos), 15 / 1440, "/", environment.dominio);
			if (this.formReducido) {
				setTimeout(function () {
					window.open(environment.urlPregrado, "_blank");
				}, 2000);
			} else {
				setTimeout(function () {
					this.document.location.href = environment.urlPregrado;
				}, 2000);
			}
		} else if (tipo == "2") {
			var datosPos = {
				doc: documento,
				fac: programa.substring(0, 2),
				jor: programa.substring(2, 3)
			};
			this.cookieService.set(environment.cookiePosgrado, JSON.stringify(datosPos), 15 / 1440, "/", environment.dominio);
			if (this.formReducido) {
				setTimeout(function () {
					window.open(environment.urlPosgrado, "_blank");
				}, 2000);
			} else {
				setTimeout(function () {
					this.document.location.href = environment.urlPosgrado;
				}, 2000);
			}
		} else if (tipo == "3") {
			if (this.formReducido) {
				setTimeout(function () {
					window.open(environment.urlDoctorados.replace("?1", programa.substring(0, 1)).replace("?2", documento), "_blank");
				}, 2000);
			} else {
				setTimeout(function () {
					this.document.location.href = environment.urlDoctorados
						.replace("?1", programa.substring(0, 1))
						.replace("?2", documento);
				}, 2000);
			}
		}

		this.registrarInscripcionForm.reset();
		this.setProgramaByParams();
	}

	public openGracias(tipoDoc: string): void {
		if ("P" == tipoDoc) {
			this.graciasExtranjero();
		} else {
			let insForm = this.fillObjectOfStorage();
			sessionStorage.setItem("gtifmp0t", JSON.stringify(insForm));

			this.registrarInscripcionForm.reset();
			this.setProgramaByParams();

			if (this.formReducido) {
				window.open("https://" + location.host + "/oar/sia/inscripciones/#/gracias?redirect=1", "_blank");
				//window.open("http://" + location.host + "/#/gracias?redirect=1", "_blank");
			} else {
				this.pregradoServ.setMensajeGracias(
					this.stringHelper.getResource("titGracias"),
					this.stringHelper.getResource("msgGracias")
				);
				this.router.navigateByUrl("gracias");
			}
		}
	}

	graciasExtranjero() {
		let insForm = {
			ftipo: this.registrarInscripcionForm.controls.tipoSelected.value,
			fprograma: this.registrarInscripcionForm.controls.programaSelected.value,
			fdocumento: this.registrarInscripcionForm.controls.documento.value,
			finscripcion: this.programaSelected.inscripcion,
			fcontacto: this.programaSelected.contacto,
			fcorreo: this.programaSelected.correo,
			fnombre: this.programaSelected.nombre,
			ffa: this.programaSelected.fa,
			ftitGracias: this.stringHelper.getResource("titGracias"),
			ftitmsgGracias: this.stringHelper.getResource("msgGraciasExt"),
			fgrado: "e"
		};
		sessionStorage.setItem("gtifmp0t", JSON.stringify(insForm));
		this.registrarInscripcionForm.reset();
		this.setProgramaByParams();

		if (this.formReducido) {
			window.open("https://" + location.host + "/oar/sia/inscripciones/#/gracias?redirect=2", "_blank");
			//window.open("http://" + location.host + "/#/gracias?redirect=2", "_blank");
		} else {
			this.pregradoServ.setMensajeGracias(
				this.stringHelper.getResource("titGracias"),
				this.stringHelper.getResource("msgGraciasExt")
			);
			this.router.navigateByUrl("gracias");
		}
	}

	fillObjectOfStorage(): any {
		return {
			ftipo: this.registrarInscripcionForm.controls.tipoSelected.value,
			fprograma: this.registrarInscripcionForm.controls.programaSelected.value,
			fdocumento: this.registrarInscripcionForm.controls.documento.value,
			finscripcion: this.programaSelected.inscripcion,
			fcontacto: this.programaSelected.contacto,
			fcorreo: this.programaSelected.correo,
			fnombre: this.programaSelected.nombre,
			ffa: this.programaSelected.fa,
			ftitGracias: this.stringHelper.getResource("titGracias"),
			ftitmsgGracias: this.stringHelper.getResource("msgGracias"),
			fgrado: "n"
		};
	}

	/**
	 * @param titulo Titulo del mensaje
	 * @param mensaje Cuerpo del mensaje
	 * @param opcion 0: si es con boton de cerrar, 1 || 2: si no tiene boton de cerrar (no se cual es la diferencia entre 1 y 2 ._.)
	 */
	public openMensajes(titulo: string, mensaje: string, opcion: number): void {
		var sizeWindow = window.innerWidth <= 800 ? "99%" : "35%";
		this.dialogRef = this.dialog.open(VentanaDialogoMensajesPreg, {
			width: sizeWindow,
			data: { titulo: titulo, mensaje: mensaje, opcion: opcion },
			disableClose: opcion == 1 || opcion == 2 ? true : false
		});

		this.dialogRef.afterClosed().subscribe((result) => {});
	}

	public openHabeasData(): void {
		this.openMensajes(this.stringHelper.getResource("titHabeasData"), this.msgHabeasData, 0);
	}
}

@Component({
	selector: "ventanaDialogo",
	templateUrl: "ventanaMensajes.html",
	styleUrls: ["./pregrado.component.scss"]
})
export class VentanaDialogoMensajesPreg {
	constructor(public dialogRef: MatDialogRef<VentanaDialogoMensajesPreg>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}

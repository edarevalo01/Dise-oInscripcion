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
		{ codigo: "T", nombre: "TARJETA DE IDENTIDAD" },
		{ codigo: "C", nombre: "CÉDULA DE CIUDADANÍA" },
		{ codigo: "P", nombre: "PASAPORTE" }
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

		this.msgHabeasData = this.stringHelper.getResource("msgHabeasData");
		this.registrarInscripcionForm = this.formBuilder.group({
			primerNombre: ["", Validators.required],
			segundoNombre: [""],
			primerApellido: ["", Validators.required],
			segundoApellido: [""],
			tipoDocumentoSelected: ["", Validators.required],
			documento: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
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
			this.formReducido = false;
			this.pantalla = 2;
		}

		if (this.parametrosUrl.dark_mode) {
			this.darkMode = this.parametrosUrl.dark_mode == 1;
		} else {
			this.darkMode = false;
		}
	}

	getProgramaParam(param): any {
		this.getProgramaPregrado(param.substring(0, 2), param.substring(2, 3));
	}

	getProgramaPregrado(programa: string, jornada: string) {
		this.pregradoServ.getProgramasByTipo("1").subscribe(
			(resp) => {
				this.setProgramasService(resp);
			},
			(error) => {
				console.log("error pregrado");
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
				console.log("Error Posgrados");
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
			this.progSelected = "DAN";
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
	}

	ngOnInit() {
		this.siteKey = environment.siteKey;
		if (!this.formReducido) {
			this.pantalla = window.innerWidth <= 600 ? 1 : 2;
		}
		if (this.pantalla == 1) {
			this.responsive = true;
		} else this.responsive = false;
	}

	public onResize(event) {
		if (!this.formReducido) {
			this.pantalla = event.target.innerWidth <= 600 ? 1 : 2;
		}
		if (this.pantalla == 1) {
			this.responsive = true;
		} else this.responsive = false;
	}

	public getProgramas() {
		var tipo = this.registrarInscripcionForm.controls.tipoSelected.value;
		if ("3" != tipo) {
			this.programs = [];
			this.pregradoServ.getProgramasByTipo(tipo).subscribe(
				(tiposObs) => {
					this.setProgramasService(tiposObs);
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
				},
				(error) => {}
			);
		} else {
			this.setDoctorados();
		}
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
			}
		];
	}

	setProgramasService(tiposObs) {
		tiposObs.forEach((program) => {
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

	public enviarDatosInscripcion(captchaCode) {
		this.loading = true;
		var respCaptcha = captchaCode;
		if (this.registrarInscripcionForm.invalid) {
			this.registrarInscripcionForm.markAllAsTouched();
			this.loading = false;
			return;
		} else {
			var prog = this.registrarInscripcionForm.controls.programaSelected.value;
			this.getProgramaSeleccionado(prog);
			var cookieLs = this.cookieService.get(environment.cookieLeadSource).toString();
			this.pregradoServ.guardarParte1(this.registrarInscripcionForm, this.programaSelected, respCaptcha, cookieLs).subscribe(
				(tiposObs) => {
					this.mensaje = tiposObs;
					if ("fail" != this.mensaje.status) {
						var tipDoc = this.registrarInscripcionForm.controls.tipoDocumentoSelected.value;
						this.openGracias(tipDoc);
					} else {
						this.openMensajes(this.stringHelper.getResource("titMensaje"), this.mensaje.mensaje, 0);
					}
				},
				(error) => {}
			);
		}
		this.loading = false;
	}

	public continuarProceso() {
		this.router.navigate(["/continuar"], {
			queryParams: { lead_source: this.parametrosUrl.lead_source, dark_mode: this.parametrosUrl.dark_mode }
		});
		//this.router.navigate(["/continuar"]);
	}

	public getProgramaSeleccionado(progSelected: string): void {
		this.programaSelected = new Programa();
		for (let prog of this.programs) {
			if (prog.codigo || prog.jornada == progSelected) {
				this.programaSelected = prog;
				break;
			}
		}
	}

	public openMensajes(titulo: string, mensaje: string, opcion: number): void {
		var sizeWindow = window.innerWidth <= 600 ? "85%" : "35%";
		this.dialogRef = this.dialog.open(VentanaDialogoMensajesPreg, {
			width: sizeWindow,
			data: { titulo: titulo, mensaje: mensaje, opcion: opcion },
			disableClose: 1 == opcion || 2 == opcion ? true : false
		});

		this.dialogRef.afterClosed().subscribe((result) => {});
	}

	public openHabeasData(): void {
		this.openMensajes(this.stringHelper.getResource("titHabeasData"), this.msgHabeasData, 0);
	}

	public openGracias(tipoDoc: string): void {
		if ("P" == tipoDoc) {
			this.pregradoServ.setMensajeGracias(
				this.stringHelper.getResource("titGracias"),
				this.stringHelper.getResource("msgGraciasExt")
			);
			if (this.formReducido) {
				let insForm = {
					ftitGracias: this.stringHelper.getResource("titGracias"),
					ftitmsgGracias: this.stringHelper.getResource("msgGraciasExt")
				};
				sessionStorage.setItem("gtifmp0t", JSON.stringify(insForm));
				this.registrarInscripcionForm.reset;
				window.open("https://" + location.host + "/oar/sia/inscripciones/#/gracias?redirect=2", "_blank");
			} else {
				this.router.navigateByUrl("gracias");
				setTimeout(function() {
					this.document.location.href = environment.urlPaginaUniver;
				}, 5000);
			}
			//this.openMensajes(this.stringHelper.getResource("titGracias"), this.stringHelper.getResource("msgGraciasExt"), 2);
		} else {
			if (this.formReducido) {
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
					ftitmsgGracias: this.stringHelper.getResource("msgGracias")
				};
				sessionStorage.setItem("gtifmp0t", JSON.stringify(insForm));
				this.registrarInscripcionForm.reset();
				window.open("https://" + location.host + "/oar/sia/inscripciones/#/gracias?redirect=1", "_blank");
			} else {
				this.pregradoServ.setMensajeGracias(
					this.stringHelper.getResource("titGracias"),
					this.stringHelper.getResource("msgGracias")
				);
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
					ftitmsgGracias: this.stringHelper.getResource("msgGracias")
				};
				sessionStorage.setItem("gtifmp0t", JSON.stringify(insForm));
				this.registrarInscripcionForm.reset();
				this.router.navigateByUrl("gracias");
				//this.openMensajes(this.stringHelper.getResource("titGracias"), this.stringHelper.getResource("msgGracias"), 1);
				var tipo = this.registrarInscripcionForm.controls.tipoSelected.value;
				var programa = this.registrarInscripcionForm.controls.programaSelected.value;
				var documento = this.registrarInscripcionForm.controls.documento.value;
				if ("3" != tipo) {
					if ("1" == tipo || "2" == tipo) {
						this.pregradoServ.validarContinuar(documento, programa.substring(0, 2), programa.substring(2, 3)).subscribe(
							(tiposObs) => {
								this.mensaje = tiposObs;
								if ("fail" != this.mensaje.status && "go" == this.mensaje.status) {
									if ("1" == tipo) {
										if (!this.cookieService.get(environment.cookiePregrado)) {
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
									if (this.formReducido) {
										window.open("http://" + location.host + "/oar/sia/inscripciones/#/gracias", "_blank");
									} else {
										this.router.navigateByUrl("gracias");
									}
									this.pregradoServ.setMensajeGracias(this.stringHelper.getResource("titMensaje"), this.mensaje.mensaje);
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

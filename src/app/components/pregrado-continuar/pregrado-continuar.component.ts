import { Component, OnInit, Inject } from "@angular/core";
import { PregradoService } from "src/app/services/pregrado.service";
import { TipoPrograma } from "src/app/models/TipoPrograma";
import { Programa } from "src/app/models/Programa";
import { FormGroup, FormBuilder, Validators, FormGroupDirective, FormControl, NgForm } from "@angular/forms";
import { ErrorStateMatcher } from "@angular/material/core";
import { DOCUMENT } from "@angular/common";
import { environment } from "src/environments/environment";
import { CookieService } from "ngx-cookie-service";
import { Mensaje } from "src/app/models/Mensaje";
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material";
import { DialogData } from "../pregrado/pregrado.component";
import { Router, ActivatedRoute } from "@angular/router";
import { StringResourceHelper } from "src/app/models/string-resource-helper";

export class MyErrorStateMatcher implements ErrorStateMatcher {
	isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
		const isSubmitted = form && form.submitted;
		return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
	}
}

@Component({
	selector: "app-pregrado-continuar",
	templateUrl: "./pregrado-continuar.component.html",
	styleUrls: ["../pregrado/pregrado.component.scss"]
})
export class PregradoContinuarComponent implements OnInit {
	public stringHelper: StringResourceHelper;
	public tiposPrograma: TipoPrograma[] = [
		{ codigo: "1", nombre: "PREGRADO" },
		{ codigo: "2", nombre: "POSGRADO" },
		{ codigo: "3", nombre: "DOCTORADO" }
	];
	public parametrosUrl: any;
	public darkMode: boolean = false;
	public continuarInscripcionForm: FormGroup;
	public pantalla: Number;
	public programs: Programa[] = [];
	public mensaje: Mensaje = new Mensaje();
	public programaSelected: Programa;
	public loading: boolean = false;

	public ls: string = "";
	public responsive: boolean = false;
	public progress: boolean = false;

	constructor(
		private pregradoServ: PregradoService,
		private formBuilder: FormBuilder,
		@Inject(DOCUMENT) private document: Document,
		private cookieService: CookieService,
		private dialog: MatDialog,
		private router: Router,
		private route: ActivatedRoute
	) {
		this.stringHelper = new StringResourceHelper("titulos-mensajes");
		this.continuarInscripcionForm = this.formBuilder.group({
			documento: ["", [Validators.required, Validators.pattern("^[a-zA-Z0-9ñáéíóúÁÉÍÓÚ]*$")]],
			tipoSelected: ["", Validators.required],
			programaSelected: ["", Validators.required]
		});

		this.parametrosUrl = this.route.snapshot.queryParams;
		if (this.parametrosUrl.dark_mode) {
			this.darkMode = this.parametrosUrl.dark_mode == 1;
		} else {
			this.darkMode = false;
		}

		if (this.parametrosUrl.lead_source) {
			this.ls = this.parametrosUrl.lead_source;
		} else {
			this.ls = "sepRebr5";
		}
	}

	ngOnInit() {
		this.pantalla = window.innerWidth <= 800 ? 1 : 2;
		this.responsive = this.pantalla == 1;
	}

	public onResize(event) {
		this.pantalla = event.target.innerWidth <= 800 ? 1 : 2;
		this.responsive = this.pantalla == 1;
	}

	public getProgramas() {
		this.progress = true;
		var tipoPrograma = this.continuarInscripcionForm.controls.tipoSelected.value;
		if (tipoPrograma != "3") {
			this.programs = [];
			this.pregradoServ.getProgramasByTipo(tipoPrograma).subscribe(
				(tiposObs) => {
					this.setProgramasService(tiposObs);
				},
				(error) => {
					this.progress = false;
				},
				() => {
					this.sortProgramas();
				}
			);
		} else {
			this.setDoctorados();
			this.sortProgramas();
		}
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

	public enviarDatosInscripcionContinuar() {
		if (this.continuarInscripcionForm.invalid) {
			this.continuarInscripcionForm.markAllAsTouched();
			this.openMensajes("Fallo en inscripción", "Por favor revise sus datos.", 0);
			return;
		} else {
			this.redireccionarLineaTiempo();
		}
	}

	////////////////////////////////////////////////////////7

	redireccionarLineaTiempo() {
		var tipo = this.continuarInscripcionForm.controls.tipoSelected.value;
		var programa = this.continuarInscripcionForm.controls.programaSelected.value;
		var documento = this.continuarInscripcionForm.controls.documento.value;
		this.getProgramaSeleccionado(programa);
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

			setTimeout(function () {
				// this.document.location.href = environment.urlPregrado;
				window.open(environment.urlPregrado, "_blank");
			}, 100);
		} else if (tipo == "2") {
			var datosPos = {
				doc: documento,
				fac: programa.substring(0, 2),
				jor: programa.substring(2, 3)
			};
			this.cookieService.set(environment.cookiePosgrado, JSON.stringify(datosPos), 15 / 1440, "/", environment.dominio);

			setTimeout(function () {
				// this.document.location.href = environment.urlPosgrado;
				window.open(environment.urlPosgrado, "_blank");
			}, 100);
		} else if (tipo == "3") {
			setTimeout(function () {
				// this.document.location.href = environment.urlDoctorados.replace("?1", programa.substring(0, 1)).replace("?2", documento);
				window.open(environment.urlDoctorados.replace("?1", programa.substring(0, 1)).replace("?2", documento), "_blank");
			}, 100);
		}
		this.continuarInscripcionForm.reset();
	}

	////////////////////////////////////////////////////////////////////////////////////////

	public openMensajes(titulo: string, mensaje: string, opcion: number): void {
		var sizeWindow = window.innerWidth <= 800 ? "99%" : "35%";
		const dialogRef = this.dialog.open(VentanaDialogoMensajes, {
			width: sizeWindow,
			data: {
				titulo: titulo,
				mensaje: mensaje,
				opcion: opcion,
				disableClose: true
			}
		});

		dialogRef.afterClosed().subscribe((result) => {});
	}

	public inscribir() {
		this.router.navigate(["/inscripcion"], {
			queryParams: { lead_source: this.parametrosUrl.lead_source, dark_mode: this.parametrosUrl.dark_mode }
		});
		//this.router.navigate(["/inscripcion"]);
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
}

@Component({
	selector: "ventanaDialogo",
	templateUrl: "../pregrado/ventanaMensajes.html",
	styleUrls: ["../pregrado/pregrado.component.scss"]
})
export class VentanaDialogoMensajes {
	constructor(public dialogRef: MatDialogRef<VentanaDialogoMensajes>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

	onNoClick(): void {
		this.dialogRef.close();
	}
}

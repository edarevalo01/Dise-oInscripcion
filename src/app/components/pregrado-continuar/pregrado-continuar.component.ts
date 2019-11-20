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
import { Router } from "@angular/router";
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
  public parametrosCookie: any;
  public darkMode: boolean = false;
  public continuarInscripcionForm: FormGroup;
  public pantalla: Number;
  public programs: Programa[] = [];
  public mensaje: Mensaje = new Mensaje();
  public programaSelected: Programa;
  public loading: boolean = false;

  public ls: string = "";

  constructor(
    private pregradoServ: PregradoService,
    private formBuilder: FormBuilder,
    @Inject(DOCUMENT) private document: Document,
    private cookieService: CookieService,
    private dialog: MatDialog,
    private router: Router
  ) {
    this.stringHelper = new StringResourceHelper("titulos-mensajes");
    this.parametrosCookie = this.cookieService.get("dOdYDja");
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
    this.ls = this.parametrosCookie.lead_source;
  }

  ngOnInit() {
    this.pantalla = window.innerWidth <= 540 ? 1 : 2;
    this.continuarInscripcionForm = this.formBuilder.group({
      documento: ["", [Validators.required, Validators.pattern("^[0-9]*$")]],
      tipoSelected: ["", Validators.required],
      programaSelected: ["", Validators.required]
    });
  }

  public onResize(event) {
    this.pantalla = event.target.innerWidth <= 540 ? 1 : 2;
  }

  public getProgramas() {
    var tipo = this.continuarInscripcionForm.controls.tipoSelected.value;
    if ("3" != tipo) {
      this.programs = [];
      this.pregradoServ.getProgramasByTipo(tipo).subscribe(
        tiposObs => {
          tiposObs.forEach(program => {
            program.jornadas.forEach(jornad => {
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
        error => {}
      );
    } else {
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
  }

  public enviarDatosInscripcionContinuar() {
    this.loading = true;
    var tipo = this.continuarInscripcionForm.controls.tipoSelected.value;
    var programa = this.continuarInscripcionForm.controls.programaSelected.value;
    var documento = this.continuarInscripcionForm.controls.documento.value;
    if (this.continuarInscripcionForm.invalid) {
      this.continuarInscripcionForm.markAllAsTouched();
      return;
      this.loading = false;
    } else {
      this.getProgramaSeleccionado(programa);
      if ("3" != tipo) {
        if ("1" == tipo || "2" == tipo) {
          this.pregradoServ.validarContinuar(documento, programa.substring(0, 2), programa.substring(2, 3)).subscribe(
            tiposObs => {
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
                    this.cookieService.set(environment.cookiePregrado, JSON.stringify(datos), 15 / 1440, "/", environment.dominio);
                  }
                  this.document.location.href = environment.urlPregrado;
                }
                if ("2" == tipo) {
                  if (!this.cookieService.get(environment.cookiePosgrado)) {
                    var datosPos = {
                      doc: documento,
                      fac: programa.substring(0, 2),
                      jor: programa.substring(2, 3)
                    };
                    this.cookieService.set(environment.cookiePosgrado, JSON.stringify(datosPos), 15 / 1440, "/", environment.dominio);
                  }
                  this.document.location.href = environment.urlPosgrado;
                }
              } else {
                this.openMensajes(this.stringHelper.getResource("titMensaje"), this.mensaje.mensaje, 0);
              }
            },
            error => {}
          );
        }
      } else {
        this.document.location.href = environment.urlDoctorados.replace("?1", programa.substring(0, 1)).replace("?2", documento);
      }
    }
    this.loading = false;
  }

  public openMensajes(titulo: string, mensaje: string, opcion: number): void {
    const dialogRef = this.dialog.open(VentanaDialogoMensajes, {
      width: "35%",
      data: { titulo: titulo, mensaje: mensaje, opcion: opcion, disableClose: true }
    });

    dialogRef.afterClosed().subscribe(result => {});
  }

  public inscribir() {
    //this.router.navigate(["/inscripcion"], { queryParams: { lead_source: this.parametrosCookie.lead_source } });
    this.router.navigate(["/inscripcion"]);
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
}

@Component({
  selector: "ventanaDialogo",
  templateUrl: "../pregrado/ventanaMensajes.html"
})
export class VentanaDialogoMensajes {
  constructor(public dialogRef: MatDialogRef<VentanaDialogoMensajes>, @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}

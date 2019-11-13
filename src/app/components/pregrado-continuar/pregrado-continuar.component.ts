import { Component, OnInit, Inject } from '@angular/core';
import { PregradoService } from 'src/app/services/pregrado.service';
import { TipoPrograma } from 'src/app/models/TipoPrograma';
import { Programa } from 'src/app/models/Programa';
import { FormGroup, FormBuilder, Validators, FormGroupDirective, FormControl, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { DOCUMENT } from '@angular/common';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
import { Mensaje } from 'src/app/models/Mensaje';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from '@angular/material';
import { DialogData } from '../pregrado/pregrado.component';
import { Router } from '@angular/router';

export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
  const isSubmitted = form && form.submitted;
  return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
}
}

@Component({
  selector: 'app-pregrado-continuar',
  templateUrl: './pregrado-continuar.component.html',
  styleUrls: ['../pregrado/pregrado.component.css']
})
export class PregradoContinuarComponent implements OnInit {
  private tiposPrograma : TipoPrograma[]=[
    {codigo:"1",nombre:"PREGRADO"},
    {codigo:"2",nombre:"POSGRADO"},
    {codigo:"3",nombre:"DOCTORADO"}
  ];
  private continuarInscripcionForm: FormGroup;
  private pantalla: Number;
  private programs: Programa[] = [];
  private mensaje: Mensaje = new Mensaje;
  private lblRequerido: string = environment.lblRequerido;
  private lblSoloNumeros: string = environment.lblSoloNumeros;
  private lblContinuar2: string = environment.lblContinuar2;
  private titInscribete2 : string = environment.titInscribete2;
  private lblInscribete: string = environment.lblInscribete;
  private lblInscribirme: string = environment.lblInscribirme;
  private lblContinuarr: string = environment.lblContinuarr;

  constructor(private pregradoServ: PregradoService, private formBuilder: FormBuilder, @Inject(DOCUMENT) private document: Document, private cookieService: CookieService, private dialog: MatDialog, private router: Router) { }

  ngOnInit() {
    this.pantalla = window.innerWidth <= 540 ? 1 : 2;
    this.continuarInscripcionForm = this.formBuilder.group({
        documento : ['', [Validators.required, Validators.pattern('^[0-9]*$')],],
        tipoSelected : ['', Validators.required],
        programaSelected : ['', Validators.required]
    });
  }

  public onResize(event) {
    this.pantalla = event.target.innerWidth <= 540 ? 1 : 2;
  }

  //programas
  public getProgramas(){
    var tipo = this.continuarInscripcionForm.controls.tipoSelected.value;
    if('3'!=tipo){
      this.programs = [];
      this.pregradoServ.getProgramasByTipo(tipo).subscribe(     
        tiposObs => {
                    tiposObs.forEach(
                      program=>{
                        program.jornadas.forEach(
                          jornad=>{ 
                            this.programs.push({nombre:program.nombre, jornada:jornad.jornada, codigo:program.codigo,inscripcion:jornad.inscripcion, jornadas:[], contacto:program.contacto, fa:null, correo:null});
                          }
                        );
                      }
                    );
                    this.programs.sort((n1,n2) => {
                      var comp = (n1.nombre+n1.jornada).localeCompare(n2.nombre+n2.jornada); 
                      if(comp>1){
                          return 1;
                      }
                      if(comp<1){
                          return -1;
                      }
                      return 0;
                    });
        },
        error=>{
                console.log(error)
          }
        );  
    }   
    else{
      //doctorados
      this.programs =[
        {codigo:'1',nombre:'DOCTORADO EN AGROCIENCIAS',jornada:'N',inscripcion:'S',jornadas:[],contacto:null,fa:null,correo:null},
        {codigo:'2',nombre:'DOCTORADO EN EDUCACIÓN',jornada:'N',inscripcion:'S',jornadas:[],contacto:null,fa:null,correo:null}
      ];
    } 
  }

  //continuar
  public enviarDatosInscripcionContinuar(){
    var tipo = this.continuarInscripcionForm.controls.tipoSelected.value;
    var programa  = this.continuarInscripcionForm.controls.programaSelected.value;
    var documento = this.continuarInscripcionForm.controls.documento.value;
    if (this.continuarInscripcionForm.invalid){
        this.continuarInscripcionForm.markAllAsTouched();
        return;
    }
    else{
       if('3'!=tipo){
         if('1'==tipo){
          this.pregradoServ.validarContinuar(documento,programa.substring(0,2),programa.substring(2,3)).subscribe(     
            tiposObs => {
                        this.mensaje = tiposObs;
                        if('fail'!=this.mensaje.status){
                          this.cookieService.set(environment.cookiePregrado,'{doc:'+documento+',fac:'+programa+'}', 15/1440,'/',environment.dominio);
                          this.document.location.href = environment.urlPregrado;
                         }
                         else{
                             this.openMensajes(environment.titMensaje,this.mensaje.mensaje,0);
                         }
             },
             error=>{
                    console.log(error)
              }
            );  
         }
       }
       else{
           this.document.location.href = environment.urlDoctorados.replace('?1',programa.substring(0,1)).replace('?2',documento);
       }
    }
  }
  
  //ventana mensajes
  public openMensajes(titulo: string, mensaje: string, opcion: number): void {
    const dialogRef = this.dialog.open(VentanaDialogoMensajes, {
      width: '35%',
      data: {titulo:titulo,
             mensaje: mensaje,
             opcion:opcion,
             disableClose: true}
    });

    dialogRef.afterClosed().subscribe(result => {
    });
  }

  //inscribirse
  public inscribir(){
    this.router.navigate(['/inscripcion'])
  }
}
//mensajes
@Component({
  selector: 'ventanaDialogo',
  templateUrl: '../pregrado/ventanaMensajes.html',
})
export class VentanaDialogoMensajes{
  constructor(
    public dialogRef: MatDialogRef<VentanaDialogoMensajes>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}


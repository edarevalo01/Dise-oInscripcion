import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { TipoDocumento } from 'src/app/models/TipoDocumento';
import { TipoPrograma } from 'src/app/models/TipoPrograma';
import { Programa } from 'src/app/models/Programa';
import { PregradoService } from 'src/app/services/pregrado.service';
import { FormGroup, FormBuilder, Validators, FormControl, FormGroupDirective, NgForm } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Router} from "@angular/router";
import { environment } from 'src/environments/environment';
import { Mensaje } from 'src/app/models/Mensaje';
import { CookieService } from 'ngx-cookie-service';
import { Captcha } from 'primeng/captcha';
import { DOCUMENT } from '@angular/common';

export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

export interface DialogData {
}

@Component({
  selector: 'app-pregrado',
  templateUrl: './pregrado.component.html',
  styleUrls: ['./pregrado.component.css']
})
export class PregradoComponent implements OnInit {
  private tipoDocumentoSelected: string;
  private tiposDocumento: TipoDocumento[]=[
    {codigo:"T",nombre:"TARJETA DE IDENTIDAD"},
    {codigo:"C",nombre:"CÉDULA DE CIUDADANÍA"},
    {codigo:"P",nombre:"PASAPORTE"}
  ];
  private tiposPrograma : TipoPrograma[]=[
     {codigo:"1",nombre:"PREGRADO"},
     {codigo:"2",nombre:"POSGRADO"},
     {codigo:"3",nombre:"DOCTORADO"}
  ];
  private pantalla: number;
  private registrarInscripcionForm: FormGroup;
  private captchaForm: FormGroup;
  private siteKey: string;
  private programs: Programa[] = [];
  private titInscribite : string = environment.titInscribete;
  private lblInscribete: string = environment.lblInscribete;
  private titContinuar: string = environment.titContinuar;
  private lblContinuar: string = environment.lblContinuar;
  private lblRequerido: string = environment.lblRequerido;
  private lblSoloNumeros: string = environment.lblSoloNumeros;
  private lblCorreo: string = environment.lblCorreo;
  private lblTerminos: string = environment.lblTerminos;
  private lblTermCond: string = environment.lblTermCond;
  private lblInscribirme: string = environment.lblInscribirme;
  private lblContinuarr: string = environment.lblContinuarr;
  private msgHabeasData: string = environment.msgHabeasData;
  private programaSelected : Programa;
  private mensaje: Mensaje = new Mensaje;
  @ViewChild('captcha', {static: false}) cap : Captcha;
  private msgCaptcha: string = environment.msgCaptcha;
  private msgCaptchaNoValido :  boolean = false;
  private loading : boolean = false;

  constructor(private pregradoServ: PregradoService, private formBuilder: FormBuilder, private dialog: MatDialog, private router: Router, private cookieService: CookieService, @Inject(DOCUMENT) private document: Document) { }

  ngOnInit(){
    this.siteKey = environment.siteKey;
    this.pantalla = window.innerWidth <= 540 ? 1 : 2;
    this.registrarInscripcionForm = this.formBuilder.group({
      primerNombre : ['', Validators.required],
      segundoNombre : ['',],
      primerApellido : ['', Validators.required],
      segundoApellido : ['', ],
      tipoDocumentoSelected : ['', Validators.required],
      documento : ['', [Validators.required, Validators.pattern('^[0-9]*$')],],
      correo : ['', [Validators.required, Validators.email],],
      celular : ['', [Validators.required, Validators.pattern('^[0-9]*$')],],
      tipoSelected : ['', Validators.required],
      programaSelected : ['', Validators.required],
      terminos : [false, Validators.requiredTrue]
    });    
  }
  public onResize(event) {
    this.pantalla = event.target.innerWidth <= 540 ? 1 : 2;
  }
   //programas
   public getProgramas(){
    var tipo = this.registrarInscripcionForm.controls.tipoSelected.value;
    if('3'!=tipo){
      this.programs = [];
      this.pregradoServ.getProgramasByTipo(tipo).subscribe(     
        tiposObs => {
                    tiposObs.forEach(
                      program=>{
                        program.jornadas.forEach(
                           jornad=>{
                              this.programs.push({nombre:program.nombre, jornada:jornad.jornada, codigo:program.codigo,inscripcion:jornad.inscripcion, jornadas:[], contacto:program.contacto});
                           }
                        );
                      }
                    );
                    //ordenar por nombre de programa
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
          {codigo:'1',nombre:'DOCTORADO EN AGROCIENCIAS',jornada:'N',inscripcion:'S',jornadas:[],contacto:null},
          {codigo:'2',nombre:'DOCTORADO EN EDUCACIÓN',jornada:'N',inscripcion:'S',jornadas:[],contacto:null}
        ];
    }
  }  
  //inscripciÓn
  public enviarDatosInscripcion(){
    this.loading = true;
    var respCaptcha = this.cap.getResponse().toString();
    if(!respCaptcha){
      this.msgCaptchaNoValido=true;
    }
    if (this.registrarInscripcionForm.invalid){
        this.registrarInscripcionForm.markAllAsTouched();
        return;
    }
    else{
      if(!this.cookieService.get(environment.cookieLeadSource)){
        this.cookieService.set(environment.cookieLeadSource,environment.leadSource, 15/1440,'/',environment.dominio);
      }
      var prog = this.registrarInscripcionForm.controls.programaSelected.value;
      this.getProgramaSeleccionado(prog);
      this.pregradoServ.guardarParte1(this.registrarInscripcionForm,this.programaSelected, respCaptcha).subscribe(
           tiposObs => {
              this.mensaje = tiposObs;
              if('fail'!=this.mensaje.status){
                 var tipDoc = this.registrarInscripcionForm.controls.tipoDocumentoSelected.value;
                 this.openGracias(tipDoc);
              }
              else{
                  this.openMensajes(environment.titMensaje,this.mensaje.mensaje,0);
                  this.cap.reset();
              }
           },
          error=>{
                console.log(error)
          }
      );
    }
    this.loading = false;
  }
  //continuar
  public continuarProceso(){
    this.router.navigate(['/pregrado-continuar'])
  }
  //programa seleccionado
  public getProgramaSeleccionado(progSelected: string): void{
    this.programaSelected = new Programa;
    for (let prog of this.programs){
         if(prog.codigo||prog.jornada == progSelected){
           this.programaSelected = prog;
           break;
         }
    }
  }
  //ventana mensajes
  public openMensajes(titulo: string, mensaje: string, opcion: number): void {
    const dialogRef = this.dialog.open(VentanaDialogoMensajesPreg, {
      width: '35%',
      data: {titulo: titulo,
             mensaje: mensaje,
             opcion:opcion
            }
    });

    dialogRef.afterClosed().subscribe(
      result => {
                if(1==opcion){
                   
                }
                else if(2==opcion){
                      this.document.location.href = environment.urlPaginaUniver;    
                }
    });
  }
  //ventana habeas data
  public openHabeasData(): void{
     this.openMensajes(environment.titHabeasData,this.msgHabeasData,0);
  }
  //ventana gracias
  public openGracias(tipoDoc: string): void{
    if('P'==tipoDoc){
      this.openMensajes(environment.titGracias,environment.msgGraciasExt,2);
    }
    else{
        this.openMensajes(environment.titGracias,environment.msgGracias,1);
    }
  }
  //parametros
  public obtenerParametro(name: string){
    const results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if(!results){
      return 0;
    }
    return results[1] || 0;
  }
}

//mensajes
@Component({
  selector: 'ventanaDialogo',
  templateUrl: 'ventanaMensajes.html',
  styleUrls: ['./pregrado.component.css']
})
export class VentanaDialogoMensajesPreg{
  constructor(
    public dialogRef: MatDialogRef<VentanaDialogoMensajesPreg>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  onNoClick(): void {
    this.dialogRef.close();
  }
}


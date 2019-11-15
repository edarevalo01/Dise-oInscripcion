import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Programa } from '../models/Programa';
import { Mensaje } from '../models/Mensaje';
import { FormGroup } from '@angular/forms';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type':  'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})
export class PregradoService {
  private programas : Observable<Programa[]>;
  private mensaje : Observable<Mensaje>;

  constructor(private http: HttpClient) { }

  //programas por tipo
  public getProgramasByTipo(tipo: string) : Observable<Programa[]>{ 
    this.programas = this.http.get<Programa[]>(environment.urlBackend+tipo+'/'+environment.getProgramas);
    return this.programas; 
  }

  //validar continuar
  public validarContinuar(documento: string, programa: string, jornada: string): Observable<Mensaje>{
    this.mensaje = this.http.get<Mensaje>(environment.urlBackend+environment.validarContinuar.replace('?1',documento).replace('?2',programa).replace('?3',jornada));
    return this.mensaje;
  }

  //guardar parte 1
  public guardarParte1(inter : FormGroup, progSelected :  Programa, captcha: string, lead_source: string): Observable<Mensaje>{
    var tipoPrograma : string;
    var tipo = inter.controls.tipoSelected.value;
    var programa : string;
    var jornada  : string;
    if('3'!=tipo){
      programa = inter.controls.programaSelected.value.substring(0,2);
      jornada  = inter.controls.programaSelected.value.substring(2,3);
      if('1'==tipo){
        tipoPrograma='0';
      }
      else if('2'==tipo){
              tipoPrograma='1';
      }
    } 
    else{
        programa = inter.controls.programaSelected.value.substring(0,1)=='1'?'DA':'DE';
        jornada  = inter.controls.programaSelected.value.substring(1,2);
     }
    var interesado = {
      primerNombre: inter.controls.primerNombre.value.toUpperCase().trim(),
      segundoNombre: (null==inter.controls.segundoNombre.value) ? null : inter.controls.segundoNombre.value.toUpperCase().trim(),
      primerApellido: inter.controls.primerApellido.value.toUpperCase().trim(),
      segundoApellido: (null==inter.controls.segundoApellido.value) ? null : inter.controls.segundoApellido.value.toUpperCase().trim(),
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
    this.mensaje = this.http.post<Mensaje>(environment.urlBackend+environment.guardarParte1, JSON.stringify(interesado), httpOptions);
    return this.mensaje;
  }
}

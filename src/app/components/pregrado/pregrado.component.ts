import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-pregrado",
  templateUrl: "./pregrado.component.html",
  styleUrls: ["./pregrado.component.css"]
})
export class PregradoComponent implements OnInit {
  breakpoint: number;

  inscripcion: boolean = true;
  labelBotonDerecho: string = "CONTINUAR";
  tituloDerecho: string = "Bienevenido de nuevo!";
  contentDerecho: string =
    "Estamos listos para llevar tu proceso de admisión al siguiente nivel, en cualquier momento que lo necesites! para mantenerte conectado con nosotros, inicie sesión con su información personal";
  labelBotonIzquierdo: string = "INCRÍBIRME";
  tituloIzquierdo: string = "Inscríbete";
  contentIzquierdo: string = "Ingresa tus datos personales e inicia un viaje estrella paso a paso al programa académico de tú interés";

  constructor() {}

  cambiarRegistro() {
    this.inscripcion = !this.inscripcion;
    if (this.inscripcion) {
      this.labelBotonDerecho = "CONTINUAR";
      this.tituloDerecho = "Bienevenido de nuevo!";
      this.contentDerecho =
        "Estamos listos para llevar tu proceso de admisión al siguiente nivel, en cualquier momento que lo necesites! para mantenerte conectado con nosotros, inicie sesión con su información personal";
      this.labelBotonIzquierdo = "INCRÍBIRME";
      this.tituloIzquierdo = "Inscríbete";
      this.contentIzquierdo = "Ingresa tus datos personales e inicia un viaje estrella paso a paso al programa académico de tú interés";
    } else {
      this.labelBotonDerecho = "INCRÍBIRME";
      this.tituloDerecho = "Proceso de admisión!";
      this.contentDerecho =
        "Donec imperdiet lacus eget tellus tincidunt, ut fringilla elit blandit. Aliquam mollis erat quis lacinia hendrerit. Cras consectetur purus nec est tempor, quis faucibus diam vestibulum.";
      this.labelBotonIzquierdo = "CONTINUAR";
      this.tituloIzquierdo = "Bienevenido de nuevo!";
      this.contentIzquierdo =
        "Estamos listos para llevar tu proceso de admisión al siguiente nivel, en cualquier momento que lo necesites!";
    }
  }

  ngOnInit() {
    this.breakpoint = window.innerWidth <= 540 ? 1 : 2;
  }

  onResize(event) {
    this.breakpoint = event.target.innerWidth <= 540 ? 1 : 2;
  }
}

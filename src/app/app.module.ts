import { BrowserModule } from "@angular/platform-browser";
import { NgModule, Injectable } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import {
	MatButtonModule,
	MatIconModule,
	MatGridListModule,
	MatSelectModule,
	MatCheckboxModule,
	MatDialogModule,
	MatProgressSpinnerModule,
	MatProgressBarModule
} from "@angular/material";
import { MatDividerModule } from "@angular/material";
import { PregradoComponent, VentanaDialogoMensajesPreg } from "./components/pregrado/pregrado.component";
import { HttpClientModule } from "@angular/common/http";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ScrollingModule } from "@angular/cdk/scrolling";
import { PregradoContinuarComponent, VentanaDialogoMensajes } from "./components/pregrado-continuar/pregrado-continuar.component";
import { CookieService } from "ngx-cookie-service";
import { RecaptchaModule } from "ng-recaptcha";
import { GraciasComponent } from "./components/gracias/gracias.component";

@NgModule({
	declarations: [
		AppComponent,
		PregradoComponent,
		VentanaDialogoMensajes,
		VentanaDialogoMensajesPreg,
		PregradoContinuarComponent,
		GraciasComponent
	],
	entryComponents: [VentanaDialogoMensajes, VentanaDialogoMensajesPreg],
	imports: [
		BrowserModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		MatInputModule,
		MatCardModule,
		MatButtonModule,
		MatDividerModule,
		MatIconModule,
		MatButtonModule,
		MatGridListModule,
		MatSelectModule,
		HttpClientModule,
		FormsModule,
		ScrollingModule,
		ReactiveFormsModule,
		MatCheckboxModule,
		MatDialogModule,
		MatProgressSpinnerModule,
		RecaptchaModule,
		MatProgressBarModule
	],
	providers: [CookieService],
	bootstrap: [AppComponent]
})
export class AppModule {}

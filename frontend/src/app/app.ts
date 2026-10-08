import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './componentes/navbar/navbar';
import { Footer } from './componentes/footer/footer';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, Footer],
  templateUrl: './app.component.html', // (o './app.html' según el que hayas limpiado)
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'San Gabriel';
}
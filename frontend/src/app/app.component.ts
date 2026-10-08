import { Component } from '@angular/core';

// RouterOutlet es el marcador de posición donde Angular dibuja cada ruta activa
import { RouterOutlet } from '@angular/router';

// Importamos las clases de los dos componentes que creamos recién
import { Navbar } from './componentes/navbar/navbar';
import { Footer } from './componentes/footer/footer';

@Component({
  // Selector que monta la aplicación en el body de index.html (<app-root></app-root>)
  selector: 'app-root',

  // Declaramos los componentes hijos para que el HTML los reconozca como etiquetas válidas
  imports: [RouterOutlet, Navbar, Footer],

  templateUrl: './app.component.html',
  styleUrl: './app.css'
})
export class AppComponent {
  title = 'San Gabriel';
}
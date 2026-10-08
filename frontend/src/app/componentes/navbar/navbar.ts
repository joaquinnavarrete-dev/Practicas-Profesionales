// Importamos 'Component' para definir la configuración del bloque de interfaz
import { Component } from '@angular/core';

// Importamos 'RouterLink' para poder navegar entre vistas mediante enlaces sin recargar el navegador
import { RouterLink } from '@angular/router';

@Component({
  // Etiqueta HTML personalizada que usaremos para renderizar este componente (<app-navbar></app-navbar>)
  selector: 'app-navbar',

  // Declaramos qué herramientas externas o directivas necesita este template (en este caso, enlaces de rutas)
  imports: [RouterLink],

  // Archivo donde reside la estructura visual HTML
  templateUrl: './navbar.html',

  // Archivo de estilos encapsulados para este componente
  styleUrl: './navbar.css'
})
// Exportamos la clase para que pueda ser importada en app.component.ts o en cualquier otra vista
export class Navbar {}
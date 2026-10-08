// Importamos el decorador base de componentes
import { Component } from '@angular/core';

@Component({
  // Selector con el que usaremos el pie de página en otras plantillas
  selector: 'app-footer',

  // No requiere módulos adicionales ya que solo muestra contenido estático
  imports: [],

  // Plantilla HTML del pie de página
  templateUrl: './footer.html',

  // Hoja de estilos del pie de página
  styleUrl: './footer.css'
})
// Clase exportada para su integración en la aplicación
export class Footer {}
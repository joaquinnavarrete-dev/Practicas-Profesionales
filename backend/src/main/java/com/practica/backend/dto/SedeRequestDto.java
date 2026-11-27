package com.practica.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SedeRequestDto {

    @NotBlank(message = "El nombre de la sede es obligatorio")
    @Size(max = 150, message = "El nombre de la sede no puede superar los 150 caracteres")
    private String nombre;

    @NotBlank(message = "La direccion es un campo obligatorio")
    @Size(max = 255, message = "La direccion no debe tener mas de 255 caracteres")
    private String direccion;

    @NotBlank(message = "El telefono es un campo obligatorio")
    @Size(max = 20, message = "El telefono no debe superar los 20 caracteres")
    private String telefono;

    @NotBlank(message = "El correo electronico es obligatorio")
    @Size(max = 255, message = "El correo electronico no debe tener mas de 255 caracteres")
    private String email;

    @NotBlank(message = "El horario de atencion es obligatorio")
    @Size(max = 100, message = "El horario de atencion no debe superar los 100 caracteres")
    private String horario_atencion;

    @Builder.Default
    private Boolean activa = true;
}

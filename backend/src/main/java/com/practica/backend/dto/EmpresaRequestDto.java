package com.practica.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmpresaRequestDto {

    @NotBlank(message = "El nombre de la empresa es un campo obligatorio")
    @Size(max = 150, message = "El nombre de la empresa no puede superar los 150 caracteres")
    private String nombre;

    @NotBlank(message = "El cuit es un campo obligatorio")
    @Size(max = 15, message = "El cuit no puede superar los 15 caracteres")
    private String cuit;

    @NotBlank(message = "El domicilio es un campo obligatorio")
    private String domicilio;

    @NotNull(message = "El telefono es un campo obligatorio")
    @Size(max = 25, message = "El telefono no puede superar los 25 caracteres")
    private String telefono;

    @NotBlank(message = "El correo electronico es un campo obligatorio")
    private String email;

    @NotBlank(message = "El rubro es un campo obligatorio")
    @Size(max = 50, message = "El rubro no puede superar los 50 caracteres")
    private String rubro;

}

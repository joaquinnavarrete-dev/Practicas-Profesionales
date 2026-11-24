package com.practica.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProveedorRequestDto {

    @NotBlank(message = "La razon social es obligatoria")
    @Size(max = 150, message = "La razon social no debe superar los 150 caracteres")
    private String razonSocial;

    @NotBlank(message = "El cuit es un campo obligatorio")
    @Size(max = 20, message = "El cuit no debe superar los 20 caracteres")
    private String cuit;

    @NotBlank(message = "El rubro es un campo obligatorio")
    @Size(max = 50, message = "El rubro no debe superar los 50 caracteres")
    private String rubro;

    @NotBlank(message = "El telefono es un campo obligatorio")
    @Size(max = 20, message = "El telefono no debe superar los 20 caracteres")
    private String telefono;

    @NotBlank(message = "El correo electronico es un campo obligatorio")
    @Size(max = 255, message = "El correo electronico no debe superar los 255 caracteres")
    private String email;

    @NotBlank(message = "El estado es un campo obligatorio")
    @Builder.Default
    private String estado = "Activo";
}

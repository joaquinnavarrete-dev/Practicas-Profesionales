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
public class EmpresaResponseDto {

    private Integer id;
    private String nombre;
    private String cuit;
    private String domicilio;
    private String telefono;
    private String email;
    private String rubro;
}

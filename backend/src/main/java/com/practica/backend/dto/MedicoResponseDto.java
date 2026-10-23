package com.practica.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicoResponseDto {

    private Integer idMedico;
    private String nombre;
    private String apellido;
    private String matricula;
    private EspecialidadResponseDto especialidad;
    private Integer idUsuario;
    private String nombreUsuario;
}

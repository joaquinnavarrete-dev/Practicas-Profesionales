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
public class PacienteResponseDto {

    private Integer idPaciente;
    private String dni;
    private String nombre;
    private String apellido;
    private String telefono;
    private ObraSocialResponseDto obraSocial;
    private Integer idUsuario;
    private String nombreUsuario;
}

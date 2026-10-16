package com.practica.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

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
public class TurnoResponseDto {

    private Integer idTurno;
    private PacienteResponseDto paciente;
    private MedicoResponseDto medico;
    private EspecialidadResponseDto especialidad;
    private LocalDate fecha;
    private LocalTime hora;
}

package com.practica.backend.dto;

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
public class DiaAtencionResponseDto {

    private Integer idDiaAtencion;
    private Integer idMedico;
    private String nombreMedico;
    private String diaSemana;
    private String nombreDia;
    private LocalTime horaInicio;
    private LocalTime horaFin;
}

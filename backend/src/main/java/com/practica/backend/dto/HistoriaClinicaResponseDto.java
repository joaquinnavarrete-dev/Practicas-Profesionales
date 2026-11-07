package com.practica.backend.dto;

import java.time.LocalDate;

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
public class HistoriaClinicaResponseDto {

    private Integer idHistoriaClinica;
    private Integer idPaciente;
    private PacienteResponseDto paciente;
    private Integer idMedico;
    private MedicoResponseDto medico;
    private Integer idTurno;
    private LocalDate fecha;
    private String motivoConsulta;
    private String diagnostico;
    private String tratamiento;
    private String observaciones;
}


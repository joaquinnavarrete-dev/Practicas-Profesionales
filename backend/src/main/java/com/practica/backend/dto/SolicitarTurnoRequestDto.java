package com.practica.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

import com.fasterxml.jackson.annotation.JsonFormat;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Datos para que un paciente autenticado reserve un turno sin enviar su ID de paciente")
public class SolicitarTurnoRequestDto {

    @NotNull(message = "El id del médico es obligatorio")
    @Schema(description = "ID del médico", example = "1")
    private Integer idMedico;

    @NotNull(message = "El id de la especialidad es obligatorio")
    @Schema(description = "ID de la especialidad", example = "1")
    private Integer idEspecialidad;

    @NotNull(message = "La fecha es obligatoria")
    @FutureOrPresent(message = "La fecha no puede ser anterior al día de hoy")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Fecha del turno (AAAA-MM-DD)", example = "2026-11-05")
    private LocalDate fecha;

    @NotNull(message = "La hora es obligatoria")
    @JsonFormat(pattern = "HH:mm")
    @Schema(description = "Hora del turno (HH:mm)", example = "09:30")
    private LocalTime hora;
}

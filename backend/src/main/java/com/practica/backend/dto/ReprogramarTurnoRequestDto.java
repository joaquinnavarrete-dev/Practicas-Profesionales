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
@Schema(description = "Datos para reprogramar la fecha y hora de un turno existente")
public class ReprogramarTurnoRequestDto {

    @NotNull(message = "La nueva fecha es obligatoria")
    @FutureOrPresent(message = "La nueva fecha debe ser actual o futura")
    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Nueva fecha para el turno (AAAA-MM-DD)", example = "2026-11-12")
    private LocalDate nuevaFecha;

    @NotNull(message = "La nueva hora es obligatoria")
    @JsonFormat(pattern = "HH:mm")
    @Schema(description = "Nueva hora para el turno (HH:mm)", example = "16:00")
    private LocalTime nuevaHora;
}

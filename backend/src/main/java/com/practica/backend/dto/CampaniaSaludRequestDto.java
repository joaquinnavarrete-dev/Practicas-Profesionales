package com.practica.backend.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaniaSaludRequestDto {

    @NotBlank(message = "El nombre de la campañia es obligatorio")
    @Size(max = 150, message = "El nombre de la campania no puede superar los 50 caracteres")
    private String nombre;

    @NotBlank(message = "La descripcion es un campo obligatorio")
    @Size(max = 255, message = "La descripcion no puede superar los 255 caracteres")
    private String descripcion;

    @NotNull(message = "La fecha de inicio es un campo obligatorio")
    @FutureOrPresent(message = "La fecha de inicio debe ser actual o futura")
    private LocalDate fechaInicio;

    @NotNull(message = "La fecha de fin es un campo obligatorio")
    @Future(message = "La fecha de fin debe ser futura")
    private LocalDate fechaFin;

    @NotBlank(message = "El publico objetivo es un campo obligatorio")
    @Size(max = 50, message = "El publico objetivo no debe superar los 50 caracteres")
    private String publicoObjetivo;

    @NotNull(message = "El cupo maximo es un campo obligatorio")
    private Integer cupoMaximo;

    @NotBlank(message = "El estado es un campo obligatorio")
    @Size(max = 20, message = "El estado no debe superar los 20 caracteres")
    @Builder.Default
    private String estado = "Planificada";
}

package com.practica.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
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
public class MedicoRequestDto {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no puede superar los 100 caracteres")
    private String apellido;

    @NotBlank(message = "La matrícula es obligatoria")
    @Size(max = 100, message = "La matrícula no puede superar los 100 caracteres")
    private String matricula;

    @NotNull(message = "El id de especialidad es obligatorio")
    @io.swagger.v3.oas.annotations.media.Schema(description = "ID de la especialidad del médico", example = "1")
    private Integer idEspecialidad;

    @io.swagger.v3.oas.annotations.media.Schema(description = "ID de la cuenta de usuario asociada al médico (opcional)", example = "4")
    private Integer idUsuario;
}

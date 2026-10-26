package com.practica.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Datos para el auto-registro público de un nuevo paciente en la plataforma")
public class RegistroPacienteRequestDto {

    @NotBlank(message = "El DNI es obligatorio")
    @Size(max = 20, message = "El DNI no puede superar los 20 caracteres")
    @Schema(description = "Documento Nacional de Identidad del paciente", example = "42333444")
    private String dni;

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede superar los 100 caracteres")
    @Schema(description = "Nombre(s) del paciente", example = "Juan")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    @Size(max = 100, message = "El apellido no puede superar los 100 caracteres")
    @Schema(description = "Apellido(s) del paciente", example = "Pérez")
    private String apellido;

    @NotBlank(message = "El teléfono es obligatorio")
    @Size(max = 30, message = "El teléfono no puede superar los 30 caracteres")
    @Schema(description = "Número telefónico de contacto", example = "3814123456")
    private String telefono;

    @NotNull(message = "El id de la obra social es obligatorio")
    @Schema(description = "ID de la obra social asociada", example = "1")
    private Integer idObraSocial;

    @NotBlank(message = "El nombre de usuario es obligatorio")
    @Size(max = 50, message = "El nombre de usuario no puede superar los 50 caracteres")
    @Schema(description = "Nombre de usuario o email único para iniciar sesión", example = "juanperez")
    private String nombreUsuario;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    @Schema(description = "Contraseña para la cuenta (mínimo 6 caracteres)", example = "secreto123")
    private String contrasena;
}

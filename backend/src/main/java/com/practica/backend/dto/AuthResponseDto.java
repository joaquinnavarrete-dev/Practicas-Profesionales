package com.practica.backend.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Respuesta de autenticación exitosa con token JWT y datos de sesión")
public class AuthResponseDto {

    @Schema(description = "Token de acceso JWT firmado", example = "eyJhbGciOiJIUzI1NiIsIn...")
    private String token;

    @Builder.Default
    @Schema(description = "Tipo de token", example = "Bearer")
    private String tipo = "Bearer";

    @Schema(description = "ID del usuario autenticado", example = "1")
    private Integer idUsuario;

    @Schema(description = "Nombre de usuario autenticado", example = "admin")
    private String nombreUsuario;

    @Schema(description = "Rol asignado en el sistema", example = "ADMINISTRADOR")
    private String rol;

    @Schema(description = "ID de paciente asociado (si el usuario es un paciente)", example = "12")
    private Integer idPaciente;

    @Schema(description = "ID de médico asociado (si el usuario es un médico)", example = "3")
    private Integer idMedico;
}

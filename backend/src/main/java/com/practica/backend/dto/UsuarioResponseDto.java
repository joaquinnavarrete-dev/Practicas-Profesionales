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
public class UsuarioResponseDto {

    private Integer idUsuario;
    private String nombreUsuario;
    private Boolean activo;
    private RolResponseDto rol;
}

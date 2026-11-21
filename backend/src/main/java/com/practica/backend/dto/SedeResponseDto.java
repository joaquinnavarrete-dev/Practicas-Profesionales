package com.practica.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SedeResponseDto {

    private Integer id;
    private String nombre;
    private String direccion;
    private String telefono;
    private String email;
    private String horario_atencion;
    private Boolean activa;
}

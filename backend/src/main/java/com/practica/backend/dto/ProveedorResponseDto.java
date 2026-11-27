package com.practica.backend.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProveedorResponseDto {

    private Integer id;
    private String razonSocial;
    private String cuit;
    private String rubro;
    private String telefono;
    private String email;
    private String estado;
}

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
public class ObraSocialResponseDto {

    private Integer idObraSocial;
    private String nombre;
    private String sigla;
}

package com.practica.backend.service;

import java.util.List;

import com.practica.backend.dto.EspecialidadRequestDto;
import com.practica.backend.dto.EspecialidadResponseDto;

public interface EspecialidadService {

    List<EspecialidadResponseDto> listarTodas();

    EspecialidadResponseDto buscarPorId(Integer id);

    EspecialidadResponseDto crear(EspecialidadRequestDto dto);

    EspecialidadResponseDto actualizar(Integer id, EspecialidadRequestDto dto);

    void eliminar(Integer id);
}

package com.practica.backend.service;

import java.util.List;

import com.practica.backend.dto.DiaAtencionRequestDto;
import com.practica.backend.dto.DiaAtencionResponseDto;

public interface DiaAtencionService {

    List<DiaAtencionResponseDto> listarTodos();

    List<DiaAtencionResponseDto> listarPorMedico(Integer idMedico);

    DiaAtencionResponseDto buscarPorId(Integer id);

    DiaAtencionResponseDto crear(DiaAtencionRequestDto dto);

    DiaAtencionResponseDto actualizar(Integer id, DiaAtencionRequestDto dto);

    void eliminar(Integer id);
}

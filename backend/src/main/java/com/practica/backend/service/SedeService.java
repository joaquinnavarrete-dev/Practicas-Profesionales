package com.practica.backend.service;

import com.practica.backend.dto.SedeRequestDto;
import com.practica.backend.dto.SedeResponseDto;

import java.util.List;

public interface SedeService {

    List<SedeResponseDto> listarSedes();

    SedeResponseDto buscarPorId(Integer id);

    SedeResponseDto buscarPorNombre(String nombre);

    List<SedeResponseDto> listarSedesPorEstado(Boolean estado);

    SedeResponseDto crear(SedeRequestDto dto);

    SedeResponseDto actualizar(Integer id, SedeRequestDto dto);

    SedeResponseDto cambiarEstado(Integer id, Boolean estado);

    void eliminar(Integer id);
}

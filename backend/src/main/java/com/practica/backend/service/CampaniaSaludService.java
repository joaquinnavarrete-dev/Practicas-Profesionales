package com.practica.backend.service;

import com.practica.backend.dto.CampaniaSaludRequestDto;
import com.practica.backend.dto.CampaniaSaludResponseDto;

import java.util.List;

public interface CampaniaSaludService {

    List<CampaniaSaludResponseDto> listarCampanias();

    CampaniaSaludResponseDto buscarPorId(Integer id);

    CampaniaSaludResponseDto buscarPorNombre(String nombre);

    List<CampaniaSaludResponseDto> listarPorEstado(String estado);

    CampaniaSaludResponseDto crear(CampaniaSaludRequestDto dto);

    CampaniaSaludResponseDto actualizar(Integer id, CampaniaSaludRequestDto dto);

    CampaniaSaludResponseDto cambiarEstado(Integer id, String estado);

    void eliminar(Integer id);
}

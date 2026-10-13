package com.practica.backend.service;

import java.util.List;

import com.practica.backend.dto.ObraSocialRequestDto;
import com.practica.backend.dto.ObraSocialResponseDto;

public interface ObraSocialService {

    List<ObraSocialResponseDto> listarTodas();

    ObraSocialResponseDto buscarPorId(Integer id);

    ObraSocialResponseDto crear(ObraSocialRequestDto dto);

    ObraSocialResponseDto actualizar(Integer id, ObraSocialRequestDto dto);

    void eliminar(Integer id);
}

package com.practica.backend.service;

import java.util.List;

import com.practica.backend.dto.RolRequestDto;
import com.practica.backend.dto.RolResponseDto;

public interface RolService {

    List<RolResponseDto> listarTodos();

    RolResponseDto buscarPorId(Integer id);

    RolResponseDto crear(RolRequestDto dto);

    RolResponseDto actualizar(Integer id, RolRequestDto dto);

    void eliminar(Integer id);
}

package com.practica.backend.service;

import java.util.List;

import com.practica.backend.dto.MedicoRequestDto;
import com.practica.backend.dto.MedicoResponseDto;

public interface MedicoService {

    List<MedicoResponseDto> listarTodos();

    MedicoResponseDto buscarPorId(Integer id);

    List<MedicoResponseDto> listarPorEspecialidad(Integer idEspecialidad);

    MedicoResponseDto crear(MedicoRequestDto dto);

    MedicoResponseDto actualizar(Integer id, MedicoRequestDto dto);

    void eliminar(Integer id);
}

package com.practica.backend.service;

import java.util.List;

import com.practica.backend.dto.ActualizarPerfilPacienteRequestDto;
import com.practica.backend.dto.PacienteRequestDto;
import com.practica.backend.dto.PacienteResponseDto;

public interface PacienteService {

    List<PacienteResponseDto> listarTodos();

    PacienteResponseDto buscarPorId(Integer id);

    PacienteResponseDto buscarPorDni(String dni);

    List<PacienteResponseDto> listarPorObraSocial(Integer idObraSocial);

    PacienteResponseDto crear(PacienteRequestDto dto);

    PacienteResponseDto actualizar(Integer id, PacienteRequestDto dto);

    void eliminar(Integer id);

    PacienteResponseDto obtenerMiPerfil(String nombreUsuario);

    PacienteResponseDto actualizarMiPerfil(String nombreUsuario, ActualizarPerfilPacienteRequestDto dto);
}

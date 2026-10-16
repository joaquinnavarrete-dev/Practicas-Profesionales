package com.practica.backend.service;

import java.util.List;

import com.practica.backend.dto.UsuarioRequestDto;
import com.practica.backend.dto.UsuarioResponseDto;

public interface UsuarioService {

    List<UsuarioResponseDto> listarTodos();

    UsuarioResponseDto buscarPorId(Integer id);

    UsuarioResponseDto buscarPorNombreUsuario(String nombreUsuario);

    List<UsuarioResponseDto> listarPorRol(Integer idRol);

    UsuarioResponseDto crear(UsuarioRequestDto dto);

    UsuarioResponseDto actualizar(Integer id, UsuarioRequestDto dto);

    UsuarioResponseDto cambiarEstado(Integer id, Boolean activo);

    void eliminar(Integer id);
}

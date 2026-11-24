package com.practica.backend.service;

import com.practica.backend.dto.ProveedorRequestDto;
import com.practica.backend.dto.ProveedorResponseDto;

import java.util.List;

public interface ProveedorService {

    List<ProveedorResponseDto> listarProveedores();

    ProveedorResponseDto buscarPorId(Integer id);

    ProveedorResponseDto buscarPorRazonSocial(String razon);

    List<ProveedorResponseDto> listarProveedoresPorEstado(String estado);

    ProveedorResponseDto crear(ProveedorRequestDto dto);

    ProveedorResponseDto actualizar(Integer id, ProveedorRequestDto dto);

    ProveedorResponseDto cambiarEstado(Integer id, String estado);

    void eliminar(Integer id);
}

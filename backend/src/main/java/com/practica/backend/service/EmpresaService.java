package com.practica.backend.service;

import com.practica.backend.dto.EmpresaRequestDto;
import com.practica.backend.dto.EmpresaResponseDto;

import java.util.List;

public interface EmpresaService {

    List<EmpresaResponseDto> listarEmpresas();

    EmpresaResponseDto buscarPorId(Integer id);

    EmpresaResponseDto crear(EmpresaRequestDto dto);

    EmpresaResponseDto actualizar(Integer id, EmpresaRequestDto dto);

    void eliminar(Integer id);
}

package com.practica.backend.service;

import java.util.List;

import com.practica.backend.dto.HistoriaClinicaRequestDto;
import com.practica.backend.dto.HistoriaClinicaResponseDto;

public interface HistoriaClinicaService {

    List<HistoriaClinicaResponseDto> listarPorPaciente(Integer idPaciente);

    HistoriaClinicaResponseDto buscarPorId(Integer id);

    HistoriaClinicaResponseDto crear(HistoriaClinicaRequestDto dto);

    void eliminar(Integer id);
}


package com.practica.backend.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import com.practica.backend.dto.TurnoDisponibleResponseDto;
import com.practica.backend.dto.TurnoRequestDto;
import com.practica.backend.dto.TurnoResponseDto;

public interface TurnoService {

    List<TurnoResponseDto> listarTodos();

    TurnoResponseDto buscarPorId(Integer id);

    List<TurnoResponseDto> listarPorMedicoYFecha(Integer idMedico, LocalDate fecha);

    List<TurnoResponseDto> listarPorPaciente(Integer idPaciente);

    List<TurnoResponseDto> listarPorFecha(LocalDate fecha);

    List<TurnoDisponibleResponseDto> consultarTurnosDisponibles(Integer idMedico, LocalDate fecha);

    TurnoResponseDto reservarTurno(TurnoRequestDto dto);

    TurnoResponseDto reprogramarTurno(Integer id, LocalDate nuevaFecha, LocalTime nuevaHora);

    void cancelarTurno(Integer id);
}

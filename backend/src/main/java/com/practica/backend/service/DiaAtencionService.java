package com.practica.backend.service;

import java.time.LocalTime;
import java.util.List;

import com.practica.backend.dto.DiaAtencionRequestDto;
import com.practica.backend.dto.DiaAtencionResponseDto;
import com.practica.backend.dto.TurnoResponseDto;

public interface DiaAtencionService {

    List<DiaAtencionResponseDto> listarTodos();

    List<DiaAtencionResponseDto> listarPorMedico(Integer idMedico);

    DiaAtencionResponseDto buscarPorId(Integer id);

    DiaAtencionResponseDto crear(DiaAtencionRequestDto dto);

    DiaAtencionResponseDto actualizar(Integer id, DiaAtencionRequestDto dto);

    DiaAtencionResponseDto actualizar(Integer id, DiaAtencionRequestDto dto, boolean forzar);

    void eliminar(Integer id);

    void eliminar(Integer id, boolean forzar);

    List<TurnoResponseDto> obtenerTurnosAfectados(Integer idDiaAtencion, String nuevoDiaSemana, LocalTime nuevaHoraInicio, LocalTime nuevaHoraFin);

    List<TurnoResponseDto> obtenerTurnosAfectadosPorEliminacion(Integer idDiaAtencion);
}

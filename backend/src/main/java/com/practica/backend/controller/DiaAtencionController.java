package com.practica.backend.controller;

import java.time.LocalTime;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.practica.backend.dto.DiaAtencionRequestDto;
import com.practica.backend.dto.DiaAtencionResponseDto;
import com.practica.backend.dto.TurnoResponseDto;
import com.practica.backend.service.DiaAtencionService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/dias-atencion")
@RequiredArgsConstructor
@Tag(name = "Días de Atención", description = "Endpoints para la gestión de días y horarios de atención médica")
public class DiaAtencionController {

    private final DiaAtencionService diaAtencionService;

    @GetMapping
    @Operation(summary = "Listar todos los días y horarios de atención")
    public ResponseEntity<List<DiaAtencionResponseDto>> listarTodos() {
        return ResponseEntity.ok(diaAtencionService.listarTodos());
    }

    @GetMapping("/medico/{idMedico}")
    @Operation(summary = "Listar días y horarios de atención de un médico")
    public ResponseEntity<List<DiaAtencionResponseDto>> listarPorMedico(@PathVariable Integer idMedico) {
        return ResponseEntity.ok(diaAtencionService.listarPorMedico(idMedico));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar día de atención por ID")
    public ResponseEntity<DiaAtencionResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(diaAtencionService.buscarPorId(id));
    }

    @GetMapping("/{id}/turnos-afectados")
    @Operation(summary = "Consultar turnos futuros afectados por una modificación o eliminación de horario")
    public ResponseEntity<List<TurnoResponseDto>> obtenerTurnosAfectados(
            @PathVariable Integer id,
            @RequestParam(required = false) String nuevoDiaSemana,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime nuevaHoraInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime nuevaHoraFin) {
        if (nuevoDiaSemana == null && nuevaHoraInicio == null && nuevaHoraFin == null) {
            return ResponseEntity.ok(diaAtencionService.obtenerTurnosAfectadosPorEliminacion(id));
        }
        return ResponseEntity.ok(diaAtencionService.obtenerTurnosAfectados(id, nuevoDiaSemana, nuevaHoraInicio, nuevaHoraFin));
    }

    @PostMapping
    @Operation(summary = "Asignar horario de atención a un médico")
    public ResponseEntity<DiaAtencionResponseDto> crear(@Valid @RequestBody DiaAtencionRequestDto dto) {
        return new ResponseEntity<>(diaAtencionService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar horario de atención existente")
    public ResponseEntity<DiaAtencionResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody DiaAtencionRequestDto dto,
            @RequestParam(defaultValue = "false") boolean forzar) {
        return ResponseEntity.ok(diaAtencionService.actualizar(id, dto, forzar));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar horario de atención por ID")
    public ResponseEntity<Void> eliminar(
            @PathVariable Integer id,
            @RequestParam(defaultValue = "false") boolean forzar) {
        diaAtencionService.eliminar(id, forzar);
        return ResponseEntity.noContent().build();
    }
}

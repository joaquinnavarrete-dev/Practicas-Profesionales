package com.practica.backend.controller;

import java.time.LocalDate;
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

import com.practica.backend.dto.TurnoDisponibleResponseDto;
import com.practica.backend.dto.TurnoRequestDto;
import com.practica.backend.dto.TurnoResponseDto;
import com.practica.backend.service.TurnoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/turnos")
@RequiredArgsConstructor
@Tag(name = "Turnos", description = "Endpoints para la gestión, consulta y reserva de turnos clínicos")
public class TurnoController {

    private final TurnoService turnoService;

    @GetMapping("/mis-turnos")
    @Operation(summary = "Listar los turnos del paciente actualmente autenticado")
    public ResponseEntity<List<TurnoResponseDto>> listarMisTurnos(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        return ResponseEntity.ok(turnoService.listarMisTurnos(userDetails.getUsername()));
    }

    @PostMapping("/solicitar")
    @Operation(summary = "Solicitar y reservar un nuevo turno para el paciente autenticado")
    public ResponseEntity<TurnoResponseDto> solicitarTurno(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @Valid @RequestBody com.practica.backend.dto.SolicitarTurnoRequestDto dto) {
        return new ResponseEntity<>(turnoService.solicitarTurno(userDetails.getUsername(), dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/mis-turnos/{id}")
    @Operation(summary = "Cancelar un turno perteneciente al paciente autenticado")
    public ResponseEntity<Void> cancelarMiTurno(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails,
            @PathVariable Integer id) {
        turnoService.cancelarMiTurno(userDetails.getUsername(), id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    @Operation(summary = "Listar todos los turnos")
    public ResponseEntity<List<TurnoResponseDto>> listarTodos() {
        return ResponseEntity.ok(turnoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar turno por ID")
    public ResponseEntity<TurnoResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(turnoService.buscarPorId(id));
    }

    @GetMapping("/disponibles")
    @Operation(summary = "Consultar turnos disponibles por médico y fecha")
    public ResponseEntity<List<TurnoDisponibleResponseDto>> consultarDisponibles(
            @RequestParam Integer idMedico,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(turnoService.consultarTurnosDisponibles(idMedico, fecha));
    }

    @GetMapping("/agenda")
    @Operation(summary = "Consultar agenda de turnos por médico y fecha")
    public ResponseEntity<List<TurnoResponseDto>> listarPorMedicoYFecha(
            @RequestParam Integer idMedico,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha) {
        return ResponseEntity.ok(turnoService.listarPorMedicoYFecha(idMedico, fecha));
    }

    @GetMapping("/paciente/{idPaciente}")
    @Operation(summary = "Listar turnos de un paciente")
    public ResponseEntity<List<TurnoResponseDto>> listarPorPaciente(@PathVariable Integer idPaciente) {
        return ResponseEntity.ok(turnoService.listarPorPaciente(idPaciente));
    }

    @PostMapping
    @Operation(summary = "Reservar un nuevo turno")
    public ResponseEntity<TurnoResponseDto> reservar(@Valid @RequestBody TurnoRequestDto dto) {
        return new ResponseEntity<>(turnoService.reservarTurno(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/reprogramar")
    @Operation(summary = "Reprogramar un turno existente")
    public ResponseEntity<TurnoResponseDto> reprogramar(
            @PathVariable Integer id,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate nuevaFecha,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime nuevaHora) {
        return ResponseEntity.ok(turnoService.reprogramarTurno(id, nuevaFecha, nuevaHora));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Cancelar un turno")
    public ResponseEntity<Void> cancelar(@PathVariable Integer id) {
        turnoService.cancelarTurno(id);
        return ResponseEntity.noContent().build();
    }
}

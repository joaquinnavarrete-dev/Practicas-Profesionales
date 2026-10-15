package com.practica.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.practica.backend.dto.PacienteRequestDto;
import com.practica.backend.dto.PacienteResponseDto;
import com.practica.backend.service.PacienteService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pacientes")
@RequiredArgsConstructor
@Tag(name = "Pacientes", description = "Endpoints para la gestión de pacientes")
public class PacienteController {

    private final PacienteService pacienteService;

    @GetMapping
    @Operation(summary = "Listar todos los pacientes")
    public ResponseEntity<List<PacienteResponseDto>> listarTodos() {
        return ResponseEntity.ok(pacienteService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar paciente por ID")
    public ResponseEntity<PacienteResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(pacienteService.buscarPorId(id));
    }

    @GetMapping("/dni/{dni}")
    @Operation(summary = "Buscar paciente por DNI")
    public ResponseEntity<PacienteResponseDto> buscarPorDni(@PathVariable String dni) {
        return ResponseEntity.ok(pacienteService.buscarPorDni(dni));
    }

    @GetMapping("/obra-social/{idObraSocial}")
    @Operation(summary = "Listar pacientes por obra social")
    public ResponseEntity<List<PacienteResponseDto>> listarPorObraSocial(@PathVariable Integer idObraSocial) {
        return ResponseEntity.ok(pacienteService.listarPorObraSocial(idObraSocial));
    }

    @PostMapping
    @Operation(summary = "Registrar nuevo paciente")
    public ResponseEntity<PacienteResponseDto> crear(@Valid @RequestBody PacienteRequestDto dto) {
        return new ResponseEntity<>(pacienteService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar paciente existente")
    public ResponseEntity<PacienteResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody PacienteRequestDto dto) {
        return ResponseEntity.ok(pacienteService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar paciente por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        pacienteService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

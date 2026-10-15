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

import com.practica.backend.dto.MedicoRequestDto;
import com.practica.backend.dto.MedicoResponseDto;
import com.practica.backend.service.MedicoService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/medicos")
@RequiredArgsConstructor
@Tag(name = "Médicos", description = "Endpoints para la gestión de profesionales médicos")
public class MedicoController {

    private final MedicoService medicoService;

    @GetMapping
    @Operation(summary = "Listar todos los médicos")
    public ResponseEntity<List<MedicoResponseDto>> listarTodos() {
        return ResponseEntity.ok(medicoService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar médico por ID")
    public ResponseEntity<MedicoResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(medicoService.buscarPorId(id));
    }

    @GetMapping("/especialidad/{idEspecialidad}")
    @Operation(summary = "Listar médicos por especialidad")
    public ResponseEntity<List<MedicoResponseDto>> listarPorEspecialidad(@PathVariable Integer idEspecialidad) {
        return ResponseEntity.ok(medicoService.listarPorEspecialidad(idEspecialidad));
    }

    @PostMapping
    @Operation(summary = "Registrar nuevo médico")
    public ResponseEntity<MedicoResponseDto> crear(@Valid @RequestBody MedicoRequestDto dto) {
        return new ResponseEntity<>(medicoService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar médico existente")
    public ResponseEntity<MedicoResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody MedicoRequestDto dto) {
        return ResponseEntity.ok(medicoService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar médico por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        medicoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

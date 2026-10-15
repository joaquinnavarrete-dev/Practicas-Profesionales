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

import com.practica.backend.dto.EspecialidadRequestDto;
import com.practica.backend.dto.EspecialidadResponseDto;
import com.practica.backend.service.EspecialidadService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/especialidades")
@RequiredArgsConstructor
@Tag(name = "Especialidades", description = "Endpoints para la gestión de especialidades médicas")
public class EspecialidadController {

    private final EspecialidadService especialidadService;

    @GetMapping
    @Operation(summary = "Listar todas las especialidades")
    public ResponseEntity<List<EspecialidadResponseDto>> listarTodas() {
        return ResponseEntity.ok(especialidadService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar especialidad por ID")
    public ResponseEntity<EspecialidadResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(especialidadService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear nueva especialidad")
    public ResponseEntity<EspecialidadResponseDto> crear(@Valid @RequestBody EspecialidadRequestDto dto) {
        return new ResponseEntity<>(especialidadService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar especialidad existente")
    public ResponseEntity<EspecialidadResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody EspecialidadRequestDto dto) {
        return ResponseEntity.ok(especialidadService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar especialidad por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        especialidadService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

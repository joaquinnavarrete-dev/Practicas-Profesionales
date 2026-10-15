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

import com.practica.backend.dto.ObraSocialRequestDto;
import com.practica.backend.dto.ObraSocialResponseDto;
import com.practica.backend.service.ObraSocialService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/obras-sociales")
@RequiredArgsConstructor
@Tag(name = "Obras Sociales", description = "Endpoints para la gestión de obras sociales")
public class ObraSocialController {

    private final ObraSocialService obraSocialService;

    @GetMapping
    @Operation(summary = "Listar todas las obras sociales")
    public ResponseEntity<List<ObraSocialResponseDto>> listarTodas() {
        return ResponseEntity.ok(obraSocialService.listarTodas());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar obra social por ID")
    public ResponseEntity<ObraSocialResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(obraSocialService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear nueva obra social")
    public ResponseEntity<ObraSocialResponseDto> crear(@Valid @RequestBody ObraSocialRequestDto dto) {
        return new ResponseEntity<>(obraSocialService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar obra social existente")
    public ResponseEntity<ObraSocialResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ObraSocialRequestDto dto) {
        return ResponseEntity.ok(obraSocialService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar obra social por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        obraSocialService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

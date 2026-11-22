package com.practica.backend.controller;

import com.practica.backend.dto.SedeRequestDto;
import com.practica.backend.dto.SedeResponseDto;
import com.practica.backend.service.SedeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sedes")
@RequiredArgsConstructor
@Tag(name = "Sedes", description = "Endpoints para la gestion de sedes")
public class SedeController {

    private final SedeService sedeService;

    @GetMapping
    @Operation(summary = "Listar todas las sedes")
    public ResponseEntity<List<SedeResponseDto>> listarSedes() {
        return ResponseEntity.ok(sedeService.listarSedes());
    }

    @GetMapping("/nombre/{nombre}")
    @Operation(summary = "Buscar sede por nombre")
    public ResponseEntity<SedeResponseDto> buscarPorNombre(@PathVariable String nombre) {
        return ResponseEntity.ok(sedeService.buscarPorNombre(nombre));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar sede por ID")
    public ResponseEntity<SedeResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(sedeService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear nueva sede")
    public ResponseEntity<SedeResponseDto> crear(@Valid @RequestBody SedeRequestDto dto) {
        return new ResponseEntity<>(sedeService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar sede existente")
    public ResponseEntity<SedeResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody SedeRequestDto dto) {
        return ResponseEntity.ok(sedeService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de una sede")
    public ResponseEntity<SedeResponseDto> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam Boolean estado) {
        return ResponseEntity.ok(sedeService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar una sede por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        sedeService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

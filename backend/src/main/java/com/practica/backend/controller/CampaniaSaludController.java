package com.practica.backend.controller;

import com.practica.backend.dto.CampaniaSaludRequestDto;
import com.practica.backend.dto.CampaniaSaludResponseDto;
import com.practica.backend.service.CampaniaSaludService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/campanias")
@RequiredArgsConstructor
@Tag(name = "Campañias", description = "Endpoints para la gestion de campañias de salud")
public class CampaniaSaludController {

    private final CampaniaSaludService campaniaSaludService;

    @GetMapping
    @Operation(summary = "Listar todas las campanias")
    public ResponseEntity<List<CampaniaSaludResponseDto>> listarCampanias() {
        return ResponseEntity.ok(campaniaSaludService.listarCampanias());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar campañia por ID")
    public ResponseEntity<CampaniaSaludResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(campaniaSaludService.buscarPorId(id));
    }

    @GetMapping("/nombre/{nombre}")
    @Operation(summary = "Buscar campañia por nombre")
    public ResponseEntity<CampaniaSaludResponseDto> buscarPorNombre(@PathVariable String nombre) {
        return ResponseEntity.ok(campaniaSaludService.buscarPorNombre(nombre));
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar todas las campanias por estado")
    public ResponseEntity<List<CampaniaSaludResponseDto>> listarPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(campaniaSaludService.listarPorEstado(estado));
    }

    @PostMapping
    @Operation(summary = "Crear nueva campañia de salud")
    public ResponseEntity<CampaniaSaludResponseDto> crear(@Valid @RequestBody CampaniaSaludRequestDto dto) {
        return new ResponseEntity<>(campaniaSaludService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar una campañia existente")
    public ResponseEntity<CampaniaSaludResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody CampaniaSaludRequestDto dto) {
        return ResponseEntity.ok(campaniaSaludService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar el estado de una campañia de salud")
    public ResponseEntity<CampaniaSaludResponseDto> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam String estado) {
        return ResponseEntity.ok(campaniaSaludService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Elimina una campañia por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        campaniaSaludService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

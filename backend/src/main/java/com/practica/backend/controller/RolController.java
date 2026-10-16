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

import com.practica.backend.dto.RolRequestDto;
import com.practica.backend.dto.RolResponseDto;
import com.practica.backend.service.RolService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
@Tag(name = "Roles", description = "Endpoints para la gestión de roles de usuario")
public class RolController {

    private final RolService rolService;

    @GetMapping
    @Operation(summary = "Listar todos los roles")
    public ResponseEntity<List<RolResponseDto>> listarTodos() {
        return ResponseEntity.ok(rolService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar rol por ID")
    public ResponseEntity<RolResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(rolService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo rol")
    public ResponseEntity<RolResponseDto> crear(@Valid @RequestBody RolRequestDto dto) {
        return new ResponseEntity<>(rolService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar rol existente")
    public ResponseEntity<RolResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody RolRequestDto dto) {
        return ResponseEntity.ok(rolService.actualizar(id, dto));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar rol por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        rolService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

package com.practica.backend.controller;

import com.practica.backend.dto.ProveedorRequestDto;
import com.practica.backend.dto.ProveedorResponseDto;
import com.practica.backend.service.ProveedorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/proveedores")
@RequiredArgsConstructor
@Tag(name = "Proveedores", description = "Endpoints para la gestion de proveedores")
public class ProveedorController {

    private final ProveedorService  proveedorService;

    @GetMapping
    @Operation(summary = "Listar todos los proveedores")
    public ResponseEntity<List<ProveedorResponseDto>> listarProveedores() {
        return ResponseEntity.ok(proveedorService.listarProveedores());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar proveedor por ID")
    public ResponseEntity<ProveedorResponseDto> buscarProveedorPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(proveedorService.buscarPorId(id));
    }

    @GetMapping("/razon-social/{razon}")
    @Operation(summary = "Buscar proveedor por razon social")
    public ResponseEntity<ProveedorResponseDto> buscarProveedorPorRazonSocial(@PathVariable String razon) {
        return ResponseEntity.ok(proveedorService.buscarPorRazonSocial(razon));
    }

    @GetMapping("/estado/{estado}")
    @Operation(summary = "Listar proveedores por estado")
    public ResponseEntity<List<ProveedorResponseDto>> listarProveedoresPorEstado(@PathVariable String estado) {
        return ResponseEntity.ok(proveedorService.listarProveedoresPorEstado(estado));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo proveedor")
    public ResponseEntity<ProveedorResponseDto> crear(@Valid @RequestBody ProveedorRequestDto dto) {
        return new ResponseEntity<>(proveedorService.crear(dto), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar proveedor existente")
    public ResponseEntity<ProveedorResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody ProveedorRequestDto dto) {
        return ResponseEntity.ok(proveedorService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado de proveedor")
    public ResponseEntity<ProveedorResponseDto> cambiarEstado(
            @PathVariable Integer id,
            @Valid @RequestParam String estado) {
        return ResponseEntity.ok(proveedorService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar proveedor por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        proveedorService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}

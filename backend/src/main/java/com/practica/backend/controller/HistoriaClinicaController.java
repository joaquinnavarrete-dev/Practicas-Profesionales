package com.practica.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.practica.backend.dto.HistoriaClinicaRequestDto;
import com.practica.backend.dto.HistoriaClinicaResponseDto;
import com.practica.backend.service.HistoriaClinicaService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/historias-clinicas")
@RequiredArgsConstructor
@Tag(name = "Historias Clínicas", description = "Endpoints para la gestión del historial y evolución médica de pacientes")
public class HistoriaClinicaController {

    private final HistoriaClinicaService historiaClinicaService;

    @GetMapping("/paciente/{idPaciente}")
    @Operation(summary = "Listar la historia clínica completa de un paciente")
    public ResponseEntity<List<HistoriaClinicaResponseDto>> listarPorPaciente(@PathVariable Integer idPaciente) {
        return ResponseEntity.ok(historiaClinicaService.listarPorPaciente(idPaciente));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Obtener un registro de historia clínica por su ID")
    public ResponseEntity<HistoriaClinicaResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(historiaClinicaService.buscarPorId(id));
    }

    @PostMapping
    @Operation(summary = "Registrar una nueva evolución médica en la historia clínica")
    public ResponseEntity<HistoriaClinicaResponseDto> crear(@Valid @RequestBody HistoriaClinicaRequestDto dto) {
        return new ResponseEntity<>(historiaClinicaService.crear(dto), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar un registro de historia clínica por su ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        historiaClinicaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}


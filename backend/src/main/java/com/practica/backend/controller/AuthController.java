package com.practica.backend.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.practica.backend.dto.AuthRequestDto;
import com.practica.backend.dto.AuthResponseDto;
import com.practica.backend.dto.RegistroPacienteRequestDto;
import com.practica.backend.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticación", description = "Endpoints para inicio de sesión unificado y auto-registro de pacientes")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Inicio de sesión unificado para cualquier rol o paciente")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody AuthRequestDto request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/registro-paciente")
    @Operation(summary = "Auto-registro público de nuevos pacientes")
    public ResponseEntity<AuthResponseDto> registroPaciente(@Valid @RequestBody RegistroPacienteRequestDto request) {
        return new ResponseEntity<>(authService.registroPaciente(request), HttpStatus.CREATED);
    }
}

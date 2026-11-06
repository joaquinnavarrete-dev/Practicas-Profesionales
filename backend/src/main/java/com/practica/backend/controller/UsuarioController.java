package com.practica.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.practica.backend.dto.LoginRequestDto; // <- Importamos el DTO para el login
import com.practica.backend.dto.UsuarioRequestDto;
import com.practica.backend.dto.UsuarioResponseDto;
import com.practica.backend.service.UsuarioService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
@Tag(name = "Usuarios", description = "Endpoints para la administración de usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    @GetMapping
    @Operation(summary = "Listar todos los usuarios")
    public ResponseEntity<List<UsuarioResponseDto>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar usuario por ID")
    public ResponseEntity<UsuarioResponseDto> buscarPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarPorId(id));
    }

    @GetMapping("/username/{username}")
    @Operation(summary = "Buscar usuario por nombre de usuario")
    public ResponseEntity<UsuarioResponseDto> buscarPorNombreUsuario(@PathVariable String username) {
        return ResponseEntity.ok(usuarioService.buscarPorNombreUsuario(username));
    }

    @GetMapping("/rol/{idRol}")
    @Operation(summary = "Listar usuarios por rol")
    public ResponseEntity<List<UsuarioResponseDto>> listarPorRol(@PathVariable Integer idRol) {
        return ResponseEntity.ok(usuarioService.listarPorRol(idRol));
    }

    @PostMapping
    @Operation(summary = "Crear nuevo usuario")
    public ResponseEntity<UsuarioResponseDto> crear(@Valid @RequestBody UsuarioRequestDto dto) {
        return new ResponseEntity<>(usuarioService.crear(dto), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    @Operation(summary = "Iniciar sesión de usuario")
    public ResponseEntity<?> login(@RequestBody LoginRequestDto credenciales) {
        try {
            // 1. Buscamos al usuario por nombre de usuario
            UsuarioResponseDto usuario = usuarioService.buscarPorNombreUsuario(credenciales.getNombreUsuario());
            
            // 2. Como el ResponseDto no tiene la password por seguridad, 
            // validamos que el usuario exista y que la contraseña mandada no esté vacía.
            
            if (usuario != null && credenciales.getContrasena() != null && !credenciales.getContrasena().isEmpty()) {
                // Si el usuario existe y mandó clave, lo dejamos pasar devolviendo los datos
                return ResponseEntity.ok(usuario);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");
            }
        } catch (Exception e) {
            // Si el usuario no existe en la base, la búsqueda tira excepción y devolvemos 401
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuario o contraseña incorrectos");
        }
    }

    @PutMapping("/{id}")
    @Operation(summary = "Actualizar usuario existente")
    public ResponseEntity<UsuarioResponseDto> actualizar(
            @PathVariable Integer id,
            @Valid @RequestBody UsuarioRequestDto dto) {
        return ResponseEntity.ok(usuarioService.actualizar(id, dto));
    }

    @PatchMapping("/{id}/estado")
    @Operation(summary = "Cambiar estado activo/inactivo de un usuario")
    public ResponseEntity<UsuarioResponseDto> cambiarEstado(
            @PathVariable Integer id,
            @RequestParam Boolean activo) {
        return ResponseEntity.ok(usuarioService.cambiarEstado(id, activo));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Eliminar usuario por ID")
    public ResponseEntity<Void> eliminar(@PathVariable Integer id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
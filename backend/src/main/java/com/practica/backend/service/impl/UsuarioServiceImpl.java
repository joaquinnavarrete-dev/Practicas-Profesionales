package com.practica.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.RolResponseDto;
import com.practica.backend.dto.UsuarioRequestDto;
import com.practica.backend.dto.UsuarioResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.Rol;
import com.practica.backend.model.Usuario;
import com.practica.backend.repository.RolRepository;
import com.practica.backend.repository.UsuarioRepository;
import com.practica.backend.service.UsuarioService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDto> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDto buscarPorId(Integer id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));
        return mapToResponseDto(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public UsuarioResponseDto buscarPorNombreUsuario(String nombreUsuario) {
        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + nombreUsuario));
        return mapToResponseDto(usuario);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UsuarioResponseDto> listarPorRol(Integer idRol) {
        if (!rolRepository.existsById(idRol)) {
            throw new ResourceNotFoundException("Rol no encontrado con id: " + idRol);
        }
        return usuarioRepository.findByRolIdRol(idRol).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public UsuarioResponseDto crear(UsuarioRequestDto dto) {
        if (usuarioRepository.existsByNombreUsuario(dto.getNombreUsuario())) {
            throw new ResourceAlreadyExistsException("El nombre de usuario ya se encuentra registrado: " + dto.getNombreUsuario());
        }

        Rol rol = rolRepository.findById(dto.getIdRol())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id: " + dto.getIdRol()));

        Usuario usuario = Usuario.builder()
                .nombreUsuario(dto.getNombreUsuario())
                .contrasena(dto.getContrasena())
                .rol(rol)
                .activo(dto.getActivo() != null ? dto.getActivo() : true)
                .build();

        return mapToResponseDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponseDto actualizar(Integer id, UsuarioRequestDto dto) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        if (!usuario.getNombreUsuario().equalsIgnoreCase(dto.getNombreUsuario())
                && usuarioRepository.existsByNombreUsuario(dto.getNombreUsuario())) {
            throw new ResourceAlreadyExistsException("El nombre de usuario ya se encuentra registrado: " + dto.getNombreUsuario());
        }

        Rol rol = rolRepository.findById(dto.getIdRol())
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id: " + dto.getIdRol()));

        usuario.setNombreUsuario(dto.getNombreUsuario());
        if (dto.getContrasena() != null && !dto.getContrasena().isBlank()) {
            usuario.setContrasena(dto.getContrasena());
        }
        usuario.setRol(rol);
        if (dto.getActivo() != null) {
            usuario.setActivo(dto.getActivo());
        }

        return mapToResponseDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public UsuarioResponseDto cambiarEstado(Integer id, Boolean activo) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con id: " + id));

        usuario.setActivo(activo);
        return mapToResponseDto(usuarioRepository.save(usuario));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!usuarioRepository.existsById(id)) {
            throw new ResourceNotFoundException("Usuario no encontrado con id: " + id);
        }
        usuarioRepository.deleteById(id);
    }

    private UsuarioResponseDto mapToResponseDto(Usuario entity) {
        RolResponseDto rolDto = null;
        if (entity.getRol() != null) {
            rolDto = RolResponseDto.builder()
                    .idRol(entity.getRol().getIdRol())
                    .nombre(entity.getRol().getNombre())
                    .build();
        }

        return UsuarioResponseDto.builder()
                .idUsuario(entity.getIdUsuario())
                .nombreUsuario(entity.getNombreUsuario())
                .activo(entity.getActivo())
                .rol(rolDto)
                .build();
    }
}

package com.practica.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.RolRequestDto;
import com.practica.backend.dto.RolResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.Rol;
import com.practica.backend.repository.RolRepository;
import com.practica.backend.service.RolService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class RolServiceImpl implements RolService {

    private final RolRepository rolRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RolResponseDto> listarTodos() {
        return rolRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public RolResponseDto buscarPorId(Integer id) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id: " + id));
        return mapToResponseDto(rol);
    }

    @Override
    @Transactional
    public RolResponseDto crear(RolRequestDto dto) {
        if (rolRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe un rol con el nombre: " + dto.getNombre());
        }

        Rol rol = Rol.builder()
                .nombre(dto.getNombre().toUpperCase())
                .build();

        return mapToResponseDto(rolRepository.save(rol));
    }

    @Override
    @Transactional
    public RolResponseDto actualizar(Integer id, RolRequestDto dto) {
        Rol rol = rolRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rol no encontrado con id: " + id));

        if (!rol.getNombre().equalsIgnoreCase(dto.getNombre())
                && rolRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe un rol con el nombre: " + dto.getNombre());
        }

        rol.setNombre(dto.getNombre().toUpperCase());
        return mapToResponseDto(rolRepository.save(rol));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!rolRepository.existsById(id)) {
            throw new ResourceNotFoundException("Rol no encontrado con id: " + id);
        }
        rolRepository.deleteById(id);
    }

    private RolResponseDto mapToResponseDto(Rol entity) {
        return RolResponseDto.builder()
                .idRol(entity.getIdRol())
                .nombre(entity.getNombre())
                .build();
    }
}

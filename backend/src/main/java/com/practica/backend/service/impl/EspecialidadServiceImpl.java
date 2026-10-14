package com.practica.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.EspecialidadRequestDto;
import com.practica.backend.dto.EspecialidadResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.Especialidad;
import com.practica.backend.repository.EspecialidadRepository;
import com.practica.backend.service.EspecialidadService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class EspecialidadServiceImpl implements EspecialidadService {

    private final EspecialidadRepository especialidadRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EspecialidadResponseDto> listarTodas() {
        return especialidadRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EspecialidadResponseDto buscarPorId(Integer id) {
        Especialidad especialidad = especialidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada con id: " + id));
        return mapToResponseDto(especialidad);
    }

    @Override
    @Transactional
    public EspecialidadResponseDto crear(EspecialidadRequestDto dto) {
        if (especialidadRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una especialidad con el nombre: " + dto.getNombre());
        }

        Especialidad especialidad = Especialidad.builder()
                .nombre(dto.getNombre())
                .build();

        return mapToResponseDto(especialidadRepository.save(especialidad));
    }

    @Override
    @Transactional
    public EspecialidadResponseDto actualizar(Integer id, EspecialidadRequestDto dto) {
        Especialidad especialidad = especialidadRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada con id: " + id));

        if (!especialidad.getNombre().equalsIgnoreCase(dto.getNombre())
                && especialidadRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una especialidad con el nombre: " + dto.getNombre());
        }

        especialidad.setNombre(dto.getNombre());
        return mapToResponseDto(especialidadRepository.save(especialidad));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!especialidadRepository.existsById(id)) {
            throw new ResourceNotFoundException("Especialidad no encontrada con id: " + id);
        }
        especialidadRepository.deleteById(id);
    }

    private EspecialidadResponseDto mapToResponseDto(Especialidad entity) {
        return EspecialidadResponseDto.builder()
                .idEspecialidad(entity.getIdEspecialidad())
                .nombre(entity.getNombre())
                .build();
    }
}

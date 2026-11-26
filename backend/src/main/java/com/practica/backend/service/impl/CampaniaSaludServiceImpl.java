package com.practica.backend.service.impl;

import com.practica.backend.dto.CampaniaSaludRequestDto;
import com.practica.backend.dto.CampaniaSaludResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.CampaniaSalud;
import com.practica.backend.repository.CampaniaSaludRepository;
import com.practica.backend.service.CampaniaSaludService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CampaniaSaludServiceImpl implements CampaniaSaludService {

    private final CampaniaSaludRepository campaniaSaludRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CampaniaSaludResponseDto> listarCampanias() {
        return campaniaSaludRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CampaniaSaludResponseDto buscarPorId(Integer id) {
        CampaniaSalud campaniaSalud = campaniaSaludRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campañia no encontrada con id: " + id));
        return mapToResponseDto(campaniaSalud);
    }

    @Override
    @Transactional(readOnly = true)
    public CampaniaSaludResponseDto buscarPorNombre(String nombre) {
        CampaniaSalud campaniaSalud = campaniaSaludRepository.findByNombre(nombre)
                .orElseThrow(() -> new ResourceNotFoundException("Campañia no encontrada con nombre: " + nombre));
        return mapToResponseDto(campaniaSalud);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CampaniaSaludResponseDto> listarPorEstado(String estado) {
        return campaniaSaludRepository.findByEstado(estado).stream()
                .map(this::mapToResponseDto)
                .toList();

    }

    @Override
    @Transactional
    public CampaniaSaludResponseDto crear(CampaniaSaludRequestDto dto) {
        if (campaniaSaludRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una campañia con el nombre: " + dto.getNombre());
        }

        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        CampaniaSalud campaniaSalud = CampaniaSalud.builder()
                .nombre(dto.getNombre())
                .descripcion(dto.getDescripcion())
                .fechaInicio(dto.getFechaInicio())
                .fechaFin(dto.getFechaFin())
                .publicoObjetivo(dto.getPublicoObjetivo())
                .cupoMaximo(dto.getCupoMaximo())
                .estado(dto.getEstado())
                .build();

        return mapToResponseDto(campaniaSaludRepository.save(campaniaSalud));
    }

    @Override
    @Transactional
    public CampaniaSaludResponseDto actualizar(Integer id, CampaniaSaludRequestDto dto) {
        CampaniaSalud campaniaSalud = campaniaSaludRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campañia no encontrada con id: " + id));

        if (!campaniaSalud.getNombre().equalsIgnoreCase(dto.getNombre())
        && campaniaSaludRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una campañia con el nombre: " + dto.getNombre());
        }

        if (dto.getFechaFin().isBefore(dto.getFechaInicio())) {
            throw new IllegalArgumentException("La fecha de fin no puede ser anterior a la fecha de inicio");
        }

        campaniaSalud.setNombre(dto.getNombre());
        campaniaSalud.setDescripcion(dto.getDescripcion());
        campaniaSalud.setFechaInicio(dto.getFechaInicio());
        campaniaSalud.setFechaFin(dto.getFechaFin());
        campaniaSalud.setPublicoObjetivo(dto.getPublicoObjetivo());
        campaniaSalud.setCupoMaximo(dto.getCupoMaximo());
        campaniaSalud.setEstado(dto.getEstado());
        return mapToResponseDto(campaniaSaludRepository.save(campaniaSalud));
    }

    @Override
    @Transactional
    public CampaniaSaludResponseDto cambiarEstado(Integer id, String estado) {
        CampaniaSalud campaniaSalud = campaniaSaludRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Campañia no encontrada con id: " + id));

        campaniaSalud.setEstado(estado);
        return mapToResponseDto(campaniaSaludRepository.save(campaniaSalud));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!campaniaSaludRepository.existsById(id)) {
            throw new ResourceNotFoundException("Campañia no encontrada con id: " + id);
        }
        campaniaSaludRepository.deleteById(id);
    }

    private CampaniaSaludResponseDto mapToResponseDto(CampaniaSalud entity) {
        return CampaniaSaludResponseDto.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .descripcion(entity.getDescripcion())
                .fechaInicio(entity.getFechaInicio())
                .fechaFin(entity.getFechaFin())
                .publicoObjetivo(entity.getPublicoObjetivo())
                .cupoMaximo(entity.getCupoMaximo())
                .estado(entity.getEstado())
                .build();
    }
}

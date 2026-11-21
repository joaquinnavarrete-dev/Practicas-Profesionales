package com.practica.backend.service.impl;

import com.practica.backend.dto.SedeRequestDto;
import com.practica.backend.dto.SedeResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.Sede;
import com.practica.backend.repository.SedeRepository;
import com.practica.backend.service.SedeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SedeServiceImpl implements SedeService {

    private final SedeRepository sedeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SedeResponseDto> listarSedes() {
        return sedeRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SedeResponseDto buscarPorId(Integer id) {
        Sede sede = sedeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada con id: " + id));
        return mapToResponse(sede);
    }

    @Override
    @Transactional(readOnly = true)
    public SedeResponseDto buscarPorNombre(String nombre) {
        Sede sede = sedeRepository.findByNombre(nombre)
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada: " + nombre));
        return mapToResponse(sede);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SedeResponseDto> listarSedesPorEstado(Boolean estado) {
        return sedeRepository.findByActiva(estado).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public SedeResponseDto crear(SedeRequestDto dto) {
        if (!sedeRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una sede con el nombre: " + dto.getNombre());
        }

        Sede sede = Sede.builder()
                .nombre(dto.getNombre())
                .direccion(dto.getDireccion())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .horario_atencion(dto.getHorario_atencion())
                .activa(dto.getActiva())
                .build();

        return mapToResponse(sedeRepository.save(sede));
    }

    @Override
    @Transactional
    public SedeResponseDto actualizar(Integer id, SedeRequestDto dto) {
        Sede sede = sedeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada con id: " + id));

        if (!sede.getNombre().equalsIgnoreCase(dto.getNombre())
        && sedeRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una sede con el nombre: " + dto.getNombre());
        }

        sede.setNombre(dto.getNombre());
        sede.setDireccion(dto.getDireccion());
        sede.setTelefono(dto.getTelefono());
        sede.setEmail(dto.getEmail());
        sede.setHorario_atencion(dto.getHorario_atencion());
        sede.setActiva(dto.getActiva());

        return mapToResponse(sedeRepository.save(sede));
    }

    @Override
    @Transactional
    public SedeResponseDto cambiarEstado(Integer id, Boolean estado) {
        Sede sede = sedeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sede no encontrada con id: " + id));

        sede.setActiva(estado);
        return mapToResponse(sedeRepository.save(sede));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!sedeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sede no encontrada con id: " + id);
        }
        sedeRepository.deleteById(id);
    }

    private SedeResponseDto mapToResponse(Sede entity) {
        return SedeResponseDto.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .direccion(entity.getDireccion())
                .telefono(entity.getTelefono())
                .email(entity.getEmail())
                .horario_atencion(entity.getHorario_atencion())
                .activa(entity.getActiva())
                .build();
    }
}

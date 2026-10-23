package com.practica.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.ObraSocialResponseDto;
import com.practica.backend.dto.PacienteRequestDto;
import com.practica.backend.dto.PacienteResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.ObraSocial;
import com.practica.backend.model.Paciente;
import com.practica.backend.repository.ObraSocialRepository;
import com.practica.backend.repository.PacienteRepository;
import com.practica.backend.service.PacienteService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PacienteServiceImpl implements PacienteService {

    private final PacienteRepository pacienteRepository;
    private final ObraSocialRepository obraSocialRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PacienteResponseDto> listarTodos() {
        return pacienteRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public PacienteResponseDto buscarPorId(Integer id) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con id: " + id));
        return mapToResponseDto(paciente);
    }

    @Override
    @Transactional(readOnly = true)
    public PacienteResponseDto buscarPorDni(String dni) {
        Paciente paciente = pacienteRepository.findByDni(dni)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con DNI: " + dni));
        return mapToResponseDto(paciente);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PacienteResponseDto> listarPorObraSocial(Integer idObraSocial) {
        if (!obraSocialRepository.existsById(idObraSocial)) {
            throw new ResourceNotFoundException("Obra social no encontrada con id: " + idObraSocial);
        }
        return pacienteRepository.findByObraSocialIdObraSocial(idObraSocial).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public PacienteResponseDto crear(PacienteRequestDto dto) {
        if (pacienteRepository.existsByDni(dto.getDni())) {
            throw new ResourceAlreadyExistsException("Ya existe un paciente con el DNI: " + dto.getDni());
        }

        ObraSocial obraSocial = obraSocialRepository.findById(dto.getIdObraSocial())
                .orElseThrow(() -> new ResourceNotFoundException("Obra social no encontrada con id: " + dto.getIdObraSocial()));

        Paciente paciente = Paciente.builder()
                .dni(dto.getDni())
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .telefono(dto.getTelefono())
                .obraSocial(obraSocial)
                .build();

        return mapToResponseDto(pacienteRepository.save(paciente));
    }

    @Override
    @Transactional
    public PacienteResponseDto actualizar(Integer id, PacienteRequestDto dto) {
        Paciente paciente = pacienteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con id: " + id));

        if (!paciente.getDni().equalsIgnoreCase(dto.getDni())
                && pacienteRepository.existsByDni(dto.getDni())) {
            throw new ResourceAlreadyExistsException("Ya existe un paciente con el DNI: " + dto.getDni());
        }

        ObraSocial obraSocial = obraSocialRepository.findById(dto.getIdObraSocial())
                .orElseThrow(() -> new ResourceNotFoundException("Obra social no encontrada con id: " + dto.getIdObraSocial()));

        paciente.setDni(dto.getDni());
        paciente.setNombre(dto.getNombre());
        paciente.setApellido(dto.getApellido());
        paciente.setTelefono(dto.getTelefono());
        paciente.setObraSocial(obraSocial);

        return mapToResponseDto(pacienteRepository.save(paciente));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!pacienteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Paciente no encontrado con id: " + id);
        }
        pacienteRepository.deleteById(id);
    }

    private PacienteResponseDto mapToResponseDto(Paciente entity) {
        ObraSocialResponseDto obraSocialDto = null;
        if (entity.getObraSocial() != null) {
            obraSocialDto = ObraSocialResponseDto.builder()
                    .idObraSocial(entity.getObraSocial().getIdObraSocial())
                    .nombre(entity.getObraSocial().getNombre())
                    .sigla(entity.getObraSocial().getSigla())
                    .build();
        }

        Integer idUsuario = entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null;
        String nombreUsuario = entity.getUsuario() != null ? entity.getUsuario().getNombreUsuario() : null;

        return PacienteResponseDto.builder()
                .idPaciente(entity.getIdPaciente())
                .dni(entity.getDni())
                .nombre(entity.getNombre())
                .apellido(entity.getApellido())
                .telefono(entity.getTelefono())
                .obraSocial(obraSocialDto)
                .idUsuario(idUsuario)
                .nombreUsuario(nombreUsuario)
                .build();
    }
}

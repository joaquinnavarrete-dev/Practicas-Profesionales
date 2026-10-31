package com.practica.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.DiaAtencionRequestDto;
import com.practica.backend.dto.DiaAtencionResponseDto;
import com.practica.backend.exception.BadRequestException;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.DiaAtencion;
import com.practica.backend.model.Medico;
import com.practica.backend.repository.DiaAtencionRepository;
import com.practica.backend.repository.MedicoRepository;
import com.practica.backend.service.DiaAtencionService;
import com.practica.backend.util.DiaSemanaUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiaAtencionServiceImpl implements DiaAtencionService {

    private final DiaAtencionRepository diaAtencionRepository;
    private final MedicoRepository medicoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<DiaAtencionResponseDto> listarTodos() {
        return diaAtencionRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DiaAtencionResponseDto> listarPorMedico(Integer idMedico) {
        if (!medicoRepository.existsById(idMedico)) {
            throw new ResourceNotFoundException("Médico no encontrado con id: " + idMedico);
        }
        return diaAtencionRepository.findByMedicoIdMedico(idMedico).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public DiaAtencionResponseDto buscarPorId(Integer id) {
        DiaAtencion diaAtencion = diaAtencionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Día de atención no encontrado con id: " + id));
        return mapToResponseDto(diaAtencion);
    }

    @Override
    @Transactional
    public DiaAtencionResponseDto crear(DiaAtencionRequestDto dto) {
        if (!dto.getHoraInicio().isBefore(dto.getHoraFin())) {
            throw new BadRequestException("La hora de inicio debe ser anterior a la hora de fin");
        }

        Medico medico = medicoRepository.findById(dto.getIdMedico())
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con id: " + dto.getIdMedico()));

        String diaNormalizado = DiaSemanaUtil.normalizar(dto.getDiaSemana());

        List<DiaAtencion> existentes = diaAtencionRepository.findByMedicoIdMedicoAndDiaSemana(
                dto.getIdMedico(), diaNormalizado);

        if (!existentes.isEmpty()) {
            throw new ResourceAlreadyExistsException(
                    "El médico ya tiene registrado un horario para el día " + DiaSemanaUtil.obtenerNombre(diaNormalizado));
        }

        DiaAtencion diaAtencion = DiaAtencion.builder()
                .medico(medico)
                .diaSemana(diaNormalizado)
                .horaInicio(dto.getHoraInicio())
                .horaFin(dto.getHoraFin())
                .build();

        return mapToResponseDto(diaAtencionRepository.save(diaAtencion));
    }

    @Override
    @Transactional
    public DiaAtencionResponseDto actualizar(Integer id, DiaAtencionRequestDto dto) {
        DiaAtencion diaAtencion = diaAtencionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Día de atención no encontrado con id: " + id));

        if (!dto.getHoraInicio().isBefore(dto.getHoraFin())) {
            throw new BadRequestException("La hora de inicio debe ser anterior a la hora de fin");
        }

        Medico medico = medicoRepository.findById(dto.getIdMedico())
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con id: " + dto.getIdMedico()));

        String diaNormalizado = DiaSemanaUtil.normalizar(dto.getDiaSemana());

        List<DiaAtencion> existentes = diaAtencionRepository.findByMedicoIdMedicoAndDiaSemana(
                dto.getIdMedico(), diaNormalizado);

        boolean yaExisteOtro = existentes.stream().anyMatch(d -> !d.getIdDiaAtencion().equals(id));
        if (yaExisteOtro) {
            throw new ResourceAlreadyExistsException(
                    "El médico ya tiene registrado otro horario para el día " + DiaSemanaUtil.obtenerNombre(diaNormalizado));
        }

        diaAtencion.setMedico(medico);
        diaAtencion.setDiaSemana(diaNormalizado);
        diaAtencion.setHoraInicio(dto.getHoraInicio());
        diaAtencion.setHoraFin(dto.getHoraFin());

        return mapToResponseDto(diaAtencionRepository.save(diaAtencion));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!diaAtencionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Día de atención no encontrado con id: " + id);
        }
        diaAtencionRepository.deleteById(id);
    }

    private DiaAtencionResponseDto mapToResponseDto(DiaAtencion entity) {
        String nombreCompleto = entity.getMedico() != null
                ? entity.getMedico().getNombre() + " " + entity.getMedico().getApellido()
                : null;
        Integer idMedico = entity.getMedico() != null ? entity.getMedico().getIdMedico() : null;

        return DiaAtencionResponseDto.builder()
                .idDiaAtencion(entity.getIdDiaAtencion())
                .idMedico(idMedico)
                .nombreMedico(nombreCompleto)
                .diaSemana(entity.getDiaSemana())
                .nombreDia(DiaSemanaUtil.obtenerNombre(entity.getDiaSemana()))
                .horaInicio(entity.getHoraInicio())
                .horaFin(entity.getHoraFin())
                .build();
    }
}

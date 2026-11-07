package com.practica.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.EspecialidadResponseDto;
import com.practica.backend.dto.HistoriaClinicaRequestDto;
import com.practica.backend.dto.HistoriaClinicaResponseDto;
import com.practica.backend.dto.MedicoResponseDto;
import com.practica.backend.dto.ObraSocialResponseDto;
import com.practica.backend.dto.PacienteResponseDto;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.HistoriaClinica;
import com.practica.backend.model.Medico;
import com.practica.backend.model.Paciente;
import com.practica.backend.model.Turno;
import com.practica.backend.repository.HistoriaClinicaRepository;
import com.practica.backend.repository.MedicoRepository;
import com.practica.backend.repository.PacienteRepository;
import com.practica.backend.repository.TurnoRepository;
import com.practica.backend.service.HistoriaClinicaService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class HistoriaClinicaServiceImpl implements HistoriaClinicaService {

    private final HistoriaClinicaRepository historiaClinicaRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final TurnoRepository turnoRepository;

    @Override
    @Transactional(readOnly = true)
    public List<HistoriaClinicaResponseDto> listarPorPaciente(Integer idPaciente) {
        if (!pacienteRepository.existsById(idPaciente)) {
            throw new ResourceNotFoundException("Paciente no encontrado con id: " + idPaciente);
        }
        return historiaClinicaRepository.findByPacienteIdPacienteOrderByFechaDescIdHistoriaClinicaDesc(idPaciente)
                .stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public HistoriaClinicaResponseDto buscarPorId(Integer id) {
        HistoriaClinica entity = historiaClinicaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de historia clínica no encontrado con id: " + id));
        return mapToResponseDto(entity);
    }

    @Override
    @Transactional
    public HistoriaClinicaResponseDto crear(HistoriaClinicaRequestDto dto) {
        Paciente paciente = pacienteRepository.findById(dto.getIdPaciente())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con id: " + dto.getIdPaciente()));

        Medico medico = medicoRepository.findById(dto.getIdMedico())
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con id: " + dto.getIdMedico()));

        Turno turno = null;
        if (dto.getIdTurno() != null) {
            turno = turnoRepository.findById(dto.getIdTurno())
                    .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + dto.getIdTurno()));
        }

        HistoriaClinica entity = HistoriaClinica.builder()
                .paciente(paciente)
                .medico(medico)
                .turno(turno)
                .fecha(dto.getFecha())
                .motivoConsulta(dto.getMotivoConsulta())
                .diagnostico(dto.getDiagnostico())
                .tratamiento(dto.getTratamiento())
                .observaciones(dto.getObservaciones())
                .build();

        return mapToResponseDto(historiaClinicaRepository.save(entity));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!historiaClinicaRepository.existsById(id)) {
            throw new ResourceNotFoundException("Registro de historia clínica no encontrado con id: " + id);
        }
        historiaClinicaRepository.deleteById(id);
    }

    private HistoriaClinicaResponseDto mapToResponseDto(HistoriaClinica entity) {
        PacienteResponseDto pacienteDto = null;
        if (entity.getPaciente() != null) {
            ObraSocialResponseDto osDto = null;
            if (entity.getPaciente().getObraSocial() != null) {
                osDto = ObraSocialResponseDto.builder()
                        .idObraSocial(entity.getPaciente().getObraSocial().getIdObraSocial())
                        .nombre(entity.getPaciente().getObraSocial().getNombre())
                        .sigla(entity.getPaciente().getObraSocial().getSigla())
                        .build();
            }

            Integer idUsuarioPac = entity.getPaciente().getUsuario() != null ? entity.getPaciente().getUsuario().getIdUsuario() : null;
            String nombreUsuarioPac = entity.getPaciente().getUsuario() != null ? entity.getPaciente().getUsuario().getNombreUsuario() : null;

            pacienteDto = PacienteResponseDto.builder()
                    .idPaciente(entity.getPaciente().getIdPaciente())
                    .dni(entity.getPaciente().getDni())
                    .nombre(entity.getPaciente().getNombre())
                    .apellido(entity.getPaciente().getApellido())
                    .telefono(entity.getPaciente().getTelefono())
                    .obraSocial(osDto)
                    .idUsuario(idUsuarioPac)
                    .nombreUsuario(nombreUsuarioPac)
                    .build();
        }

        MedicoResponseDto medicoDto = null;
        if (entity.getMedico() != null) {
            EspecialidadResponseDto espDto = null;
            if (entity.getMedico().getEspecialidad() != null) {
                espDto = EspecialidadResponseDto.builder()
                        .idEspecialidad(entity.getMedico().getEspecialidad().getIdEspecialidad())
                        .nombre(entity.getMedico().getEspecialidad().getNombre())
                        .build();
            }

            Integer idUsuarioMed = entity.getMedico().getUsuario() != null ? entity.getMedico().getUsuario().getIdUsuario() : null;
            String nombreUsuarioMed = entity.getMedico().getUsuario() != null ? entity.getMedico().getUsuario().getNombreUsuario() : null;

            medicoDto = MedicoResponseDto.builder()
                    .idMedico(entity.getMedico().getIdMedico())
                    .nombre(entity.getMedico().getNombre())
                    .apellido(entity.getMedico().getApellido())
                    .matricula(entity.getMedico().getMatricula())
                    .telefono(entity.getMedico().getTelefono())
                    .especialidad(espDto)
                    .idUsuario(idUsuarioMed)
                    .nombreUsuario(nombreUsuarioMed)
                    .build();
        }

        Integer idTurno = entity.getTurno() != null ? entity.getTurno().getIdTurno() : null;

        return HistoriaClinicaResponseDto.builder()
                .idHistoriaClinica(entity.getIdHistoriaClinica())
                .idPaciente(entity.getPaciente() != null ? entity.getPaciente().getIdPaciente() : null)
                .paciente(pacienteDto)
                .idMedico(entity.getMedico() != null ? entity.getMedico().getIdMedico() : null)
                .medico(medicoDto)
                .idTurno(idTurno)
                .fecha(entity.getFecha())
                .motivoConsulta(entity.getMotivoConsulta())
                .diagnostico(entity.getDiagnostico())
                .tratamiento(entity.getTratamiento())
                .observaciones(entity.getObservaciones())
                .build();
    }
}


package com.practica.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.EspecialidadResponseDto;
import com.practica.backend.dto.MedicoRequestDto;
import com.practica.backend.dto.MedicoResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.Especialidad;
import com.practica.backend.model.Medico;
import com.practica.backend.repository.EspecialidadRepository;
import com.practica.backend.repository.MedicoRepository;
import com.practica.backend.service.MedicoService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicoServiceImpl implements MedicoService {

    private final MedicoRepository medicoRepository;
    private final EspecialidadRepository especialidadRepository;
    private final com.practica.backend.repository.UsuarioRepository usuarioRepository;

    @Override
    @Transactional(readOnly = true)
    public List<MedicoResponseDto> listarTodos() {
        return medicoRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MedicoResponseDto buscarPorId(Integer id) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con id: " + id));
        return mapToResponseDto(medico);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MedicoResponseDto> listarPorEspecialidad(Integer idEspecialidad) {
        if (!especialidadRepository.existsById(idEspecialidad)) {
            throw new ResourceNotFoundException("Especialidad no encontrada con id: " + idEspecialidad);
        }
        return medicoRepository.findByEspecialidadIdEspecialidad(idEspecialidad).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public MedicoResponseDto crear(MedicoRequestDto dto) {
        if (medicoRepository.existsByMatricula(dto.getMatricula())) {
            throw new ResourceAlreadyExistsException("Ya existe un médico con la matrícula: " + dto.getMatricula());
        }

        Especialidad especialidad = especialidadRepository.findById(dto.getIdEspecialidad())
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada con id: " + dto.getIdEspecialidad()));

        com.practica.backend.model.Usuario usuario = null;
        if (dto.getIdUsuario() != null) {
            usuario = usuarioRepository.findById(dto.getIdUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));

            if (medicoRepository.findByUsuarioIdUsuario(dto.getIdUsuario()).isPresent()) {
                throw new ResourceAlreadyExistsException("El usuario ya se encuentra vinculado a otro médico");
            }
        }

        Medico medico = Medico.builder()
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .matricula(dto.getMatricula())
                .especialidad(especialidad)
                .usuario(usuario)
                .build();

        return mapToResponseDto(medicoRepository.save(medico));
    }

    @Override
    @Transactional
    public MedicoResponseDto actualizar(Integer id, MedicoRequestDto dto) {
        Medico medico = medicoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con id: " + id));

        if (!medico.getMatricula().equalsIgnoreCase(dto.getMatricula())
                && medicoRepository.existsByMatricula(dto.getMatricula())) {
            throw new ResourceAlreadyExistsException("Ya existe un médico con la matrícula: " + dto.getMatricula());
        }

        Especialidad especialidad = especialidadRepository.findById(dto.getIdEspecialidad())
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada con id: " + dto.getIdEspecialidad()));

        if (dto.getIdUsuario() != null) {
            com.practica.backend.model.Usuario usuario = usuarioRepository.findById(dto.getIdUsuario())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + dto.getIdUsuario()));

            medicoRepository.findByUsuarioIdUsuario(dto.getIdUsuario())
                    .filter(otro -> !otro.getIdMedico().equals(id))
                    .ifPresent(otro -> {
                        throw new ResourceAlreadyExistsException("El usuario ya se encuentra vinculado a otro médico");
                    });

            medico.setUsuario(usuario);
        } else {
            medico.setUsuario(null);
        }

        medico.setNombre(dto.getNombre());
        medico.setApellido(dto.getApellido());
        medico.setMatricula(dto.getMatricula());
        medico.setEspecialidad(especialidad);

        return mapToResponseDto(medicoRepository.save(medico));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!medicoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Médico no encontrado con id: " + id);
        }
        medicoRepository.deleteById(id);
    }

    private MedicoResponseDto mapToResponseDto(Medico entity) {
        EspecialidadResponseDto especialidadDto = null;
        if (entity.getEspecialidad() != null) {
            especialidadDto = EspecialidadResponseDto.builder()
                    .idEspecialidad(entity.getEspecialidad().getIdEspecialidad())
                    .nombre(entity.getEspecialidad().getNombre())
                    .build();
        }

        Integer idUsuario = entity.getUsuario() != null ? entity.getUsuario().getIdUsuario() : null;
        String nombreUsuario = entity.getUsuario() != null ? entity.getUsuario().getNombreUsuario() : null;

        return MedicoResponseDto.builder()
                .idMedico(entity.getIdMedico())
                .nombre(entity.getNombre())
                .apellido(entity.getApellido())
                .matricula(entity.getMatricula())
                .especialidad(especialidadDto)
                .idUsuario(idUsuario)
                .nombreUsuario(nombreUsuario)
                .build();
    }
}

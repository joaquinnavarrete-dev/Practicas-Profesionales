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
import com.practica.backend.model.Rol; // Importá la entidad Rol si la usas
import com.practica.backend.model.Usuario;
import com.practica.backend.repository.ObraSocialRepository;
import com.practica.backend.repository.PacienteRepository;
import com.practica.backend.repository.RolRepository; // Necesitarás el repo de roles para buscar el rol paciente
import com.practica.backend.repository.UsuarioRepository;
import com.practica.backend.service.PacienteService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PacienteServiceImpl implements PacienteService {

    private final PacienteRepository pacienteRepository;
    private final ObraSocialRepository obraSocialRepository;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository; // <-- Para buscar el rol correspondiente en la BD

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
        // 1. Validamos que no exista un paciente con el mismo DNI
        if (pacienteRepository.existsByDni(dto.getDni())) {
            throw new ResourceAlreadyExistsException("Ya existe un paciente con el DNI: " + dto.getDni());
        }

        // 2. Buscamos y validamos la obra social seleccionada
        ObraSocial obraSocial = obraSocialRepository.findById(dto.getIdObraSocial())
                .orElseThrow(() -> new ResourceNotFoundException("Obra social no encontrada con id: " + dto.getIdObraSocial()));

        // 3. Buscamos el Rol de Paciente en la base de datos (asumiendo que tiene ID 2 o lo buscas por nombre)
        // Ajustá esto según cómo manejes los roles en tu sistema (ej: ID 2 para PACIENTE)
        Rol rolPaciente = rolRepository.findById(2)
                .orElseThrow(() -> new ResourceNotFoundException("Rol de paciente no encontrado"));

        // 4. Creamos el Usuario usando las propiedades reales: nombreUsuario y contrasena
        Usuario nuevoUsuario = Usuario.builder()
                .nombreUsuario(dto.getEmail()) // Usamos el email del DTO como nombre de usuario
                .contrasena(dto.getPassword())  // Guardamos la contraseña (si usas encoder, lo aplicas acá)
                .activo(true)
                .rol(rolPaciente)
                .build();

        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // 5. Creamos el Paciente vinculando el ID del usuario recién creado
        Paciente paciente = Paciente.builder()
                .dni(dto.getDni())
                .nombre(dto.getNombre())
                .apellido(dto.getApellido())
                .telefono(dto.getTelefono())
                .obraSocial(obraSocial)
                .usuario(usuarioGuardado) // Se asocia perfecto y no queda en NULL
                .build();

        Paciente pacienteGuardado = pacienteRepository.save(paciente);

        return mapToResponseDto(pacienteGuardado);
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

        return PacienteResponseDto.builder()
                .idPaciente(entity.getIdPaciente())
                .dni(entity.getDni())
                .nombre(entity.getNombre())
                .apellido(entity.getApellido())
                .telefono(entity.getTelefono())
                .obraSocial(obraSocialDto)
                .build();
    }
}
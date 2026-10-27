package com.practica.backend.service.impl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.EspecialidadResponseDto;
import com.practica.backend.dto.MedicoResponseDto;
import com.practica.backend.dto.ObraSocialResponseDto;
import com.practica.backend.dto.PacienteResponseDto;
import com.practica.backend.dto.TurnoDisponibleResponseDto;
import com.practica.backend.dto.TurnoRequestDto;
import com.practica.backend.dto.TurnoResponseDto;
import com.practica.backend.dto.ReprogramarTurnoRequestDto;
import com.practica.backend.dto.SolicitarTurnoRequestDto;
import com.practica.backend.exception.BadRequestException;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.DiaAtencion;
import com.practica.backend.model.Especialidad;
import com.practica.backend.model.Medico;
import com.practica.backend.model.Paciente;
import com.practica.backend.model.Turno;
import com.practica.backend.repository.DiaAtencionRepository;
import com.practica.backend.repository.EspecialidadRepository;
import com.practica.backend.repository.MedicoRepository;
import com.practica.backend.repository.PacienteRepository;
import com.practica.backend.repository.TurnoRepository;
import com.practica.backend.service.TurnoService;
import com.practica.backend.util.DiaSemanaUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TurnoServiceImpl implements TurnoService {

    private final TurnoRepository turnoRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final EspecialidadRepository especialidadRepository;
    private final DiaAtencionRepository diaAtencionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponseDto> listarTodos() {
        return turnoRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public TurnoResponseDto buscarPorId(Integer id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + id));
        return mapToResponseDto(turno);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponseDto> listarPorMedicoYFecha(Integer idMedico, LocalDate fecha) {
        if (!medicoRepository.existsById(idMedico)) {
            throw new ResourceNotFoundException("Médico no encontrado con id: " + idMedico);
        }
        return turnoRepository.findByMedicoIdMedicoAndFecha(idMedico, fecha).stream()
                .sorted(Comparator.comparing(Turno::getHora))
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponseDto> listarPorPaciente(Integer idPaciente) {
        if (!pacienteRepository.existsById(idPaciente)) {
            throw new ResourceNotFoundException("Paciente no encontrado con id: " + idPaciente);
        }
        return turnoRepository.findByPacienteIdPaciente(idPaciente).stream()
                .sorted(Comparator.comparing(Turno::getFecha).thenComparing(Turno::getHora))
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponseDto> listarPorFecha(LocalDate fecha) {
        return turnoRepository.findByFecha(fecha).stream()
                .sorted(Comparator.comparing(Turno::getHora))
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoDisponibleResponseDto> consultarTurnosDisponibles(Integer idMedico, LocalDate fecha) {
        Medico medico = medicoRepository.findById(idMedico)
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con id: " + idMedico));

        String diaSemanaNumero = DiaSemanaUtil.obtenerNumeroIso(fecha.getDayOfWeek());
        List<DiaAtencion> franjas = diaAtencionRepository.findByMedicoIdMedicoAndDiaSemana(idMedico, diaSemanaNumero);
        if (franjas.isEmpty()) {
            return List.of();
        }

        List<Turno> turnosOcupados = turnoRepository.findByMedicoIdMedicoAndFecha(idMedico, fecha);
        Set<LocalTime> horasOcupadas = turnosOcupados.stream()
                .map(Turno::getHora)
                .collect(Collectors.toSet());

        List<TurnoDisponibleResponseDto> disponibles = new ArrayList<>();
        String nombreCompleto = medico.getNombre() + " " + medico.getApellido();
        String nombreDia = DiaSemanaUtil.obtenerNombreEspanol(fecha.getDayOfWeek());

        for (DiaAtencion franja : franjas) {
            LocalTime slot = franja.getHoraInicio();
            while (slot.plusMinutes(30).compareTo(franja.getHoraFin()) <= 0) {
                if (!horasOcupadas.contains(slot)) {
                    if (!fecha.isEqual(LocalDate.now()) || slot.isAfter(LocalTime.now())) {
                        disponibles.add(TurnoDisponibleResponseDto.builder()
                                .idMedico(medico.getIdMedico())
                                .nombreMedico(nombreCompleto)
                                .fecha(fecha)
                                .hora(slot)
                                .diaSemana(nombreDia)
                                .build());
                    }
                }
                slot = slot.plusMinutes(30);
            }
        }

        disponibles.sort(Comparator.comparing(TurnoDisponibleResponseDto::getHora));
        return disponibles;
    }

    @Override
    @Transactional
    public TurnoResponseDto reservarTurno(TurnoRequestDto dto) {
        if (dto.getFecha().isBefore(LocalDate.now())) {
            throw new BadRequestException("No se pueden agendar turnos en fechas pasadas");
        }
        if (dto.getFecha().isEqual(LocalDate.now()) && dto.getHora().isBefore(LocalTime.now())) {
            throw new BadRequestException("No se pueden agendar turnos en horarios pasados");
        }

        Paciente paciente = pacienteRepository.findById(dto.getIdPaciente())
                .orElseThrow(() -> new ResourceNotFoundException("Paciente no encontrado con id: " + dto.getIdPaciente()));

        Medico medico = medicoRepository.findById(dto.getIdMedico())
                .orElseThrow(() -> new ResourceNotFoundException("Médico no encontrado con id: " + dto.getIdMedico()));

        Especialidad especialidad = especialidadRepository.findById(dto.getIdEspecialidad())
                .orElseThrow(() -> new ResourceNotFoundException("Especialidad no encontrada con id: " + dto.getIdEspecialidad()));

        String diaSemanaNumero = DiaSemanaUtil.obtenerNumeroIso(dto.getFecha().getDayOfWeek());
        List<DiaAtencion> franjas = diaAtencionRepository.findByMedicoIdMedicoAndDiaSemana(dto.getIdMedico(), diaSemanaNumero);
        if (franjas.isEmpty()) {
            throw new BadRequestException("El médico no atiende los días " + DiaSemanaUtil.obtenerNombreEspanol(dto.getFecha().getDayOfWeek()).toLowerCase());
        }

        boolean dentroDeHorario = franjas.stream().anyMatch(f ->
                !dto.getHora().isBefore(f.getHoraInicio()) && dto.getHora().plusMinutes(30).compareTo(f.getHoraFin()) <= 0);

        if (!dentroDeHorario) {
            throw new BadRequestException("La hora seleccionada está fuera de la franja de atención del médico");
        }

        if (turnoRepository.existsByMedicoIdMedicoAndFechaAndHora(dto.getIdMedico(), dto.getFecha(), dto.getHora())) {
            throw new ResourceAlreadyExistsException("El turno solicitado para el " + dto.getFecha() + " a las " + dto.getHora() + " ya se encuentra ocupado");
        }

        Turno turno = Turno.builder()
                .paciente(paciente)
                .medico(medico)
                .especialidad(especialidad)
                .fecha(dto.getFecha())
                .hora(dto.getHora())
                .build();

        return mapToResponseDto(turnoRepository.save(turno));
    }

    @Override
    @Transactional
    public TurnoResponseDto reprogramarTurno(Integer id, LocalDate nuevaFecha, LocalTime nuevaHora) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + id));

        if (nuevaFecha.isBefore(LocalDate.now())) {
            throw new BadRequestException("La nueva fecha no puede ser en el pasado");
        }
        if (nuevaFecha.isEqual(LocalDate.now()) && nuevaHora.isBefore(LocalTime.now())) {
            throw new BadRequestException("El nuevo horario no puede ser en el pasado");
        }

        String diaSemanaNumero = DiaSemanaUtil.obtenerNumeroIso(nuevaFecha.getDayOfWeek());
        List<DiaAtencion> franjas = diaAtencionRepository.findByMedicoIdMedicoAndDiaSemana(turno.getMedico().getIdMedico(), diaSemanaNumero);
        if (franjas.isEmpty()) {
            throw new BadRequestException("El médico no atiende los días " + DiaSemanaUtil.obtenerNombreEspanol(nuevaFecha.getDayOfWeek()).toLowerCase());
        }

        boolean dentroDeHorario = franjas.stream().anyMatch(f ->
                !nuevaHora.isBefore(f.getHoraInicio()) && nuevaHora.plusMinutes(30).compareTo(f.getHoraFin()) <= 0);

        if (!dentroDeHorario) {
            throw new BadRequestException("La nueva hora seleccionada está fuera de la franja de atención del médico");
        }

        if (turnoRepository.existsByMedicoIdMedicoAndFechaAndHora(turno.getMedico().getIdMedico(), nuevaFecha, nuevaHora)) {
            throw new ResourceAlreadyExistsException("El nuevo horario ya se encuentra ocupado para este médico");
        }

        turno.setFecha(nuevaFecha);
        turno.setHora(nuevaHora);
        return mapToResponseDto(turnoRepository.save(turno));
    }

    @Override
    @Transactional
    public TurnoResponseDto reprogramarTurno(Integer id, ReprogramarTurnoRequestDto dto) {
        return reprogramarTurno(id, dto.getNuevaFecha(), dto.getNuevaHora());
    }

    @Override
    @Transactional
    public void cancelarTurno(Integer id) {
        if (!turnoRepository.existsById(id)) {
            throw new ResourceNotFoundException("Turno no encontrado con id: " + id);
        }
        turnoRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponseDto> listarMisTurnos(String nombreUsuario) {
        Paciente paciente = pacienteRepository.findByUsuarioNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró un perfil de paciente para el usuario: " + nombreUsuario));
        return listarPorPaciente(paciente.getIdPaciente());
    }

    @Override
    @Transactional
    public TurnoResponseDto solicitarTurno(String nombreUsuario, SolicitarTurnoRequestDto dto) {
        Paciente paciente = pacienteRepository.findByUsuarioNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró un perfil de paciente para el usuario: " + nombreUsuario));

        TurnoRequestDto turnoRequestDto = TurnoRequestDto.builder()
                .idPaciente(paciente.getIdPaciente())
                .idMedico(dto.getIdMedico())
                .idEspecialidad(dto.getIdEspecialidad())
                .fecha(dto.getFecha())
                .hora(dto.getHora())
                .build();

        return reservarTurno(turnoRequestDto);
    }

    @Override
    @Transactional
    public void cancelarMiTurno(String nombreUsuario, Integer idTurno) {
        Paciente paciente = pacienteRepository.findByUsuarioNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró un perfil de paciente para el usuario: " + nombreUsuario));

        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + idTurno));

        if (!turno.getPaciente().getIdPaciente().equals(paciente.getIdPaciente())) {
            throw new BadRequestException("No tiene permisos para cancelar este turno porque pertenece a otro paciente");
        }

        turnoRepository.delete(turno);
    }

    private TurnoResponseDto mapToResponseDto(Turno entity) {
        PacienteResponseDto pacienteDto = null;
        if (entity.getPaciente() != null) {
            ObraSocialResponseDto obraSocialDto = null;
            if (entity.getPaciente().getObraSocial() != null) {
                obraSocialDto = ObraSocialResponseDto.builder()
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
                    .obraSocial(obraSocialDto)
                    .idUsuario(idUsuarioPac)
                    .nombreUsuario(nombreUsuarioPac)
                    .build();
        }

        MedicoResponseDto medicoDto = null;
        if (entity.getMedico() != null) {
            EspecialidadResponseDto espMedDto = null;
            if (entity.getMedico().getEspecialidad() != null) {
                espMedDto = EspecialidadResponseDto.builder()
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
                    .especialidad(espMedDto)
                    .idUsuario(idUsuarioMed)
                    .nombreUsuario(nombreUsuarioMed)
                    .build();
        }

        EspecialidadResponseDto especialidadDto = null;
        if (entity.getEspecialidad() != null) {
            especialidadDto = EspecialidadResponseDto.builder()
                    .idEspecialidad(entity.getEspecialidad().getIdEspecialidad())
                    .nombre(entity.getEspecialidad().getNombre())
                    .build();
        }

        return TurnoResponseDto.builder()
                .idTurno(entity.getIdTurno())
                .paciente(pacienteDto)
                .medico(medicoDto)
                .especialidad(especialidadDto)
                .fecha(entity.getFecha())
                .hora(entity.getHora())
                .build();
    }
}

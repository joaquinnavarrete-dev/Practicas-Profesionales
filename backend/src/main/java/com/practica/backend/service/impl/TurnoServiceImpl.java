package com.practica.backend.service.impl;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
    @Transactional
    public List<TurnoResponseDto> listarTodos() {
        List<Turno> turnos = turnoRepository.findAll();
        actualizarEstadosVencidos(turnos);
        return turnos.stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public TurnoResponseDto buscarPorId(Integer id) {
        Turno turno = turnoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + id));
        actualizarEstadosVencidos(List.of(turno));
        return mapToResponseDto(turno);
    }

    @Override
    @Transactional
    public List<TurnoResponseDto> listarPorMedicoYFecha(Integer idMedico, LocalDate fecha) {
        if (!medicoRepository.existsById(idMedico)) {
            throw new ResourceNotFoundException("Médico no encontrado con id: " + idMedico);
        }
        List<Turno> turnos = turnoRepository.findByMedicoIdMedicoAndFecha(idMedico, fecha);
        actualizarEstadosVencidos(turnos);
        return turnos.stream()
                .sorted(Comparator.comparing(Turno::getHora))
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public List<TurnoResponseDto> listarPorPaciente(Integer idPaciente) {
        if (!pacienteRepository.existsById(idPaciente)) {
            throw new ResourceNotFoundException("Paciente no encontrado con id: " + idPaciente);
        }
        List<Turno> turnos = turnoRepository.findByPacienteIdPaciente(idPaciente);
        actualizarEstadosVencidos(turnos);
        return turnos.stream()
                .sorted(Comparator.comparing(Turno::getFecha).thenComparing(Turno::getHora))
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public List<TurnoResponseDto> listarPorFecha(LocalDate fecha) {
        List<Turno> turnos = turnoRepository.findByFecha(fecha);
        actualizarEstadosVencidos(turnos);
        return turnos.stream()
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
                boolean estaOcupado = horasOcupadas.contains(slot);
                boolean esPasado = fecha.isBefore(LocalDate.now())
                        || (fecha.isEqual(LocalDate.now()) && !slot.isAfter(LocalTime.now()));
                boolean disponible = !estaOcupado && !esPasado;

                disponibles.add(TurnoDisponibleResponseDto.builder()
                        .idMedico(medico.getIdMedico())
                        .nombreMedico(nombreCompleto)
                        .fecha(fecha)
                        .hora(slot)
                        .diaSemana(nombreDia)
                        .disponible(disponible)
                        .build());

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

        if (turnoRepository.existsByPacienteIdPacienteAndFechaAndHora(dto.getIdPaciente(), dto.getFecha(), dto.getHora())) {
            throw new BadRequestException("El paciente ya tiene un turno agendado para el " + dto.getFecha() + " a las " + dto.getHora() + " hs");
        }

        List<Turno> turnosPacienteMismoDia = turnoRepository.findByPacienteIdPacienteAndFecha(dto.getIdPaciente(), dto.getFecha());
        for (Turno tExistente : turnosPacienteMismoDia) {
            if (!"Cancelado".equalsIgnoreCase(tExistente.getEstado())) {
                long minutosDiferencia = Math.abs(java.time.Duration.between(tExistente.getHora(), dto.getHora()).toMinutes());
                if (minutosDiferencia < 30) {
                    String medicoNombre = tExistente.getMedico() != null ? tExistente.getMedico().getNombre() + " " + tExistente.getMedico().getApellido() : "otro profesional";
                    throw new BadRequestException("El paciente ya tiene un turno agendado a las " + tExistente.getHora()
                            + " hs con el/la Dr(a). " + medicoNombre
                            + ". Debe existir un intervalo mínimo de 30 minutos entre turnos.");
                }
            }
        }

        Turno turno = Turno.builder()
                .paciente(paciente)
                .medico(medico)
                .especialidad(especialidad)
                .fecha(dto.getFecha())
                .hora(dto.getHora())
                .estado(dto.getEstado() != null && !dto.getEstado().isBlank() ? dto.getEstado() : "Pendiente")
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

        if (turnoRepository.existsByMedicoIdMedicoAndFechaAndHoraAndIdTurnoNot(turno.getMedico().getIdMedico(), nuevaFecha, nuevaHora, id)) {
            throw new ResourceAlreadyExistsException("El nuevo horario ya se encuentra ocupado para este médico");
        }

        if (turnoRepository.existsByPacienteIdPacienteAndFechaAndHoraAndIdTurnoNot(turno.getPaciente().getIdPaciente(), nuevaFecha, nuevaHora, id)) {
            throw new BadRequestException("El paciente ya tiene otro turno asignado para el " + nuevaFecha + " a las " + nuevaHora + " hs");
        }

        List<Turno> turnosPacienteMismoDia = turnoRepository.findByPacienteIdPacienteAndFechaAndIdTurnoNot(turno.getPaciente().getIdPaciente(), nuevaFecha, id);
        for (Turno tExistente : turnosPacienteMismoDia) {
            if (!"Cancelado".equalsIgnoreCase(tExistente.getEstado())) {
                long minutosDiferencia = Math.abs(java.time.Duration.between(tExistente.getHora(), nuevaHora).toMinutes());
                if (minutosDiferencia < 30) {
                    String medicoNombre = tExistente.getMedico() != null ? tExistente.getMedico().getNombre() + " " + tExistente.getMedico().getApellido() : "otro profesional";
                    throw new BadRequestException("El paciente ya tiene un turno agendado a las " + tExistente.getHora()
                            + " hs con el/la Dr(a). " + medicoNombre
                            + ". Debe existir un intervalo mínimo de 30 minutos entre turnos.");
                }
            }
        }

        turno.setFecha(nuevaFecha);
        turno.setHora(nuevaHora);
        if ("Pendiente de Reubicación".equalsIgnoreCase(turno.getEstado())) {
            turno.setEstado("Confirmado");
        }
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
                .estado("Pendiente")
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

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponseDto> listarPendientesReubicacion() {
        return turnoRepository.findByEstado("Pendiente de Reubicación").stream()
                .sorted(Comparator.comparing(Turno::getFecha).thenComparing(Turno::getHora))
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public long contarPendientesReubicacion() {
        return turnoRepository.countByEstado("Pendiente de Reubicación");
    }

    @Override
    @Transactional
    public TurnoResponseDto cambiarEstado(Integer idTurno, String nuevoEstado) {
        if (nuevoEstado == null || nuevoEstado.isBlank()) {
            throw new BadRequestException("El nuevo estado no puede estar vacío");
        }

        Turno turno = turnoRepository.findById(idTurno)
                .orElseThrow(() -> new ResourceNotFoundException("Turno no encontrado con id: " + idTurno));

        Set<String> estadosValidos = Set.of(
                "Pendiente", "Confirmado", "En Espera", "Atendido", "Ausente", "Cancelado", "Pendiente de Reubicación"
        );

        boolean esValido = estadosValidos.stream().anyMatch(e -> e.equalsIgnoreCase(nuevoEstado.trim()));
        if (!esValido) {
            throw new BadRequestException("Estado de turno no válido: " + nuevoEstado);
        }

        String estadoNormalizado = estadosValidos.stream()
                .filter(e -> e.equalsIgnoreCase(nuevoEstado.trim()))
                .findFirst()
                .orElse(nuevoEstado.trim());

        turno.setEstado(estadoNormalizado);
        return mapToResponseDto(turnoRepository.save(turno));
    }

    private void actualizarEstadosVencidos(List<Turno> turnos) {
        if (turnos == null || turnos.isEmpty()) {
            return;
        }
        LocalDateTime ahora = LocalDateTime.now();
        List<Turno> modificados = new ArrayList<>();
        for (Turno t : turnos) {
            if (t.getFecha() != null && t.getHora() != null) {
                LocalDateTime fechaHora = LocalDateTime.of(t.getFecha(), t.getHora());
                if (fechaHora.isBefore(ahora)) {
                    String st = t.getEstado();
                    if (st == null || st.isBlank()
                            || "Pendiente".equalsIgnoreCase(st)
                            || "Confirmado".equalsIgnoreCase(st)
                            || "En Espera".equalsIgnoreCase(st)) {
                        t.setEstado("Ausente");
                        modificados.add(t);
                    }
                }
            }
        }
        if (!modificados.isEmpty()) {
            turnoRepository.saveAll(modificados);
        }
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
                    .telefono(entity.getMedico().getTelefono())
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
                .estado(entity.getEstado() != null ? entity.getEstado() : "Confirmado")
                .build();
    }
}

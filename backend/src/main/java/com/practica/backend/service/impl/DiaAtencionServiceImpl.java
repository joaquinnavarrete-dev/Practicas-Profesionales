package com.practica.backend.service.impl;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.DiaAtencionRequestDto;
import com.practica.backend.dto.DiaAtencionResponseDto;
import com.practica.backend.dto.EspecialidadResponseDto;
import com.practica.backend.dto.MedicoResponseDto;
import com.practica.backend.dto.ObraSocialResponseDto;
import com.practica.backend.dto.PacienteResponseDto;
import com.practica.backend.dto.TurnoResponseDto;
import com.practica.backend.exception.BadRequestException;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.DiaAtencion;
import com.practica.backend.model.Medico;
import com.practica.backend.model.Turno;
import com.practica.backend.repository.DiaAtencionRepository;
import com.practica.backend.repository.MedicoRepository;
import com.practica.backend.repository.TurnoRepository;
import com.practica.backend.service.DiaAtencionService;
import com.practica.backend.util.DiaSemanaUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DiaAtencionServiceImpl implements DiaAtencionService {

    private final DiaAtencionRepository diaAtencionRepository;
    private final MedicoRepository medicoRepository;
    private final TurnoRepository turnoRepository;

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
        return actualizar(id, dto, false);
    }

    @Override
    @Transactional
    public DiaAtencionResponseDto actualizar(Integer id, DiaAtencionRequestDto dto, boolean forzar) {
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

        List<Turno> turnosAfectados = obtenerTurnosAfectadosEntidades(diaAtencion, diaNormalizado, dto.getHoraInicio(), dto.getHoraFin());

        if (!turnosAfectados.isEmpty() && !forzar) {
            throw new BadRequestException("Existen " + turnosAfectados.size() + " turno(s) agendado(s) afectados por la modificación del horario. Confirme la operación para reubicarlos.");
        }

        if (!turnosAfectados.isEmpty() && forzar) {
            for (Turno t : turnosAfectados) {
                t.setEstado("Pendiente de Reubicación");
                turnoRepository.save(t);
            }
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
        eliminar(id, false);
    }

    @Override
    @Transactional
    public void eliminar(Integer id, boolean forzar) {
        DiaAtencion diaAtencion = diaAtencionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Día de atención no encontrado con id: " + id));

        List<Turno> turnosAfectados = obtenerTurnosAfectadosPorEliminacionEntidades(diaAtencion);

        if (!turnosAfectados.isEmpty() && !forzar) {
            throw new BadRequestException("Existen " + turnosAfectados.size() + " turno(s) agendado(s) afectados por la eliminación del día de atención. Confirme la operación para reubicarlos.");
        }

        if (!turnosAfectados.isEmpty() && forzar) {
            for (Turno t : turnosAfectados) {
                t.setEstado("Pendiente de Reubicación");
                turnoRepository.save(t);
            }
        }

        diaAtencionRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponseDto> obtenerTurnosAfectados(Integer idDiaAtencion, String nuevoDiaSemana, LocalTime nuevaHoraInicio, LocalTime nuevaHoraFin) {
        DiaAtencion diaAtencion = diaAtencionRepository.findById(idDiaAtencion)
                .orElseThrow(() -> new ResourceNotFoundException("Día de atención no encontrado con id: " + idDiaAtencion));

        String diaNorm = nuevoDiaSemana != null ? DiaSemanaUtil.normalizar(nuevoDiaSemana) : diaAtencion.getDiaSemana();
        LocalTime horaIni = nuevaHoraInicio != null ? nuevaHoraInicio : diaAtencion.getHoraInicio();
        LocalTime horaFin = nuevaHoraFin != null ? nuevaHoraFin : diaAtencion.getHoraFin();

        return obtenerTurnosAfectadosEntidades(diaAtencion, diaNorm, horaIni, horaFin).stream()
                .map(this::mapTurnoToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<TurnoResponseDto> obtenerTurnosAfectadosPorEliminacion(Integer idDiaAtencion) {
        DiaAtencion diaAtencion = diaAtencionRepository.findById(idDiaAtencion)
                .orElseThrow(() -> new ResourceNotFoundException("Día de atención no encontrado con id: " + idDiaAtencion));

        return obtenerTurnosAfectadosPorEliminacionEntidades(diaAtencion).stream()
                .map(this::mapTurnoToResponseDto)
                .toList();
    }

    private List<Turno> obtenerTurnosAfectadosEntidades(DiaAtencion diaAtencion, String nuevoDiaSemana, LocalTime nuevaHoraInicio, LocalTime nuevaHoraFin) {
        Integer idMedico = diaAtencion.getMedico().getIdMedico();
        List<Turno> turnosFuturos = turnoRepository.findByMedicoIdMedicoAndFechaGreaterThanEqual(idMedico, LocalDate.now());

        // Filtrar turnos del día de semana original del diaAtencion que no estén cancelados
        List<Turno> turnosDiaOriginal = turnosFuturos.stream()
                .filter(t -> !"Cancelado".equalsIgnoreCase(t.getEstado()))
                .filter(t -> diaAtencion.getDiaSemana().equals(DiaSemanaUtil.obtenerNumeroIso(t.getFecha().getDayOfWeek())))
                .toList();

        // Si se cambia el día de la semana, todos los turnos del día original quedan afectados
        if (!diaAtencion.getDiaSemana().equals(nuevoDiaSemana)) {
            return turnosDiaOriginal;
        }

        // Si se mantiene el día pero cambian las horas, quedan afectados los que quedan fuera del nuevo rango
        return turnosDiaOriginal.stream()
                .filter(t -> t.getHora().isBefore(nuevaHoraInicio) || t.getHora().plusMinutes(30).isAfter(nuevaHoraFin))
                .sorted(Comparator.comparing(Turno::getFecha).thenComparing(Turno::getHora))
                .toList();
    }

    private List<Turno> obtenerTurnosAfectadosPorEliminacionEntidades(DiaAtencion diaAtencion) {
        Integer idMedico = diaAtencion.getMedico().getIdMedico();
        List<Turno> turnosFuturos = turnoRepository.findByMedicoIdMedicoAndFechaGreaterThanEqual(idMedico, LocalDate.now());

        return turnosFuturos.stream()
                .filter(t -> !"Cancelado".equalsIgnoreCase(t.getEstado()))
                .filter(t -> diaAtencion.getDiaSemana().equals(DiaSemanaUtil.obtenerNumeroIso(t.getFecha().getDayOfWeek())))
                .sorted(Comparator.comparing(Turno::getFecha).thenComparing(Turno::getHora))
                .toList();
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

    private TurnoResponseDto mapTurnoToResponseDto(Turno entity) {
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
            pacienteDto = PacienteResponseDto.builder()
                    .idPaciente(entity.getPaciente().getIdPaciente())
                    .dni(entity.getPaciente().getDni())
                    .nombre(entity.getPaciente().getNombre())
                    .apellido(entity.getPaciente().getApellido())
                    .telefono(entity.getPaciente().getTelefono())
                    .obraSocial(obraSocialDto)
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
            medicoDto = MedicoResponseDto.builder()
                    .idMedico(entity.getMedico().getIdMedico())
                    .nombre(entity.getMedico().getNombre())
                    .apellido(entity.getMedico().getApellido())
                    .matricula(entity.getMedico().getMatricula())
                    .telefono(entity.getMedico().getTelefono())
                    .especialidad(espMedDto)
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

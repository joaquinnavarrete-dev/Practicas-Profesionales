package com.practica.backend.repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.practica.backend.model.Turno;

@Repository
public interface TurnoRepository extends JpaRepository<Turno, Integer> {

    List<Turno> findByMedicoIdMedicoAndFecha(Integer idMedico, LocalDate fecha);

    List<Turno> findByPacienteIdPaciente(Integer idPaciente);

    List<Turno> findByFecha(LocalDate fecha);

    boolean existsByMedicoIdMedicoAndFechaAndHora(Integer idMedico, LocalDate fecha, LocalTime hora);

    boolean existsByMedicoIdMedicoAndFechaAndHoraAndIdTurnoNot(Integer idMedico, LocalDate fecha, LocalTime hora, Integer idTurno);

    boolean existsByPacienteIdPacienteAndFechaAndHora(Integer idPaciente, LocalDate fecha, LocalTime hora);

    boolean existsByPacienteIdPacienteAndFechaAndHoraAndIdTurnoNot(Integer idPaciente, LocalDate fecha, LocalTime hora, Integer idTurno);

    List<Turno> findByPacienteIdPacienteAndFecha(Integer idPaciente, LocalDate fecha);

    List<Turno> findByPacienteIdPacienteAndFechaAndIdTurnoNot(Integer idPaciente, LocalDate fecha, Integer idTurno);

    List<Turno> findByMedicoIdMedicoAndFechaGreaterThanEqual(Integer idMedico, LocalDate fecha);

    List<Turno> findByEstado(String estado);

    long countByEstado(String estado);
}

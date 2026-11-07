package com.practica.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.practica.backend.model.HistoriaClinica;

@Repository
public interface HistoriaClinicaRepository extends JpaRepository<HistoriaClinica, Integer> {

    List<HistoriaClinica> findByPacienteIdPacienteOrderByFechaDescIdHistoriaClinicaDesc(Integer idPaciente);

    List<HistoriaClinica> findByMedicoIdMedicoOrderByFechaDesc(Integer idMedico);
}


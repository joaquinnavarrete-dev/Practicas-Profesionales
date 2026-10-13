package com.practica.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.practica.backend.model.DiaAtencion;

@Repository
public interface DiaAtencionRepository extends JpaRepository<DiaAtencion, Integer> {

    List<DiaAtencion> findByMedicoIdMedico(Integer idMedico);

    List<DiaAtencion> findByMedicoIdMedicoAndDiaSemana(Integer idMedico, String diaSemana);
}

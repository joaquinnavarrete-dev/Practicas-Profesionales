package com.practica.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.practica.backend.model.Paciente;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {

    Optional<Paciente> findByDni(String dni);

    boolean existsByDni(String dni);

    List<Paciente> findByObraSocialIdObraSocial(Integer idObraSocial);
}

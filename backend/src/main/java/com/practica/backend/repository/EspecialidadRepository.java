package com.practica.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.practica.backend.model.Especialidad;

@Repository
public interface EspecialidadRepository extends JpaRepository<Especialidad, Integer> {

    Optional<Especialidad> findByNombre(String nombre);

    boolean existsByNombre(String nombre);
}

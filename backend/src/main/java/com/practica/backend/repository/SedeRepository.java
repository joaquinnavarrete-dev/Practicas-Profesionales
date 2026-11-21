package com.practica.backend.repository;

import com.practica.backend.model.Sede;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SedeRepository extends JpaRepository<Sede, Integer> {

    Optional<Sede> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    Optional<Sede> findByActiva(Boolean estado);
}

package com.practica.backend.repository;

import com.practica.backend.model.CampaniaSalud;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CampaniaSaludRepository extends JpaRepository<CampaniaSalud, Integer> {

    Optional<CampaniaSalud> findByNombre(String nombre);

    boolean existsByNombre(String nombre);

    List<CampaniaSalud> findByEstado(String estado);
}

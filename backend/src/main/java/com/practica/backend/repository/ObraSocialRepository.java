package com.practica.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.practica.backend.model.ObraSocial;

@Repository
public interface ObraSocialRepository extends JpaRepository<ObraSocial, Integer> {

    Optional<ObraSocial> findByNombre(String nombre);

    boolean existsByNombre(String nombre);
}

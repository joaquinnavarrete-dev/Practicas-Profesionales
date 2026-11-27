package com.practica.backend.repository;

import com.practica.backend.model.Empresa;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmpresaRepository extends JpaRepository<Empresa, Integer> {

    Optional<Empresa> findByNombre(String nombre);

    boolean existsByNombre(String nombre);
}

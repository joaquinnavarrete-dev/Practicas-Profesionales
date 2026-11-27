package com.practica.backend.repository;

import com.practica.backend.model.Proveedor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProveedorRepository extends JpaRepository<Proveedor, Integer> {

    Optional<Proveedor> findByRazonSocial(String razon);

    boolean existsByRazonSocial(String razon);

    List<Proveedor> findByEstado(String estado);
}

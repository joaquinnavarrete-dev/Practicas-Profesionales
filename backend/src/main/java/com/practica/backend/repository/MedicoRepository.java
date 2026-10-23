package com.practica.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.practica.backend.model.Medico;

@Repository
public interface MedicoRepository extends JpaRepository<Medico, Integer> {

    Optional<Medico> findByMatricula(String matricula);

    boolean existsByMatricula(String matricula);

    List<Medico> findByEspecialidadIdEspecialidad(Integer idEspecialidad);

    Optional<Medico> findByUsuarioIdUsuario(Integer idUsuario);

    Optional<Medico> findByUsuarioNombreUsuario(String nombreUsuario);
}

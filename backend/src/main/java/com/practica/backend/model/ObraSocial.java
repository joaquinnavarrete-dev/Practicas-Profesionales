package com.practica.backend.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "obra_social")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ObraSocial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_obra_social")
    private Integer idObraSocial;

    @Column(name = "nombre", nullable = false, length = 100)
    private String nombre;

    @Column(name = "sigla", length = 20)
    private String sigla;
}

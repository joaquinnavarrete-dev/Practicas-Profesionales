package com.practica.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "campania_salud")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CampaniaSalud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nombre", nullable = false, unique = true, length = 150)
    private String nombre;

    @Column(name = "descripcion", nullable = false, length = 255)
    private String descripcion;

    @Column(name = "fecha_inicio", nullable = false)
    private LocalDate fechaInicio;

    @Column(name = "fecha_fin", nullable = false)
    private LocalDate fechaFin;

    @Column(name = "publico_objetivo", nullable = false, length = 50)
    private String publicoObjetivo;

    @Column(name = "cupo_maximo", nullable = false)
    private Integer cupoMaximo;

    @Column(name = "estado", nullable = false, length = 20)
    @Builder.Default
    private String estado = "Planificada";
}

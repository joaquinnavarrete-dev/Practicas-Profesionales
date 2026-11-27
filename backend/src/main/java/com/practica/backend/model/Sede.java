package com.practica.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "sede")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sede {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nombre",  nullable = false,  unique = true,  length = 150)
    private String nombre;

    @Column(name = "direccion",  nullable = false,  length = 255)
    private String direccion;

    @Column(name = "telefono",   nullable = false,  length = 20)
    private String telefono;

    @Column(name = "email",   nullable = false,  length = 255)
    private String email;

    @Column(name = "horario_atencion",   nullable = false,  length = 100)
    private String horario_atencion;

    @Column(name = "activa")
    @Builder.Default
    private Boolean activa = true;

}

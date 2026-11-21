package com.practica.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "empresa")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nombre",  nullable = false, length = 150)
    private String nombre;

    @Column(name = "cuit", nullable = false, length = 15)
    private String cuit;

    @Column(name = "domicilio", nullable = false, length = 255)
    private String domicilio;

    @Column(name = "telefono",  nullable = false, length = 15)
    private String telefono;

    @Column(name = "email",  nullable = false, length = 255)
    private String email;

    @Column(name = "rubro",   nullable = false, length = 50)
    private String rubro;

}

package com.practica.backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "proveedor")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Proveedor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "razon_social",  nullable = false, length = 150)
    private String razonSocial;

    @Column(name = "cuit", nullable = false, length = 20)
    private String cuit;

    @Column(name = "rubro",  nullable = false, length = 50)
    private String rubro;

    @Column(name = "telefono",   nullable = false, length = 20)
    private String telefono;

    @Column(name = "email", nullable = false, length = 255)
    private String email;

    @Column(name = "estado",  nullable = false, length = 20)
    @Builder.Default
    private String estado = "Activo";

}

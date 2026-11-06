package com.practica.backend.dto;

public class LoginRequestDto {
    private String nombreUsuario;
    private String contrasena;

    // Getters y Setters
    public String getNombreUsuario() { return nombreUsuario; }
    public void setNombreUsuario(String nombreUsuario) { this.nombreUsuario = nombreUsuario; }
    public String getContrasena() { return contrasena; }
    public void setContrasena(String contrasena) { this.contrasena = contrasena; }
}
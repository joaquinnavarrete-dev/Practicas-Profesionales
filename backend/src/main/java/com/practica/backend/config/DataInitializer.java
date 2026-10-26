package com.practica.backend.config;

import java.util.List;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.practica.backend.model.Rol;
import com.practica.backend.model.Usuario;
import com.practica.backend.repository.RolRepository;
import com.practica.backend.repository.UsuarioRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        List<String> roles = List.of("ADMINISTRADOR", "MEDICO", "RECEPCIONISTA", "PACIENTE");
        for (String rolNombre : roles) {
            if (!rolRepository.existsByNombre(rolNombre)) {
                rolRepository.save(Rol.builder().nombre(rolNombre).build());
                log.info("Rol inicial asegurado en base de datos: {}", rolNombre);
            }
        }

        if (usuarioRepository.findByNombreUsuario("admin").isEmpty()) {
            Rol rolAdmin = rolRepository.findByNombre("ADMINISTRADOR").orElseThrow();
            Usuario admin = Usuario.builder()
                    .nombreUsuario("admin")
                    .contrasena(passwordEncoder.encode("admin123"))
                    .activo(true)
                    .rol(rolAdmin)
                    .build();
            usuarioRepository.save(admin);
            log.info("Usuario administrador inicial creado: admin / admin123");
        }
    }
}

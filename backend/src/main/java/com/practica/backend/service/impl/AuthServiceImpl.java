package com.practica.backend.service.impl;

import java.util.HashMap;
import java.util.Map;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.AuthRequestDto;
import com.practica.backend.dto.AuthResponseDto;
import com.practica.backend.dto.RegistroPacienteRequestDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.Medico;
import com.practica.backend.model.ObraSocial;
import com.practica.backend.model.Paciente;
import com.practica.backend.model.Rol;
import com.practica.backend.model.Usuario;
import com.practica.backend.repository.MedicoRepository;
import com.practica.backend.repository.ObraSocialRepository;
import com.practica.backend.repository.PacienteRepository;
import com.practica.backend.repository.RolRepository;
import com.practica.backend.repository.UsuarioRepository;
import com.practica.backend.security.JwtService;
import com.practica.backend.security.UserDetailsImpl;
import com.practica.backend.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PacienteRepository pacienteRepository;
    private final MedicoRepository medicoRepository;
    private final ObraSocialRepository obraSocialRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public AuthResponseDto login(AuthRequestDto dto) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(dto.getNombreUsuario(), dto.getContrasena())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        Usuario usuario = usuarioRepository.findById(userDetails.getIdUsuario())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + userDetails.getIdUsuario()));

        String rolNombre = usuario.getRol() != null ? usuario.getRol().getNombre() : "USER";

        Integer idPaciente = pacienteRepository.findByUsuarioIdUsuario(usuario.getIdUsuario())
                .map(Paciente::getIdPaciente)
                .orElse(null);

        Integer idMedico = medicoRepository.findByUsuarioIdUsuario(usuario.getIdUsuario())
                .map(Medico::getIdMedico)
                .orElse(null);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("idUsuario", usuario.getIdUsuario());
        extraClaims.put("rol", "ROLE_" + rolNombre.toUpperCase());
        if (idPaciente != null) {
            extraClaims.put("idPaciente", idPaciente);
        }
        if (idMedico != null) {
            extraClaims.put("idMedico", idMedico);
        }

        String token = jwtService.generateToken(extraClaims, userDetails);

        return AuthResponseDto.builder()
                .token(token)
                .tipo("Bearer")
                .idUsuario(usuario.getIdUsuario())
                .nombreUsuario(usuario.getNombreUsuario())
                .rol(rolNombre)
                .idPaciente(idPaciente)
                .idMedico(idMedico)
                .build();
    }

    @Override
    @Transactional
    public AuthResponseDto registroPaciente(RegistroPacienteRequestDto dto) {
        if (usuarioRepository.existsByNombreUsuario(dto.getNombreUsuario())) {
            throw new ResourceAlreadyExistsException("El nombre de usuario '" + dto.getNombreUsuario() + "' ya se encuentra registrado");
        }

        if (pacienteRepository.existsByDni(dto.getDni())) {
            throw new ResourceAlreadyExistsException("Ya existe un paciente registrado con el DNI: " + dto.getDni());
        }

        ObraSocial obraSocial = obraSocialRepository.findById(dto.getIdObraSocial())
                .orElseThrow(() -> new ResourceNotFoundException("Obra social no encontrada con ID: " + dto.getIdObraSocial()));

        Rol rolPaciente = rolRepository.findByNombre("PACIENTE")
                .orElseThrow(() -> new ResourceNotFoundException("Rol 'PACIENTE' no encontrado en el sistema"));

        Usuario usuario = Usuario.builder()
                .nombreUsuario(dto.getNombreUsuario().trim())
                .contrasena(passwordEncoder.encode(dto.getContrasena()))
                .activo(true)
                .rol(rolPaciente)
                .build();
        usuario = usuarioRepository.save(usuario);

        Paciente paciente = Paciente.builder()
                .dni(dto.getDni().trim())
                .nombre(dto.getNombre().trim())
                .apellido(dto.getApellido().trim())
                .telefono(dto.getTelefono().trim())
                .obraSocial(obraSocial)
                .usuario(usuario)
                .build();
        paciente = pacienteRepository.save(paciente);

        UserDetailsImpl userDetails = UserDetailsImpl.build(usuario);

        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("idUsuario", usuario.getIdUsuario());
        extraClaims.put("rol", "ROLE_PACIENTE");
        extraClaims.put("idPaciente", paciente.getIdPaciente());

        String token = jwtService.generateToken(extraClaims, userDetails);

        return AuthResponseDto.builder()
                .token(token)
                .tipo("Bearer")
                .idUsuario(usuario.getIdUsuario())
                .nombreUsuario(usuario.getNombreUsuario())
                .rol("PACIENTE")
                .idPaciente(paciente.getIdPaciente())
                .idMedico(null)
                .build();
    }
}

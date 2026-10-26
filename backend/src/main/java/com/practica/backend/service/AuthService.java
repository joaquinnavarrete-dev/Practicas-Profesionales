package com.practica.backend.service;

import com.practica.backend.dto.AuthRequestDto;
import com.practica.backend.dto.AuthResponseDto;
import com.practica.backend.dto.RegistroPacienteRequestDto;

public interface AuthService {

    AuthResponseDto login(AuthRequestDto dto);

    AuthResponseDto registroPaciente(RegistroPacienteRequestDto dto);
}

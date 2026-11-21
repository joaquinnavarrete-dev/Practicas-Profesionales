package com.practica.backend.service.impl;

import com.practica.backend.dto.EmpresaRequestDto;
import com.practica.backend.dto.EmpresaResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.Empresa;
import com.practica.backend.repository.EmpresaRepository;
import com.practica.backend.service.EmpresaService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EmpresaServiceImpl implements EmpresaService {

    private final EmpresaRepository empresaRepository;

    @Override
    @Transactional(readOnly = true)
    public List<EmpresaResponseDto> listarEmpresas() {
        return empresaRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EmpresaResponseDto buscarPorId(Integer idEmpresa) {
        Empresa empresa = empresaRepository.findById(idEmpresa)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id: " + idEmpresa));
        return mapToResponseDto(empresa);
    }

    @Override
    @Transactional
    public EmpresaResponseDto crear(EmpresaRequestDto dto) {
        if (empresaRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una empresa con el nombre: " + dto.getNombre());
        }

        Empresa empresa = Empresa.builder()
                .nombre(dto.getNombre())
                .cuit(dto.getCuit())
                .domicilio(dto.getDomicilio())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .rubro(dto.getRubro())
                .build();

        return mapToResponseDto(empresaRepository.save(empresa));
    }

    @Override
    @Transactional
    public EmpresaResponseDto actualizar(Integer idEmpresa, EmpresaRequestDto dto) {
        Empresa empresa = empresaRepository.findById(idEmpresa)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada con id: " + idEmpresa));

        if (!empresa.getNombre().equalsIgnoreCase(dto.getNombre())
                && empresaRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una empresa con el nombre: " + dto.getNombre());
        }

        empresa.setNombre(dto.getNombre());
        empresa.setCuit(dto.getCuit());
        empresa.setDomicilio(dto.getDomicilio());
        empresa.setTelefono(dto.getTelefono());
        empresa.setEmail(dto.getEmail());
        empresa.setRubro(dto.getRubro());
        return mapToResponseDto(empresaRepository.save(empresa));
    }

    @Override
    @Transactional
    public void eliminar(Integer idEmpresa) {
        if (!empresaRepository.existsById(idEmpresa)) {
            throw new ResourceNotFoundException("Empresa no encontrada con id: " + idEmpresa);
        }
        empresaRepository.deleteById(idEmpresa);
    }

    private EmpresaResponseDto mapToResponseDto(Empresa entity) {
        return EmpresaResponseDto.builder()
                .id(entity.getId())
                .nombre(entity.getNombre())
                .cuit(entity.getCuit())
                .domicilio(entity.getDomicilio())
                .telefono(entity.getTelefono())
                .email(entity.getEmail())
                .rubro(entity.getRubro())
                .build();
    }
}

package com.practica.backend.service.impl;

import com.practica.backend.dto.ProveedorRequestDto;
import com.practica.backend.dto.ProveedorResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.Proveedor;
import com.practica.backend.repository.ProveedorRepository;
import com.practica.backend.service.ProveedorService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProveedorServiceImpl implements ProveedorService {

    private final ProveedorRepository proveedorRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDto> listarProveedores() {
        return proveedorRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponseDto buscarPorId(Integer id) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrada con id: " + id));
        return mapToResponseDto(proveedor);
    }

    @Override
    @Transactional(readOnly = true)
    public ProveedorResponseDto buscarPorRazonSocial(String razon) {
        Proveedor proveedor = proveedorRepository.findByRazonSocial(razon)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado: " + razon));
        return mapToResponseDto(proveedor);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ProveedorResponseDto> listarProveedoresPorEstado(String estado) {
        return proveedorRepository.findByEstado(estado).stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional
    public ProveedorResponseDto crear(ProveedorRequestDto dto) {
        if (proveedorRepository.existsByRazonSocial(dto.getRazonSocial())) {
            throw new ResourceAlreadyExistsException("Ya existe proveedor con razon social: " + dto.getRazonSocial());
        }

        Proveedor proveedor = Proveedor.builder()
                .razonSocial(dto.getRazonSocial())
                .cuit(dto.getCuit())
                .rubro(dto.getRubro())
                .telefono(dto.getTelefono())
                .email(dto.getEmail())
                .estado(dto.getEstado())
                .build();

        return mapToResponseDto(proveedorRepository.save(proveedor));
    }

    @Override
    @Transactional
    public ProveedorResponseDto actualizar(Integer id, ProveedorRequestDto dto) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));

        if (!proveedor.getRazonSocial().equalsIgnoreCase(dto.getRazonSocial())
                && proveedorRepository.existsByRazonSocial(dto.getRazonSocial())) {
            throw new ResourceAlreadyExistsException("Ya existe proveedor con razon social: " + dto.getRazonSocial());
        }

        proveedor.setRazonSocial(dto.getRazonSocial());
        proveedor.setCuit(dto.getCuit());
        proveedor.setRubro(dto.getRubro());
        proveedor.setTelefono(dto.getTelefono());
        proveedor.setEmail(dto.getEmail());
        proveedor.setEstado(dto.getEstado());
        return mapToResponseDto(proveedorRepository.save(proveedor));
    }

    @Override
    @Transactional
    public ProveedorResponseDto cambiarEstado(Integer id, String estado) {
        Proveedor proveedor = proveedorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con id: " + id));

        proveedor.setEstado(estado);
        return mapToResponseDto(proveedorRepository.save(proveedor));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!proveedorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Proveedor no encontrado con id: " + id);
        }
        proveedorRepository.deleteById(id);
    }

    private ProveedorResponseDto mapToResponseDto(Proveedor entity) {
        return ProveedorResponseDto.builder()
                .id(entity.getId())
                .razonSocial(entity.getRazonSocial())
                .cuit(entity.getCuit())
                .rubro(entity.getRubro())
                .telefono(entity.getTelefono())
                .email(entity.getEmail())
                .estado(entity.getEstado())
                .build();
    }
}

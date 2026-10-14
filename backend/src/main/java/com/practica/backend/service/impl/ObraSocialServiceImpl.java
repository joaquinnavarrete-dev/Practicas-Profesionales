package com.practica.backend.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.practica.backend.dto.ObraSocialRequestDto;
import com.practica.backend.dto.ObraSocialResponseDto;
import com.practica.backend.exception.ResourceAlreadyExistsException;
import com.practica.backend.exception.ResourceNotFoundException;
import com.practica.backend.model.ObraSocial;
import com.practica.backend.repository.ObraSocialRepository;
import com.practica.backend.service.ObraSocialService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ObraSocialServiceImpl implements ObraSocialService {

    private final ObraSocialRepository obraSocialRepository;

    @Override
    @Transactional(readOnly = true)
    public List<ObraSocialResponseDto> listarTodas() {
        return obraSocialRepository.findAll().stream()
                .map(this::mapToResponseDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ObraSocialResponseDto buscarPorId(Integer id) {
        ObraSocial obraSocial = obraSocialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Obra social no encontrada con id: " + id));
        return mapToResponseDto(obraSocial);
    }

    @Override
    @Transactional
    public ObraSocialResponseDto crear(ObraSocialRequestDto dto) {
        if (obraSocialRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una obra social con el nombre: " + dto.getNombre());
        }

        ObraSocial obraSocial = ObraSocial.builder()
                .nombre(dto.getNombre())
                .sigla(dto.getSigla())
                .build();

        return mapToResponseDto(obraSocialRepository.save(obraSocial));
    }

    @Override
    @Transactional
    public ObraSocialResponseDto actualizar(Integer id, ObraSocialRequestDto dto) {
        ObraSocial obraSocial = obraSocialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Obra social no encontrada con id: " + id));

        if (!obraSocial.getNombre().equalsIgnoreCase(dto.getNombre())
                && obraSocialRepository.existsByNombre(dto.getNombre())) {
            throw new ResourceAlreadyExistsException("Ya existe una obra social con el nombre: " + dto.getNombre());
        }

        obraSocial.setNombre(dto.getNombre());
        obraSocial.setSigla(dto.getSigla());
        return mapToResponseDto(obraSocialRepository.save(obraSocial));
    }

    @Override
    @Transactional
    public void eliminar(Integer id) {
        if (!obraSocialRepository.existsById(id)) {
            throw new ResourceNotFoundException("Obra social no encontrada con id: " + id);
        }
        obraSocialRepository.deleteById(id);
    }

    private ObraSocialResponseDto mapToResponseDto(ObraSocial entity) {
        return ObraSocialResponseDto.builder()
                .idObraSocial(entity.getIdObraSocial())
                .nombre(entity.getNombre())
                .sigla(entity.getSigla())
                .build();
    }
}

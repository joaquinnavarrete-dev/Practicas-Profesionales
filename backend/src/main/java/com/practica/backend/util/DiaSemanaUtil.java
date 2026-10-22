package com.practica.backend.util;

import java.time.DayOfWeek;

import com.practica.backend.exception.BadRequestException;

public final class DiaSemanaUtil {

    private DiaSemanaUtil() {}

    public static String normalizar(String dia) {
        if (dia == null || dia.isBlank()) {
            throw new BadRequestException("El día de la semana es obligatorio");
        }

        String limpio = dia.trim().toUpperCase()
                .replace("Á", "A")
                .replace("É", "E")
                .replace("Í", "I")
                .replace("Ó", "O")
                .replace("Ú", "U");

        return switch (limpio) {
            case "1", "LUNES", "MONDAY" -> "1";
            case "2", "MARTES", "TUESDAY" -> "2";
            case "3", "MIERCOLES", "WEDNESDAY" -> "3";
            case "4", "JUEVES", "THURSDAY" -> "4";
            case "5", "VIERNES", "FRIDAY" -> "5";
            case "6", "SABADO", "SATURDAY" -> "6";
            case "7", "DOMINGO", "SUNDAY" -> "7";
            default -> throw new BadRequestException(
                    "Día de la semana inválido: '" + dia + "'. Ingrese un valor del 1 al 7 (1=Lunes, 7=Domingo) o el nombre del día.");
        };
    }

    public static String obtenerNombre(String diaNumero) {
        if (diaNumero == null) return null;
        return switch (diaNumero.trim()) {
            case "1" -> "LUNES";
            case "2" -> "MARTES";
            case "3" -> "MIERCOLES";
            case "4" -> "JUEVES";
            case "5" -> "VIERNES";
            case "6" -> "SABADO";
            case "7" -> "DOMINGO";
            default -> diaNumero;
        };
    }

    public static String obtenerNumeroIso(DayOfWeek dayOfWeek) {
        return String.valueOf(dayOfWeek.getValue());
    }

    public static String obtenerNombreEspanol(DayOfWeek dayOfWeek) {
        return obtenerNombre(obtenerNumeroIso(dayOfWeek));
    }
}

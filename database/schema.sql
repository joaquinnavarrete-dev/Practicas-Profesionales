
CREATE DATABASE IF NOT EXISTS turnos_clinicos_db
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE turnos_clinicos_db;

CREATE TABLE rol (
    id_rol INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL,
    CONSTRAINT pk_rol PRIMARY KEY (id_rol),
    CONSTRAINT uq_rol_nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE especialidad (
    id_especialidad INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    CONSTRAINT pk_especialidad PRIMARY KEY (id_especialidad),
    CONSTRAINT uq_especialidad_nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE obra_social (
    id_obra_social INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    sigla VARCHAR(20) NULL,
    CONSTRAINT pk_obra_social PRIMARY KEY (id_obra_social),
    CONSTRAINT uq_obra_social_nombre UNIQUE (nombre)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE usuario (
    id_usuario INT NOT NULL AUTO_INCREMENT,
    nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
    contrasena VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    id_rol INT NOT NULL,
    CONSTRAINT pk_usuario PRIMARY KEY (id_usuario),
    CONSTRAINT uq_usuario_nombre UNIQUE (nombre_usuario),
    CONSTRAINT fk_usuario_rol 
        FOREIGN KEY (id_rol) 
        REFERENCES rol (id_rol) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    INDEX idx_usuario_rol (id_rol)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE medico (
    id_medico INT NOT NULL AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    matricula VARCHAR(100) NOT NULL,
    id_especialidad INT NOT NULL,
    CONSTRAINT pk_medico PRIMARY KEY (id_medico),
    CONSTRAINT uq_medico_matricula UNIQUE (matricula),
    CONSTRAINT fk_medico_especialidad 
        FOREIGN KEY (id_especialidad) 
        REFERENCES especialidad (id_especialidad) 
        ON UPDATE CASCADE 
        ON DELETE RESTRICT,
    INDEX idx_medico_especialidad (id_especialidad),
    INDEX idx_medico_apellido (apellido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE paciente (
    id_paciente INT NOT NULL AUTO_INCREMENT,
    dni VARCHAR(20) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL,
    id_obra_social INT NOT NULL,
    CONSTRAINT pk_paciente PRIMARY KEY (id_paciente),
    CONSTRAINT uq_paciente_dni UNIQUE (dni),
    CONSTRAINT fk_paciente_obra_social
        FOREIGN KEY (id_obra_social)
        REFERENCES obra_social (id_obra_social)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    INDEX idx_paciente_obra_social (id_obra_social),
    INDEX idx_paciente_apellido (apellido)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE dia_atencion (
    id_dia_atencion INT NOT NULL AUTO_INCREMENT,
    id_medico INT NOT NULL,
    dia_semana VARCHAR(30) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fin TIME NOT NULL,
    CONSTRAINT pk_dia_atencion PRIMARY KEY (id_dia_atencion),
    CONSTRAINT fk_dia_atencion_medico
        FOREIGN KEY (id_medico)
        REFERENCES medico (id_medico)
        ON UPDATE CASCADE
        ON DELETE CASCADE,
    CONSTRAINT chk_dia_atencion_dia CHECK (dia_semana BETWEEN 1 AND 7),
    CONSTRAINT chk_dia_atencion_horario CHECK (hora_inicio < hora_fin),
    CONSTRAINT uq_dia_atencion_medico_dia UNIQUE (id_medico, dia_semana),
    INDEX idx_dia_atencion_medico (id_medico)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE turno (
    id_turno INT NOT NULL AUTO_INCREMENT,
    id_paciente INT NOT NULL,
    id_medico INT NOT NULL,
    id_especialidad INT NOT NULL,
    fecha DATE NOT NULL,
    hora TIME NOT NULL,
    CONSTRAINT pk_turno PRIMARY KEY (id_turno),
    CONSTRAINT fk_turno_paciente
        FOREIGN KEY (id_paciente)
        REFERENCES paciente (id_paciente)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_turno_medico
        FOREIGN KEY (id_medico)
        REFERENCES medico (id_medico)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT fk_turno_especialidad
        FOREIGN KEY (id_especialidad)
        REFERENCES especialidad (id_especialidad)
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT uq_turno_medico_fecha_hora UNIQUE (id_medico, fecha, hora),
    INDEX idx_turno_paciente (id_paciente),
    INDEX idx_turno_medico_fecha (id_medico, fecha),
    INDEX idx_turno_fecha (fecha)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

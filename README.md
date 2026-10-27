# Practicas-Profesionales - Sistema de Gestión de Turnos Clínicos

Sistema web integral para la administración y reserva de turnos clínicos médicos, desarrollado como proyecto de práctica profesional. Permite la autogestión de pacientes (registro, consulta de turnos, reserva online y cancelación) y la administración clínica (gestión de médicos, especialidades, obras sociales, días de atención, usuarios y roles).

---

# 🛠️ Tecnologías

## Frontend
- **Framework:** Angular 22
- **Entorno de ejecución:** Node.js 22 LTS
- **Gestor de paquetes:** npm 10.x
- **Lenguaje:** TypeScript 5.x / 6.x
- **Estilos y Arquitectura:** Componentes Standalone, Layouts diferenciados (Público y Administrativo)
- **Pruebas:** Vitest

## Backend
- **Lenguaje:** Java 21 LTS
- **Framework:** Spring Boot 4.1.x
- **Gestor de dependencias:** Maven
- **Capa Web:** Spring Web (RESTful API)
- **Persistencia:** Spring Data JPA / Hibernate ORM
- **Seguridad:** Spring Security 7.x
- **Autenticación:** Tokens JWT (Java JWT - `jjwt` 0.12.6)
- **Encriptación:** BCrypt Password Encoder
- **Documentación:** SpringDoc OpenAPI 3 / Swagger UI 2.8.5
- **Utilidades:** Project Lombok, Dotenv Java (variables de entorno `.env`)
- **Driver de Base de Datos:** MySQL Connector/J

## Base de datos
- **Motor:** MySQL 8.0 / 8.4 LTS
- **Administración gráfica:** MySQL Workbench

## Control de versiones
- **Herramientas:** Git y GitHub

---

# 💻 Requisitos del entorno

Para compilar y ejecutar el proyecto localmente es recomendable tener instaladas las siguientes herramientas:

| Herramienta | Versión recomendada |
| :--- | :--- |
| **Node.js** | 22 LTS |
| **npm** | Incluido con Node.js (10.x) |
| **Angular CLI** | 22.x |
| **Java (JDK)** | 21 LTS |
| **Maven** | 3.6.3 o superior (o utilizar el wrapper `./mvnw`) |
| **MySQL Server** | 8.0 / 8.4 LTS |
| **MySQL Workbench** | Compatible con MySQL 8.x |
| **Git** | Versión estable actual |
| **IDE recomendado** | VS Code (Frontend) / IntelliJ IDEA o VS Code (Backend) |

---

# 📦 Instalación y Configuración del Entorno

### 1. Git
Descargar e instalar Git desde [https://git-scm.com/](https://git-scm.com/).

Configurar credenciales globales:
```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

### 2. Node.js y npm
Descargar e instalar **Node.js 22 LTS** desde [https://nodejs.org/](https://nodejs.org/).

Verificar instalación:
```bash
node --version
npm --version
```

### 3. Angular CLI
Instalar la herramienta de línea de comandos de Angular globalmente:
```bash
npm install -g @angular/cli
```

Verificar instalación:
```bash
ng version
```

### 4. Java JDK 21
Instalar el **Java Development Kit (JDK) 21 LTS** (por ejemplo, Oracle JDK, Eclipse Temurin o Amazon Corretto).

Verificar instalación:
```bash
java --version
javac --version
```

### 5. Maven
Se puede instalar Maven localmente o utilizar el script `./mvnw` (Linux/Mac) o `.\mvnw.cmd` (Windows) incluido en la raíz de la carpeta `backend/`.

Verificar instalación de Maven:
```bash
mvn --version
```

### 6. MySQL Server y MySQL Workbench
Instalar **MySQL Community Server 8.0 / 8.4 LTS** y **MySQL Workbench** desde [https://dev.mysql.com/downloads/](https://dev.mysql.com/downloads/).

---

# 🗄️ Base de Datos

El sistema utiliza la base de datos relacional `turnos_clinicos_db`.

### 1. Creación de la Estructura
El script DDL completo con tablas, restricciones de clave foránea, claves únicas e índices se encuentra en:
```text
database/schema.sql
```

Para crearlo manualmente en MySQL:
```bash
mysql -u root -p < database/schema.sql
```

### 2. Inicialización Automática de Datos
El backend incluye un componente `DataInitializer` que al arrancar:
1. Asegura la existencia de los 4 roles del sistema: `ADMINISTRADOR`, `MEDICO`, `RECEPCIONISTA` y `PACIENTE`.
2. Genera automáticamente el usuario administrador inicial si no existe en la base de datos:
   - **Usuario:** `admin`
   - **Contraseña:** `admin123`
   - **Rol:** `ADMINISTRADOR`

---

# 🔐 Seguridad, Autenticación y Control de Acceso (RBAC)

El backend implementa un esquema moderno de seguridad sin estado (**Stateless**) basado en **Spring Security** y tokens **JWT**.

### Roles del Sistema
- `ROLE_ADMINISTRADOR`: Control total sobre usuarios, roles, especialidades, médicos, obras sociales y turnos.
- `ROLE_MEDICO`: Acceso a la gestión de sus días/horarios de atención y consulta de agenda de turnos asignados.
- `ROLE_RECEPCIONISTA`: Gestión operativa de pacientes y turnos clínicos en mostrador.
- `ROLE_PACIENTE`: Autogestión de su propio perfil y reserva/cancelación online de sus turnos.

### Funcionalidades de Seguridad
1. **Login Unificado (`POST /api/auth/login`):** Una única interfaz y endpoint para cualquier usuario (administradores, médicos, recepcionistas o pacientes). Devuelve el token JWT con claims contextuales (`idUsuario`, `rol`, `idPaciente`, `idMedico`).
2. **Auto-registro de Pacientes (`POST /api/auth/registro-paciente`):** Registro público y abierto para nuevos pacientes, vinculando automáticamente su ficha médica con su cuenta de acceso y generando su sesión de inmediato.
3. **Autogestión de Pacientes:**
   - `GET /api/pacientes/mi-perfil` y `PUT /api/pacientes/mi-perfil`: Consulta y edición de datos personales sin exponer IDs en la URL.
   - `GET /api/turnos/mis-turnos`: Historial de turnos propios.
   - `POST /api/turnos/solicitar`: Reserva directa asociada al paciente autenticado.
   - `DELETE /api/turnos/mis-turnos/{id}`: Cancelación segura restringida exclusivamente a turnos propios.
4. **Manejo Uniforme de Errores JSON:**
   - `400 Bad Request`: Validaciones de campos o JSON malformado.
   - `401 Unauthorized`: Token ausente, expirado o credenciales incorrectas.
   - `403 Forbidden`: Privilegios insuficientes para la acción.
   - `404 Not Found`: Recurso o ruta no encontrada.
   - `409 Conflict`: Conflictos de duplicidad (DNI, matrícula, usuario o turno superpuesto).

---

# 🌐 Principales Endpoints de la API REST

| Módulo | Método | Endpoint | Acceso / Rol | Descripción |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/auth/login` | Público | Inicio de sesión unificado |
| **Auth** | `POST` | `/api/auth/registro-paciente` | Público | Auto-registro de pacientes |
| **Catálogo** | `GET` | `/api/especialidades` | Público | Listar especialidades médicas |
| **Catálogo** | `GET` | `/api/obras-sociales` | Público | Listar obras sociales |
| **Catálogo** | `GET` | `/api/medicos` | Público | Listar médicos y especialidad |
| **Turnos** | `GET` | `/api/turnos/disponibles` | Público | Consultar turnos disponibles por médico y fecha |
| **Pacientes** | `GET` | `/api/pacientes/mi-perfil` | `PACIENTE` | Ver perfil del paciente autenticado |
| **Pacientes** | `PUT` | `/api/pacientes/mi-perfil` | `PACIENTE` | Actualizar perfil del paciente autenticado |
| **Turnos** | `GET` | `/api/turnos/mis-turnos` | `PACIENTE` | Listar turnos del paciente autenticado |
| **Turnos** | `POST` | `/api/turnos/solicitar` | `PACIENTE` | Solicitar y reservar un turno |
| **Turnos** | `DELETE`| `/api/turnos/mis-turnos/{id}` | `PACIENTE` | Cancelar turno propio |
| **Turnos** | `GET` | `/api/turnos/agenda` | `MEDICO`, `ADMIN` | Consultar agenda por médico y fecha |
| **Turnos** | `PUT` | `/api/turnos/{id}/reprogramar`| `ADMIN`, `RECEPCIONISTA`, `MEDICO` | Reprogramar turno (Body JSON o Query) |
| **Días Atención** | `GET`/`POST`/`PUT` | `/api/dias-atencion/**` | `MEDICO`, `ADMIN` | Gestión de franjas horarias de atención |
| **Pacientes Admin**| `GET`/`POST`/`PUT` | `/api/pacientes/**` | `ADMIN`, `RECEPCIONISTA` | Gestión general de fichas de pacientes |
| **Médicos Admin** | `POST`/`PUT`/`DELETE` | `/api/medicos/**` | `ADMIN` | Alta, edición y vinculación de médicos con usuarios |
| **Usuarios** | `GET`/`POST`/`PUT`/`PATCH` | `/api/usuarios/**` | `ADMIN` | Administración de cuentas de usuario del sistema |
| **Roles** | `GET`/`POST` | `/api/roles/**` | `ADMIN` | Consulta y gestión de roles |

### Documentación Interactiva (Swagger UI)
Con el backend en ejecución, se puede acceder a la interfaz interactiva de OpenAPI en:
- **Swagger UI:** [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON:** [http://localhost:8080/api-docs](http://localhost:8080/api-docs)

> En Swagger UI se encuentra disponible el botón verde **Authorize** para ingresar el token JWT (`Bearer <token>`) y probar solicitudes autenticadas directamente en el navegador.

---

# 📁 Estructura del Proyecto

```text
Practicas-Profesionales/
├── database/
│   └── schema.sql                  # Definición DDL de base de datos MySQL
│
├── backend/
│   ├── src/main/java/com/practica/backend/
│   │   ├── config/                 # Configuración de OpenAPI Swagger y DataInitializer
│   │   ├── controller/             # Controladores REST (Auth, Turno, Paciente, Medico, etc.)
│   │   ├── dto/                    # Objetos de transferencia (Request, Response, ErrorResponse)
│   │   ├── exception/              # GlobalExceptionHandler y excepciones de negocio
│   │   ├── model/                  # Entidades JPA (Paciente, Medico, Turno, Usuario, etc.)
│   │   ├── repository/             # Repositorios Spring Data JPA
│   │   ├── security/               # SecurityConfig, JwtService, filtros y adaptadores de usuario
│   │   ├── service/                # Interfaces de lógica de negocio
│   │   │   └── impl/               # Implementaciones de servicios transaccionales
│   │   └── util/                   # Utilidades de conversión (días de semana ISO-8601)
│   ├── src/main/resources/
│   │   └── application.properties  # Configuración de Spring Boot y variables
│   ├── .env.example                # Plantilla de variables de entorno locales
│   └── pom.xml                     # Dependencias de Maven
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── componentes/        # Componentes UI reutilizables (Navbar, Sidebar, etc.)
│   │   │   ├── layouts/            # Layout público y layout administrativo
│   │   │   ├── paginas/            # Vistas públicas (Inicio, Login, Registro, Turnos) y
│   │   │   │                       # Vistas administrativas (Dashboard, Médicos, Especialidades, etc.)
│   │   │   ├── app.routes.ts       # Enrutamiento de la aplicación Angular
│   │   │   └── app.config.ts       # Configuración global de proveedores de Angular
│   │   └── index.html
│   ├── angular.json
│   └── package.json
│
└── README.md                       # Documentación central del repositorio
```

---

# ▶️ Ejecución del Proyecto

## 1. Backend (Spring Boot)

1. Ingresar a la carpeta del backend:
   ```bash
   cd backend
   ```

2. Configurar el archivo `.env` a partir de la plantilla:
   ```bash
   cp .env.example .env
   ```
   Asegurar las credenciales de conexión a MySQL y el secreto JWT:
   ```properties
   SERVER_PORT=8080
   DB_URL=jdbc:mysql://localhost:3306/turnos_clinicos_db?useSSL=false&serverTimezone=America/Argentina/Buenos_Aires&allowPublicKeyRetrieval=true&createDatabaseIfNotExist=true
   DB_USERNAME=root
   DB_PASSWORD=tu_contraseña
   JPA_DDL_AUTO=update
   JPA_SHOW_SQL=true
   JWT_SECRET=tu_clave_secreta_jwt_de_al_menos_256_bits
   JWT_EXPIRATION=86400000
   ```

3. Compilar y ejecutar la aplicación:
   - **En Windows:**
     ```bash
     .\mvnw.cmd spring-boot:run
     ```
   - **En Linux / Mac:**
     ```bash
     ./mvnw spring-boot:run
     ```

4. El servidor estará disponible en:
   ```text
   http://localhost:8080
   ```

---

## 2. Frontend (Angular)

1. Ingresar a la carpeta del frontend:
   ```bash
   cd frontend
   ```

2. Instalar las dependencias de Node.js:
   ```bash
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```bash
   ng serve
   ```
   o
   ```bash
   npm start
   ```

4. La aplicación web estará accesible en el navegador en:
   ```text
   http://localhost:4200
   ```

---

# 📌 Estado del Proyecto

| Etapa | Descripción | Estado |
| :--- | :--- | :---: |
| **1. Definición de Requerimientos y Actores** | Especificación de alcance, roles y funcionalidades clínicas. | ✅ Completado |
| **2. Diseño de Base de Datos (DER)** | Modelo entidad-relación y scripts DDL (`database/schema.sql`). | ✅ Completado |
| **3. Arquitectura y Capa de Persistencia** | Entidades JPA, repositorios y relaciones con claves foráneas. | ✅ Completado |
| **4. API REST Backend** | CRUD completo de Especialidades, Médicos, Obras Sociales, Días de Atención, Pacientes y Turnos. | ✅ Completado |
| **5. Lógica de Turnos y Disponibilidad** | Algoritmo de cálculo de slots de 30 minutos sin solapamiento y validación de franjas horarias. | ✅ Completado |
| **6. Seguridad y Autenticación (JWT + RBAC)** | Spring Security, hash BCrypt, emisión/validación de tokens JWT y control de acceso por roles. | ✅ Completado |
| **7. Autogestión de Pacientes** | Registro público, login unificado, consulta y reserva online de turnos propios. | ✅ Completado |
| **8. Auditoría y Refinamiento de Backend** | Unificación de contraseñas, vinculación médico-usuario, excepciones HTTP 400/404 y Swagger UI Bearer. | ✅ Completado |
| **9. Estructura y Vistas Frontend (Angular)** | Enrutamiento, layouts público/admin, vistas de catálogo, login y paneles de administración. | ✅ Completado |
| **10. Integración Frontend / Backend** | Conexión de servicios Angular (`HttpClient`) con endpoints protegidos por JWT. | 🔄 En Progreso |
| **11. Pruebas Integrales de Usuario** | Validación de flujos end-to-end (paciente y administración clínica). | ⏳ Próximamente |
| **12. Despliegue y Documentación Final** | Preparación para entorno de producción e informe final. | ⏳ Próximamente |

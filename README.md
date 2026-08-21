# Practicas-Profesionales

---

# 🛠️ Tecnologías

## Frontend

- Angular 22
- Node.js 22 LTS
- npm

## Backend

- Java 21 LTS
- Spring Boot 4.1.x
- Maven
- Spring Web
- Spring Data JPA
- MySQL Driver

## Base de datos

- MySQL 8.4 LTS
- MySQL Workbench

## Control de versiones

- Git
- GitHub

---

# 💻 Requisitos del entorno

Recomendable tener instaladas las siguientes herramientas:

| Herramienta        | Versión                  |
| ------------------ | ------------------------ |
| Node.js            | 22 LTS                   |
| npm                | Incluido con Node.js     |
| Angular CLI        | 22.x                     |
| Java               | 21 LTS                   |
| Spring Boot        | 4.1.x                    |
| Maven              | 3.6.3 o superior         |
| MySQL              | 8.4 LTS                  |
| MySQL Workbench    | Compatible con MySQL 8.4 |
| Git                | Versión estable actual   |
| Visual Studio Code | Versión estable actual   |

---

# 📦 Instalación del entorno

## 1. Git

Instalar Git:

[https://git-scm.com/](https://git-scm.com/)

Para comprobar si se instalo:

```bash
git --version
```

Para configurar nombre y correo:

```bash
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

Para comprobar la configuración:

```bash
git config --global --list
```

---

# 🟢 2. Node.js

Instalar **Node.js 22 LTS**.

Para comprobar que se instalo:

```bash
node --version
```

Para comprobar que se instalo npm:

```bash
npm --version
```

> No es necesario instalar npm por separado. npm se instala junto con Node.js.

---

# 🅰️ 3. Angular CLI

Despues de instalar Node.js, instalar Angular CLI:

```bash
npm install -g @angular/cli
```

Para comprobar que se instalo:

```bash
ng version
```

Versión de Angular CLI es recomendable que sea 22.x.

---

# ☕ 4. Java

Instalar **Java Development Kit (JDK) 21 LTS**.

Instalar el **JDK**, no solamente un JRE.

Para comprobar que se instalo:

```bash
java --version
```

Para comprobar el compilador:

```bash
javac --version
```

---

# 🛠️ 5. Maven

Usaremos Maven para administrar las dependencias y construir el proyecto Spring Boot.

Instalar Maven 3.6.3 o superior.

Para comprobar que se instalo:

```bash
mvn --version
```

---

# 🍃 6. Spring Boot

Spring Boot no necesita instalarse.

El proyecto se creara utilizando Spring Initializr.

Configuración inicial recomendada:

```text
Project: Maven
Language: Java
Spring Boot: 4.1.x
Packaging: Jar
Java: 21
```

Dependencias iniciales:

```text
Spring Web
Spring Data JPA
MySQL Driver
Validation
```

Se agregara la dependencia de Spring Security cuando implementemos autenticación y autorización.

---

# 🐬 7. MySQL

Instalar:

**MySQL Community Server 8.4 LTS**

También instalar:

**MySQL Workbench**

Utilizaremos MySQL Server como motor de base de datos y MySQL Workbench como herramienta gráfica para administrar la base.

Para comprobar que se instalo:

```bash
mysql --version
```

---

# 🖥️ IDE recomendado

## Visual Studio Code

Utilizaremos Visual Studio Code para el desarrollo del frontend.

## IntelliJ IDEA (Opcional)

Se puede utilizar IntelliJ IDEA para desarrollar el backend con Java y Spring Boot.

---

# 📁 Estructura del proyecto

El repositorio tendrá inicialmente una estructura similar a:

```text
carpeta-principal/
│
├── frontend/
│   └── ...
│
├── backend/
│   └── ...
│
├── database/
│   ├── schema.sql
│   └── data.sql
│
└── README.md
```

## frontend

Tendrá la aplicación desarrollada con Angular.

## backend

Tendrá la API REST desarrollada con Spring Boot.

## database

Tendrá los scripts SQL para crear y poblar la base de datos.

---

# ▶️ Ejecución del proyecto

## Frontend

Ingresar a la carpeta:

```bash
cd frontend
```

Instalar dependencias:

```bash
npm install
```

Ejecutar Angular:

```bash
ng serve
```

Por defecto, la aplicación se muestra en:

```text
http://localhost:4200
```

---

## Backend

Ingresar a la carpeta:

```bash
cd backend
```

Ejecutar utilizando Maven:

```bash
mvn spring-boot:run
```

El puerto utilizado por el backend está definido en la configuración de Spring Boot.

Por ejemplo:

```text
http://localhost:8080
```

---

# 📌 Estado del proyecto

Actualmente el proyecto se encuentra en la etapa de preparación del entorno de desarrollo.

Próximas etapas:

1. Definición de requerimientos.
2. Análisis de actores.
3. Casos de uso.
4. Diseño de la base de datos.
5. Diseño de la arquitectura.
6. Diseño de la API REST.
7. Desarrollo del backend.
8. Desarrollo del frontend.
9. Integración frontend/backend.
10. Implementación de autenticación y autorización.
11. Pruebas manuales.
12. Documentación.


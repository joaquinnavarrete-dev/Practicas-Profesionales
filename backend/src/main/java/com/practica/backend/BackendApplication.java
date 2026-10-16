package com.practica.backend;

import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.github.cdimascio.dotenv.Dotenv;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        String envDir = Files.exists(Path.of(".env")) ? "./" : "../";
        Dotenv dotenv = Dotenv.configure()
                .directory(envDir)
                .ignoreIfMissing()
                .load();

        dotenv.entries().forEach(entry -> {
            if (System.getProperty(entry.getKey()) == null && System.getenv(entry.getKey()) == null) {
                System.setProperty(entry.getKey(), entry.getValue());
            }
        });

        SpringApplication.run(BackendApplication.class, args);
    }
}

package com.practica.backend.security;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final UserDetailsServiceImpl userDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final CustomAccessDeniedHandler customAccessDeniedHandler;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("http://localhost:4200", "http://localhost:*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept", "Origin", "X-Requested-With"));
        configuration.setExposedHeaders(List.of("Authorization"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(jwtAuthenticationEntryPoint)
                .accessDeniedHandler(customAccessDeniedHandler)
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                .requestMatchers("/api/auth/**").permitAll()
                
                .requestMatchers(
                    "/swagger-ui/**",
                    "/swagger-ui.html",
                    "/v3/api-docs/**",
                    "/api-docs/**"
                ).permitAll()

                .requestMatchers(HttpMethod.GET, "/api/especialidades/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/medicos/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/obras-sociales/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/turnos/disponibles/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/dias-atencion/**").permitAll()

                .requestMatchers("/api/pacientes/mi-perfil", "/api/pacientes/mi-perfil/**").hasRole("PACIENTE")
                .requestMatchers(
                    "/api/turnos/mis-turnos",
                    "/api/turnos/mis-turnos/**",
                    "/api/turnos/solicitar",
                    "/api/turnos/solicitar/**"
                ).hasRole("PACIENTE")

                .requestMatchers("/api/usuarios/**").hasRole("ADMINISTRADOR")
                .requestMatchers("/api/roles/**").hasRole("ADMINISTRADOR")

                .requestMatchers(HttpMethod.POST, "/api/especialidades/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT, "/api/especialidades/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/especialidades/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST, "/api/obras-sociales/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT, "/api/obras-sociales/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/obras-sociales/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.POST, "/api/medicos/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.PUT, "/api/medicos/**").hasRole("ADMINISTRADOR")
                .requestMatchers(HttpMethod.DELETE, "/api/medicos/**").hasRole("ADMINISTRADOR")

                .requestMatchers(HttpMethod.POST, "/api/dias-atencion/**").hasAnyRole("ADMINISTRADOR", "MEDICO")
                .requestMatchers(HttpMethod.PUT, "/api/dias-atencion/**").hasAnyRole("ADMINISTRADOR", "MEDICO")
                .requestMatchers(HttpMethod.DELETE, "/api/dias-atencion/**").hasAnyRole("ADMINISTRADOR", "MEDICO")

                .requestMatchers("/api/pacientes/**").hasAnyRole("ADMINISTRADOR", "RECEPCIONISTA")

                .requestMatchers("/api/turnos/**").hasAnyRole("ADMINISTRADOR", "RECEPCIONISTA", "MEDICO")

                .anyRequest().authenticated()
            )
            .authenticationProvider(authenticationProvider())
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

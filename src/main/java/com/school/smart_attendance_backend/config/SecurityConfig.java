package com.school.smart_attendance_backend.config;

import com.school.smart_attendance_backend.security.CustomUserDetailsService;
import com.school.smart_attendance_backend.security.JwtAuthenticationFilter;
import com.school.smart_attendance_backend.security.JwtTokenProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    new AntPathRequestMatcher("/api/auth/**"),
                    new AntPathRequestMatcher("/login.html"),
                    new AntPathRequestMatcher("/register-teacher.html"),
                    new AntPathRequestMatcher("/attendance.html"),
                    new AntPathRequestMatcher("/dashboard.html")
                ).permitAll()

                .requestMatchers(new AntPathRequestMatcher("/api/attendance", "POST")).permitAll()

                .requestMatchers(new AntPathRequestMatcher("/api/admin/**")).hasRole("ADMIN")

                .requestMatchers(new AntPathRequestMatcher("/api/teacher/**")).hasAnyRole("ADMIN", "TEACHER")

                .requestMatchers(new AntPathRequestMatcher("/api/student/**")).hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                .requestMatchers(new AntPathRequestMatcher("/api/students", "POST")).hasAnyRole("ADMIN", "TEACHER")

                .requestMatchers(new AntPathRequestMatcher("/api/students", "GET")).hasAnyRole("ADMIN", "TEACHER", "STUDENT")

                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}

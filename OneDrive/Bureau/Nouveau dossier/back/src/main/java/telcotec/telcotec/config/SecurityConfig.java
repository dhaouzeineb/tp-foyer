package telcotec.telcotec.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.XXssProtectionHeaderWriter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http, CorsConfigurationSource corsConfigurationSource) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource)) // Apply custom CORS configuration
                .csrf(AbstractHttpConfigurer::disable) // Disable CSRF protection as it's not required for WebSocket
                .headers(headers -> headers
                        .xssProtection(xss -> xss.headerValue(XXssProtectionHeaderWriter.HeaderValue.ENABLED))
                ) // Protection des en-têtes HTTP
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/auth/**",
                                "/api/**",
                                "/swagger-ui/**",
                                "/favicon.ico",
                                "/error",
                                "/v3/api-docs/**",
                                "/reclamations/**",
                                "/uploads/**",
                                "/images/**",
                                "/voices/**",
                                "/videos/**",
                                "/signal/**",
                                "/socket.io/**",// Allow WebSocket connection path
                                "/ws/**",
                                "/favicon.ico/**",
                                "/socket/**"



                        ).permitAll()
                        .anyRequest().authenticated() // Secure other paths
                )
                .logout(logout -> logout
                        .logoutUrl("/logout") // Default logout endpoint
                        .logoutSuccessUrl("/login?logout=true") // Redirect after logout
                )
                .exceptionHandling(exceptions -> exceptions
                        .accessDeniedPage("/access-denied") // Custom access denied page
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED) // Set session creation policy
                        .maximumSessions(1) // Maximum number of concurrent sessions per user
                        .expiredUrl("/login?expired=true") // Redirect to login page if session expired
                )
                .rememberMe(rememberMe -> rememberMe
                        .key("uniqueAndSecret") // Set a unique key for remember-me token
                        .tokenValiditySeconds(86400) // Token validity duration in seconds (e.g., 1 day)
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // Frontend origin
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")); // Allow all HTTP methods
        configuration.setAllowedHeaders(List.of("Authorization", "Content-Type", "Accept")); // Allow specific headers
        configuration.setAllowCredentials(true); // Allow credentials (cookies, etc.)

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Apply CORS settings to all routes
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(); // Password encoder for secure password storage
    }
}

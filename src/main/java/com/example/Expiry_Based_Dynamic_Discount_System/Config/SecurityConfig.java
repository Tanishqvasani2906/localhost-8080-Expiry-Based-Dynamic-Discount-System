package com.example.Expiry_Based_Dynamic_Discount_System.Config;


import com.example.Expiry_Based_Dynamic_Discount_System.Service.CustomUserDetailsService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class SecurityConfig {

    private final CustomUserDetailsService userDetailsService;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(CustomUserDetailsService userDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.userDetailsService = userDetailsService;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(customizer -> customizer.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/userlogin/login", "/userlogin/register" , "/userlogin/logout").permitAll()
                        .requestMatchers("/userlogin/change-password","/userlogin/forgot-password","/userlogin/reset-password/**").permitAll()
                                .requestMatchers("/userlogin/auth/google/callback").permitAll()
                                .requestMatchers("/products/addProduct").permitAll()

//                        .requestMatchers("/api/jobs/post/new").hasAnyRole("COMPANY", "ADMIN")
                        .anyRequest().authenticated()
                )
//                .exceptionHandling(exception -> exception
//                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)) // Return 401 for unauthorized access
//                )
//               FOR THE GOOGLE AUTH BELOW 4 LINES OF CODE
//                .oauth2Login(oauth2 -> oauth2
//                        .loginPage("/oauth2/authorization/google") // Redirect to Google login page
//                        .defaultSuccessUrl("https://careervistaa.vercel.app/", true) // Success redirect
//                        .failureUrl("/login?error=true") // Failure redirect
//                        .authorizationEndpoint(authorization -> authorization
//                                .baseUri("/oauth2/authorization")
//                                .authorizationRequestRepository(new HttpSessionOAuth2AuthorizationRequestRepository())
//                        )
//                )
                .oauth2Login(oath2 -> oath2.disable())

                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public AuthenticationManager authenticationManager(HttpSecurity http) throws Exception {
        AuthenticationManagerBuilder authenticationManagerBuilder = http.getSharedObject(AuthenticationManagerBuilder.class);
        authenticationManagerBuilder.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
        return authenticationManagerBuilder.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}


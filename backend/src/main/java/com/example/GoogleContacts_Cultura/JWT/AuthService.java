package com.example.GoogleContacts_Cultura.JWT;

import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.repository.UserRepo;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final CustomUserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;
    private final UserRepo userRepo;

    public AuthService(AuthenticationManager authenticationManager, CustomUserDetailsService userDetailsService, JwtUtil jwtUtil, UserRepo userRepo) {
        this.authenticationManager = authenticationManager;
        this.userDetailsService = userDetailsService;
        this.jwtUtil = jwtUtil;
        this.userRepo = userRepo;
    }

    public String login(String email, String password) {
        try {
            // Authenticate using email
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, password));

            UserDetails userDetails = userDetailsService.loadUserByUsername(email); // Load user by email
            UserEntity user = userRepo.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));

            return jwtUtil.generateToken(userDetails.getUsername(), user.getRole().name(), user.getId(), user.getEmail());
        } catch (BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }


}

package com.example.GoogleContacts_Cultura.JWT;

import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.repository.UserRepo;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;

    public AuthController(AuthService authService, UserRepo userRepo, JwtUtil jwtUtil) {
        this.authService = authService;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody AuthRequest request) {
        String token = authService.login(request.getEmail(), request.getPassword());

        UserEntity userEntity = userRepo.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, Object> user = new HashMap<>();
        user.put("id", userEntity.getId());
        user.put("username", userEntity.getUsername()); // keep username for display
        user.put("role", userEntity.getRole().name());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", user);

        return ResponseEntity.ok(response);
    }


    @GetMapping("/token-login")
    public ResponseEntity<Map<String, String>> tokenLogin(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String token = authHeader.substring(7); // Remove "Bearer "
        String email = jwtUtil.extractUsername(token); // <-- treat it as email now!

        if (email == null || jwtUtil.isTokenExpired(token)) {
            return ResponseEntity.status(401).build();
        }

        UserEntity user = userRepo.findByEmail(email) // <-- find by email
                .orElseThrow(() -> new RuntimeException("User not found"));

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole().name());

        return ResponseEntity.ok(response);
    }

}

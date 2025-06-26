package com.example.GoogleContacts_Cultura.JWT;

import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.model.Role;
import com.example.GoogleContacts_Cultura.repository.UserRepo;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class AndroidGoogleAuthController {

    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;

    public AndroidGoogleAuthController(
            UserRepo userRepo,
            JwtUtil jwtUtil
    ) {
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/google-login/android")
    public ResponseEntity<?> loginAndroidSimple(@RequestBody Map<String, String> request) {
        try {
            String email = request.get("email");
            String name = request.get("name");
            String googleId = request.get("googleId");

            if (email == null || email.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Missing email"));
            }

            // Find or create user
            UserEntity userEntity = userRepo.findByEmail(email)
                    .orElseGet(() -> {
                        UserEntity newUser = new UserEntity();
                        newUser.setEmail(email);
                        newUser.setUsername(name != null ? name : email);
                        newUser.setPassword(""); // Google users don't need a password
                        newUser.setRole(Role.USER);
                        return userRepo.save(newUser);
                    });

            // Generate JWT token
            String jwtToken = jwtUtil.generateToken(
                    userEntity.getEmail(),
                    userEntity.getRole().name(),
                    userEntity.getId(),
                    userEntity.getEmail()
            );

            // Create response
            Map<String, Object> user = new HashMap<>();
            user.put("id", userEntity.getId());
            user.put("username", userEntity.getUsername());
            user.put("role", userEntity.getRole().name());

            Map<String, Object> response = new HashMap<>();
            response.put("token", jwtToken);
            response.put("user", user);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Collections.singletonMap("error", "Error processing login: " + e.getMessage()));
        }
    }
}
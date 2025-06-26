package com.example.GoogleContacts_Cultura.JWT;

import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.model.Role;
import com.example.GoogleContacts_Cultura.repository.UserRepo;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/auth")
public class GoogleAuthController {

    private final AuthService authService;
    private final UserRepo userRepo;
    private final JwtUtil jwtUtil;

    private final String androidClientId;
    private final String webClientId;

    public GoogleAuthController(
            AuthService authService,
            UserRepo userRepo,
            JwtUtil jwtUtil,
            @Value("${google.client-id.android}") String androidClientId,
            @Value("${google.client-id.web}") String webClientId
    ) {
        this.authService = authService;
        this.userRepo = userRepo;
        this.jwtUtil = jwtUtil;
        this.androidClientId = androidClientId;
        this.webClientId = webClientId;
    }
    @PostMapping("/google-login/web")
    public ResponseEntity<?> loginWeb(@RequestBody Map<String, String> request) {
        return handleGoogleLogin(request, webClientId);
    }

    private ResponseEntity<?> handleGoogleLogin(Map<String, String> request, String expectedAudience) {
        try {
            String idTokenString = request.get("idToken");

            if (idTokenString == null || idTokenString.isEmpty()) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Missing ID token"));
            }

            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), JacksonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(expectedAudience))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid ID token"));
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String name = (String) payload.get("name");

            UserEntity userEntity = userRepo.findByEmail(email)
                    .orElseGet(() -> {
                        UserEntity newUser = new UserEntity();
                        newUser.setEmail(email);
                        newUser.setUsername(name != null ? name : email);
                        newUser.setPassword("");
                        newUser.setRole(Role.USER);
                        return userRepo.save(newUser);
                    });

            String jwtToken = jwtUtil.generateToken(
                    userEntity.getEmail(),
                    userEntity.getRole().name(),
                    userEntity.getId(),
                    userEntity.getEmail()
            );

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

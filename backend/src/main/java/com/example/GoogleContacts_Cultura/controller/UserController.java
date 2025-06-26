package com.example.GoogleContacts_Cultura.controller;

import com.example.GoogleContacts_Cultura.DTO.RoleRequestResponse;
import com.example.GoogleContacts_Cultura.JWT.JwtUtil;
import com.example.GoogleContacts_Cultura.entity.RoleRequest;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.model.Role;
import com.example.GoogleContacts_Cultura.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;


import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;


    public UserController(UserService userService, JwtUtil jwtUtil, PasswordEncoder passwordEncoder){
        this.userService = userService;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    public static class ChangePasswordRequest {
        public String oldPassword;
        public String newPassword;
    }

    // CRUD starts here:

    @PostMapping("/register")
    public ResponseEntity<UserEntity> registerUser(@RequestBody UserEntity user) {
        return ResponseEntity.ok(userService.registerUser(user));
    }

    @GetMapping("/all")
    public ResponseEntity<List<UserEntity>> getAllUsers() {
        return ResponseEntity.ok(userService.findAllUsers());
    }

    @GetMapping("/admins")
    public ResponseEntity<List<UserEntity>> getAllAdmins() {
        List<UserEntity> allUsers = userService.findAllUsers();
        List<UserEntity> admins = allUsers.stream()
                .filter(user -> user.getRole() == Role.ADMIN)
                .collect(Collectors.toList());

        return ResponseEntity.ok(admins);
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        if (userService.deleteUser(id)) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }


    @PutMapping("/{id}")
    public ResponseEntity<UserEntity> updateUser(@PathVariable Long id, @RequestBody UserEntity updatedUser) {
        Optional<UserEntity> user = userService.updateUser(id, updatedUser);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/admin/set-role")
    public ResponseEntity<?> setUserRole(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Long userId,
            @RequestParam Role newRole) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        String adminEmail = jwtUtil.extractUsername(token);
        UserEntity adminUser = userService.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

        if (adminUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can change user roles.");
        }

        Optional<UserEntity> userOpt = userService.findById(userId);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found.");
        }

        UserEntity user = userOpt.get();
        user.setRole(newRole);
        userService.save(user); // Assumes save() persists the entity

        return ResponseEntity.ok("User role updated successfully.");
    }


    @PutMapping("/change-role")
    public ResponseEntity<?> changeUserRole(
            @RequestParam String email,
            @RequestParam Role newRole
    ) {
        Optional<UserEntity> userOptional = userService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        UserEntity user = userOptional.get();
        user.setRole(newRole);
        userService.save(user);

        return ResponseEntity.ok("User role updated to " + newRole.name());
    }



    @GetMapping("/active-users")
    public ResponseEntity<List<UserEntity>> getActiveUsers() {
        return ResponseEntity.ok(userService.getActiveUsers());
    }

    // Get inactive users
    @GetMapping("/inactive-users")
    public ResponseEntity<List<UserEntity>> getInactiveUsers() {
        List<UserEntity> inactiveUsers = userService.getInactiveUsers();
        return ResponseEntity.ok(inactiveUsers);
    }


    @PutMapping("/deactivate/{id}")
    public ResponseEntity<?> deactivateUser(@PathVariable Long id) {
        boolean success = userService.deactivateUser(id);
        if (success) {
            return ResponseEntity.ok("User deactivated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }

    @PutMapping("/reactivate/{id}")
    public ResponseEntity<?> reactivateUser(@PathVariable Long id) {
        boolean success = userService.reactivateUser(id);
        if (success) {
            return ResponseEntity.ok("User reactivated successfully");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
    }


    @GetMapping("/current-user")
    public ResponseEntity<UserEntity> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<UserEntity> userOptional = userService.findByEmail(email);
        if (userOptional.isPresent()) {
            UserEntity user = userOptional.get();

            // Only username, email, bio, role (and other public fields) will be returned because of @JsonIgnore on sensitive fields
            return ResponseEntity.ok(user);
        } else {
            return ResponseEntity.notFound().build();
        }
    }


    @PutMapping("/update")
    public ResponseEntity<UserEntity> updateUserDetails(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody UserEntity updatedUser) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token); // email is extracted from token
        UserEntity userEntity = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Optional<UserEntity> user = userService.updateUserById(userEntity.getId(), updatedUser);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/upload-profile-picture")
    public ResponseEntity<String> uploadProfilePicture(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile file) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().build();
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        UserEntity userEntity = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        try {
            String path = userService.uploadProfilePictureById(userEntity.getId(), file);
            return ResponseEntity.ok(path);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PatchMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody ChangePasswordRequest request) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.badRequest().body("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);

        Optional<UserEntity> userOptional = userService.findByEmail(email);
        if (userOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }

        UserEntity user = userOptional.get();

        // Compare old password
        if (!passwordEncoder.matches(request.oldPassword, user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Old password is incorrect");
        }

        // Update to new password
        user.setPassword(passwordEncoder.encode(request.newPassword));
        userService.save(user);

        return ResponseEntity.ok("Password changed successfully");
    }

    //----------------------------------------------------------------------------------------------------------------
    //REQUEST ADMIN ROLE

    @PostMapping("/request-admin-role")
    public ResponseEntity<?> requestAdminRole(@RequestHeader("Authorization") String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        String token = authHeader.substring(7);
        userService.requestAdminRole(token);
        return ResponseEntity.ok("Admin role request sent");
    }

    @PutMapping("/admin/handle-role-request")
    public ResponseEntity<?> handleRoleRequest(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam Long requestId,
            @RequestParam boolean approve) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        String adminEmail = jwtUtil.extractUsername(token);
        UserEntity adminUser = userService.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

        if (adminUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Only admins can perform this action.");
        }

        try {
            userService.handleRoleRequest(requestId, approve);
            return ResponseEntity.ok("Role request has been " + (approve ? "approved" : "rejected"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @GetMapping("/admin/role-requests")
    public ResponseEntity<List<RoleRequestResponse>> getAllRoleRequests(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        String token = authHeader.substring(7);
        String adminEmail = jwtUtil.extractUsername(token);
        UserEntity adminUser = userService.findByEmail(adminEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Admin not found"));

        if (adminUser.getRole() != Role.ADMIN) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Convert each RoleRequest to RoleRequestResponse
        List<RoleRequestResponse> responseList = userService.getAllRoleRequests().stream()
                .map(roleRequest -> {
                    RoleRequestResponse response = new RoleRequestResponse();
                    response.setRequestId(roleRequest.getId());
                    response.setStatus(roleRequest.getStatus());
                    response.setUsername(roleRequest.getUser().getUsername());
                    response.setEmail(roleRequest.getUser().getEmail());
                    response.setBio(roleRequest.getUser().getBio());
                    return response;
                })
                .toList();

        return ResponseEntity.ok(responseList);
    }




}




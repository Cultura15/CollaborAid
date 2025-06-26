package com.example.GoogleContacts_Cultura.service;


import com.example.GoogleContacts_Cultura.JWT.JwtUtil;
import com.example.GoogleContacts_Cultura.entity.RoleRequest;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.model.Role;
import com.example.GoogleContacts_Cultura.repository.RoleRequestRepo;
import com.example.GoogleContacts_Cultura.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    private final UserRepo userRepo;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;
    private final RoleRequestRepo roleRequestRepo;



    public UserService(UserRepo userRepo, PasswordEncoder passwordEncoder, NotificationService notificationService, JwtUtil jwtUtil, RoleRequestRepo roleRequestRepo) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
        this.roleRequestRepo = roleRequestRepo;
    }

    // Encrypt password before saving and send notification
    public UserEntity registerUser(UserEntity user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole(Role.USER);
        UserEntity savedUser = userRepo.save(user);

        // Send notification after user registration
        notificationService.sendNotification("New user registered: " + savedUser.getUsername(), "USER_REGISTERED");

        return savedUser;
    }

    public void save(UserEntity user) {
        userRepo.save(user);
    }


    public Optional<UserEntity> findByUsername(String username){
        return userRepo.findByUsername(username);
    }

    public Optional<UserEntity> findByEmail(String email){
        return userRepo.findByEmail(email);
    }


    public Optional<UserEntity> findById(Long id) {
        return userRepo.findById(id);
    }

    public List<UserEntity> findAllUsers() {
        return userRepo.findAll();
    }

    public boolean deleteUser(Long id) {
        if (userRepo.existsById(id)) {
            userRepo.deleteById(id);
            return true;
        }
        return false;
    }



    public Optional<UserEntity> updateUser(Long id, UserEntity updatedUser) {
        return userRepo.findById(id).map(user -> {

            if (updatedUser.getUsername() != null && !updatedUser.getUsername().isEmpty()) {
                user.setUsername(updatedUser.getUsername());
            }

            if (updatedUser.getEmail() != null && !updatedUser.getEmail().isEmpty()) {
                user.setEmail(updatedUser.getEmail());
            }

            if (updatedUser.getBio() != null) {
                user.setBio(updatedUser.getBio());
            }

            if (updatedUser.getProfilePicture() != null) {
                user.setProfilePicture(updatedUser.getProfilePicture());
            }

            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }

            return userRepo.save(user);
        });
    }


    public List<UserEntity> getActiveUsers() {
        return userRepo.findByStatus("ACTIVE");
    }

    // Fetch all inactive users
    public List<UserEntity> getInactiveUsers() {
        return userRepo.findByStatus("INACTIVE");
    }

    public boolean deactivateUser(Long id) {
        Optional<UserEntity> optionalUser = userRepo.findById(id);
        if (optionalUser.isPresent()) {
            UserEntity user = optionalUser.get();
            user.setStatus("INACTIVE");
            userRepo.save(user);
            return true;
        }
        return false;
    }

    public boolean reactivateUser(Long id) {
        return userRepo.findById(id).map(user -> {
            user.setStatus("ACTIVE");
            userRepo.save(user);
            return true;
        }).orElse(false);
    }

    public List<UserEntity> findAllAdmins() {
        return userRepo.findAllAdmins();
    }



    public Optional<UserEntity> updateUserById(Long id, UserEntity updatedUser) {
        return userRepo.findById(id).map(user -> {
            if (updatedUser.getUsername() != null) user.setUsername(updatedUser.getUsername());
            if (updatedUser.getEmail() != null) user.setEmail(updatedUser.getEmail());
            if (updatedUser.getBio() != null) user.setBio(updatedUser.getBio());
            if (updatedUser.getProfilePicture() != null) user.setProfilePicture(updatedUser.getProfilePicture());

            if (updatedUser.getPassword() != null && !updatedUser.getPassword().isEmpty()) {
                user.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
            }

            return userRepo.save(user);
        });
    }

    public String uploadProfilePictureById(Long id, MultipartFile file) throws IOException {
        Optional<UserEntity> optionalUser = userRepo.findById(id);
        if (!optionalUser.isPresent()) {
            throw new IOException("User not found");
        }

        if (file.isEmpty()) {
            throw new IOException("File is empty");
        }

        String uploadDir = "uploads/";
        Path uploadPath = Paths.get(uploadDir);
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);
        Files.write(filePath, file.getBytes());

        UserEntity user = optionalUser.get();
        user.setProfilePicture("/uploads/" + fileName);
        userRepo.save(user);

        return "/uploads/" + fileName;
    }

    //-----------------------------------------------------------------------------------------------------------------
    //REQUETS ADMIN ROLE

    public void requestAdminRole(String token) {
        String email = jwtUtil.extractUsername(token);
        UserEntity user = userRepo.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        RoleRequest request = new RoleRequest();
        request.setUser(user);
        roleRequestRepo.save(request);

        // Notify all admins
        String message = "User " + user.getEmail() + " has requested an ADMIN role.";
        notificationService.sendNotification(message, "ADMIN_REQUEST");
    }


    public void handleRoleRequest(Long requestId, boolean approve) {
        RoleRequest request = roleRequestRepo.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Role request not found"));

        if (!request.getStatus().equals("PENDING")) {
            throw new RuntimeException("Request is already handled.");
        }

        UserEntity user = request.getUser(); // the one who made the request

        if (approve) {
            user.setRole(Role.ADMIN);
            userRepo.save(user);
            notificationService.sendNotificationToUser(
                    "Your request to become an admin was approved.",
                    "ADMIN_REQUEST_RESULT",
                    user
            );
        } else {
            notificationService.sendNotificationToUser(
                    "Your request to become an admin was rejected.",
                    "ADMIN_REQUEST_RESULT",
                    user
            );
        }

        request.setStatus(approve ? "APPROVED" : "REJECTED");
        roleRequestRepo.save(request);
    }

    public List<RoleRequest> getAllRoleRequests() {
        return roleRequestRepo.findAll();
    }




}
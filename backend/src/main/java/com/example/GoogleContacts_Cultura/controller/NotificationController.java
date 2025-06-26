package com.example.GoogleContacts_Cultura.controller;

import com.example.GoogleContacts_Cultura.JWT.JwtUtil;
import com.example.GoogleContacts_Cultura.entity.NotificationEntity;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.service.NotificationService;
import com.example.GoogleContacts_Cultura.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;
    private final UserService userService;

    @Autowired
    public NotificationController(NotificationService notificationService, JwtUtil jwtUtil, UserService userService) {
        this.notificationService = notificationService;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    // Endpoint to manually send and store a notification (optional)
    @PostMapping
    public void createNotification(@RequestParam String message, @RequestParam String type) {
        notificationService.sendNotification(message, type);
    }

    // (Optional) Get all notifications from the database
    @GetMapping
    public List<NotificationEntity> getAllNotifications() {
        return notificationService.getAllNotifications();
    }

    // Clears all notifications from DB
    @DeleteMapping("/clear")
    public void clearNotifications() {
        notificationService.clearAllNotifications();
    }

    // Clear (delete) a notification by its ID
    @DeleteMapping("/clear/{id}")
    public void clearNotificationById(@PathVariable Long id) {
        notificationService.clearNotificationById(id);
    }


    // Marks all notifications as read
    @PutMapping("/mark-all-read")
    public void markAllAsRead() {
        notificationService.markAllAsRead();
    }

    @GetMapping("/user")
    public List<NotificationEntity> getNotificationsForUser(@RequestHeader("Authorization") String token) {
        // Remove "Bearer " prefix
        String jwt = token.substring(7);
        String email = jwtUtil.extractUsername(jwt);

        // Find the user
        UserEntity user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get notifications
        return notificationService.getNotificationsForUser(user.getId());
    }


}

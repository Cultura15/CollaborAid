package com.example.GoogleContacts_Cultura.service;

import com.example.GoogleContacts_Cultura.DTO.NotificationDTO;
import com.example.GoogleContacts_Cultura.entity.NotificationEntity;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.repository.NotificationRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepo notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Autowired
    public NotificationService(NotificationRepo notificationRepository, SimpMessagingTemplate messagingTemplate) {
        this.notificationRepository = notificationRepository;
        this.messagingTemplate = messagingTemplate;
    }

    public void sendNotification(String message, String type) {
        // Save to database
        NotificationEntity notification = new NotificationEntity();
        notification.setMessage(message);
        notification.setType(type);
        notification.setTimestamp(LocalDateTime.now());
        notificationRepository.save(notification);

        // Send over WebSocket
        NotificationDTO notificationDTO = new NotificationDTO(message, type, LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/notifications", notificationDTO);
    }
    public List<NotificationEntity> getAllNotifications() {
        return notificationRepository.findAll();
    }

    public void sendNotificationUser(String message, String type) {
        // Save to database
        NotificationEntity notification = new NotificationEntity();
        notification.setMessage(message);
        notification.setType(type);
        notification.setTimestamp(LocalDateTime.now());
        notificationRepository.save(notification);

        // Send over WebSocket
        NotificationDTO notificationDTO = new NotificationDTO(message, type, LocalDateTime.now());
        messagingTemplate.convertAndSend("/topic/notifications/user", notificationDTO);
    }

    public void sendNotificationToUser(String message, String type, UserEntity user) {
        // Save to DB
        NotificationEntity notification = new NotificationEntity();
        notification.setMessage(message);
        notification.setType(type);
        notification.setUser(user); // associate with the user
        notification.setTimestamp(LocalDateTime.now());
        notificationRepository.save(notification);

        // Send over WebSocket to user-specific destination
        NotificationDTO notificationDTO = new NotificationDTO(message, type, notification.getTimestamp());
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                notificationDTO
        );
    }


    public List<NotificationEntity> getNotificationsForUser(Long userId) {
        return notificationRepository.findByUserId(userId);
    }

    public void clearAllNotifications() {
        notificationRepository.deleteAll();
    }

    public void clearNotificationById(Long id) {
        notificationRepository.deleteById(id);
    }


    public void markAllAsRead() {
        List<NotificationEntity> notifications = notificationRepository.findAll();
        for (NotificationEntity notification : notifications) {
            notification.setRead(true); // You need to add this field if it doesn't exist
        }
        notificationRepository.saveAll(notifications);
    }


}

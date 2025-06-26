package com.example.GoogleContacts_Cultura.DTO;

import java.time.LocalDateTime;

public class NotificationDTO {
    private String message;
    private String type;
    private LocalDateTime timestamp;

    // Constructor
    public NotificationDTO(String message, String type, LocalDateTime timestamp) {
        this.message = message;
        this.type = type;
        this.timestamp = timestamp;
    }

    // Getters and Setters
    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
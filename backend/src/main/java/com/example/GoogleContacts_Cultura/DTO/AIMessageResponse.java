package com.example.GoogleContacts_Cultura.DTO;

import com.example.GoogleContacts_Cultura.entity.UserEntity;
import java.time.LocalDateTime;

public class AIMessageResponse {
    private UserEntity user;  // Store the full UserEntity
    private String userMessage;
    private String aiResponse;
    private LocalDateTime timestamp;

    public AIMessageResponse(UserEntity user, String userMessage, String aiResponse, LocalDateTime timestamp) {
        this.user = user;
        this.userMessage = userMessage;
        this.aiResponse = aiResponse;
        this.timestamp = timestamp;
    }

    public UserEntity getUser() {
        return user;
    }

    public String getUserMessage() {
        return userMessage;
    }

    public String getAiResponse() {
        return aiResponse;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }
}

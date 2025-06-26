package com.example.GoogleContacts_Cultura.DTO;

import com.example.GoogleContacts_Cultura.entity.UserEntity;

public class AIMessageRequest {

    private UserEntity user;  // Directly using UserEntity
    private String message;

    public AIMessageRequest() {}

    public AIMessageRequest(UserEntity user, String message) {
        this.user = user;
        this.message = message;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}

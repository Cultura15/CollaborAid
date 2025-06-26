package com.example.GoogleContacts_Cultura.DTO;

import com.example.GoogleContacts_Cultura.entity.MessageEntity;
import com.example.GoogleContacts_Cultura.entity.UserEntity;

import java.time.LocalDateTime;

public class MessageDTO {

    private Long messageId;
    private Long senderId;
    private String senderUsername;
    private String senderEmail;
    private String senderRole;

    private Long receiverId;
    private String receiverUsername;
    private String receiverEmail;
    private String receiverRole;

    private String content;
    private LocalDateTime timestamp;

    // Constructor for MessageDTO with UserEntity
    public MessageDTO(MessageEntity messageEntity, UserEntity sender, UserEntity receiver) {
        this.messageId = messageEntity.getMessageId();

        if (sender != null) {
            this.senderId = sender.getId();
            this.senderUsername = sender.getUsername();
            this.senderEmail = sender.getEmail();
            this.senderRole = sender.getRole() != null ? sender.getRole().toString() : "UNKNOWN";
        }

        if (receiver != null) {
            this.receiverId = receiver.getId();
            this.receiverUsername = receiver.getUsername();
            this.receiverEmail = receiver.getEmail();
            this.receiverRole = receiver.getRole() != null ? receiver.getRole().toString() : "UNKNOWN";
        }

        this.content = messageEntity.getContent();
        this.timestamp = messageEntity.getTimestamp();
    }

    // Getters and Setters
    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderUsername() {
        return senderUsername;
    }

    public void setSenderUsername(String senderUsername) {
        this.senderUsername = senderUsername;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getReceiverUsername() {
        return receiverUsername;
    }

    public void setReceiverUsername(String receiverUsername) {
        this.receiverUsername = receiverUsername;
    }

    public String getReceiverEmail() {
        return receiverEmail;
    }

    public void setReceiverEmail(String receiverEmail) {
        this.receiverEmail = receiverEmail;
    }

    public String getReceiverRole() {
        return receiverRole;
    }

    public void setReceiverRole(String receiverRole) {
        this.receiverRole = receiverRole;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "MessageDTO{" +
                "messageId=" + messageId +
                ", senderId=" + senderId +
                ", senderUsername='" + senderUsername + '\'' +
                ", senderEmail='" + senderEmail + '\'' +
                ", senderRole='" + senderRole + '\'' +
                ", receiverId=" + receiverId +
                ", receiverUsername='" + receiverUsername + '\'' +
                ", receiverEmail='" + receiverEmail + '\'' +
                ", receiverRole='" + receiverRole + '\'' +
                ", content='" + content + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}

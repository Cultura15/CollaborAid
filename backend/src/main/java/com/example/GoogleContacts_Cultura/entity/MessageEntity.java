package com.example.GoogleContacts_Cultura.entity;

import com.example.GoogleContacts_Cultura.model.Role;
import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "messages")
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    private Long messageId;

    @ManyToOne
    @JoinColumn(name = "sender_id", referencedColumnName = "user_id")
    private UserEntity sender;

    @ManyToOne
    @JoinColumn(name = "receiver_id", referencedColumnName = "user_id")
    private UserEntity receiver;

    @Column(name = "content")
    private String content;

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    // Default constructor
    public MessageEntity() {}

    // Constructor for creating a new message with dynamic UserEntity resolution
    public MessageEntity(UserEntity sender, UserEntity receiver, String content, LocalDateTime timestamp) {
        this.sender = sender;
        this.receiver = receiver;
        this.content = content;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();  // Default to current time
    }

    // Getter and Setter methods
    public Long getMessageId() {
        return messageId;
    }

    public void setMessageId(Long messageId) {
        this.messageId = messageId;
    }

    public UserEntity getSender() {
        return sender;
    }

    public void setSender(UserEntity sender) {
        this.sender = sender;
    }

    public UserEntity getReceiver() {
        return receiver;
    }

    public void setReceiver(UserEntity receiver) {
        this.receiver = receiver;
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

    // Check if the sender is a USER
    public boolean isSenderUser() {
        return sender.getRole() == Role.USER;
    }

    // Check if the receiver is a USER
    public boolean isReceiverUser() {
        return receiver.getRole() == Role.USER;
    }

    // Check if the sender is an ADMIN
    public boolean isSenderAdmin() {
        return sender.getRole() == Role.ADMIN;
    }

    // Check if the receiver is an ADMIN
    public boolean isReceiverAdmin() {
        return receiver.getRole() == Role.ADMIN;
    }

    @Override
    public String toString() {
        return "MessageEntity{" +
                "messageId=" + messageId +
                ", sender=" + (sender != null ? sender.getUsername() : "null") +
                ", receiver=" + (receiver != null ? receiver.getUsername() : "null") +
                ", content='" + content + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}

package com.example.GoogleContacts_Cultura.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class RoleRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @Column(nullable = false)
    private String status = "PENDING"; // "PENDING", "APPROVED", "REJECTED"

    @Column
    private LocalDateTime requestedAt = LocalDateTime.now();

    @ManyToOne
    @JoinColumn(name = "handled_by_admin_id")
    private UserEntity handledBy; // optional: to store the admin who reviewed it

    @Column
    private LocalDateTime handledAt;

    public RoleRequest() {}


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public void setRequestedAt(LocalDateTime requestedAt) {
        this.requestedAt = requestedAt;
    }

    public UserEntity getHandledBy() {
        return handledBy;
    }

    public void setHandledBy(UserEntity handledBy) {
        this.handledBy = handledBy;
    }

    public LocalDateTime getHandledAt() {
        return handledAt;
    }

    public void setHandledAt(LocalDateTime handledAt) {
        this.handledAt = handledAt;
    }
}
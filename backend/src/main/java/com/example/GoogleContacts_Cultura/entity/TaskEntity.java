package com.example.GoogleContacts_Cultura.entity;


import com.example.GoogleContacts_Cultura.model.Category;
import jakarta.persistence.*;
import jakarta.annotation.Nullable;
import java.time.LocalDateTime;


@Entity
@Table(name = "tbl_task")
public class TaskEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "task_id", nullable = false)

    private Long id;
    private String title;
    private String description;
    private String status;
    private Long markedDoneBy;

    @Enumerated(EnumType.STRING)
    @Column(length = 25)
    private Category category;

    @Nullable
    @Column
    private String imageUrl;


    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "accepted_by", nullable = true)
    private UserEntity acceptedBy;

    @Column(name = "active_status")
    private String activeStatus = "ACTIVE";

    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    public TaskEntity() {
        this.timestamp = LocalDateTime.now();
    }

    public TaskEntity(Long id, String title, String description, String status, UserEntity user, UserEntity acceptedBy, String activeStatus, String imageUrl ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.status = status;
        this.user = user;
        this.acceptedBy = acceptedBy;
        this.activeStatus  = activeStatus ;
        this.timestamp = LocalDateTime.now();
        this.imageUrl = imageUrl;
    }

    public boolean isPendingVerification() {
        return "Pending Verification".equals(this.status);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public UserEntity getAcceptedBy() {
        return acceptedBy;
    }

    public void setAcceptedBy(UserEntity acceptedBy) {
        this.acceptedBy = acceptedBy;
    }

    public Long getMarkedDoneBy() {
        return markedDoneBy;
    }

    public void setMarkedDoneBy(Long markedDoneBy) {
        this.markedDoneBy = markedDoneBy;
    }

    public void setActiveStatus(String activeStatus) {
        this.activeStatus = activeStatus;
    }

    public String getActiveStatus() {
        return activeStatus;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Category getCategory() {
        return category;
    }

    public void setCategory(Category category) {
        this.category = category;
    }


}

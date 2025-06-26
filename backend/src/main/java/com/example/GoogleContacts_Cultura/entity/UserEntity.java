package com.example.GoogleContacts_Cultura.entity;


import com.example.GoogleContacts_Cultura.model.Role;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;


import java.util.List;


@Entity
@Table(name = "userss")

public class UserEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id", nullable = false)
    private Long id;

    private String username;
    private String email;

    private String password;

    @Column(length = 200)
    private String bio;

    @Column
    private String profilePicture;

    @Enumerated(EnumType.STRING)
    private Role role;

    @Column(name = "status")
    private String status = "ACTIVE"; // default value


    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<TaskEntity> tasks;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore
    private List<AIMessageEntity> aiMessages;


    public UserEntity() {}


    public UserEntity(Long id, String username, String password, String email, Role role, String status, String bio, String profilePicture) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.email = email;
        this.role = role;
        this.status = status;
        this.bio = bio;
        this.profilePicture = profilePicture;

    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public List<TaskEntity> getTasks() {
        return tasks;
    }

    public void setTasks(List<TaskEntity> tasks) {
        this.tasks = tasks;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }
}



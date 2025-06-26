package com.example.GoogleContacts_Cultura.repository;

import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepo extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByUsername(String username);
    List<UserEntity> findByStatus(String status);
    Optional<UserEntity> findByEmail(String email);
    List<UserEntity> findByRole(Role role);

    @Query("SELECT u FROM UserEntity u WHERE u.role = 'ADMIN'")
    List<UserEntity> findAllAdmins();


}

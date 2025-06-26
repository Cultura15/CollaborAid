package com.example.GoogleContacts_Cultura.repository;

import com.example.GoogleContacts_Cultura.entity.RoleRequest;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoleRequestRepo extends JpaRepository<RoleRequest, Long> {

    boolean existsByUserAndStatus(UserEntity user, String status);

    List<RoleRequest> findByStatus(String status);

    // (Optional) To retrieve requests by a specific user
    List<RoleRequest> findByUser(UserEntity user);
}

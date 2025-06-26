package com.example.GoogleContacts_Cultura.repository;

import com.example.GoogleContacts_Cultura.entity.AIMessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AIMessageRepo extends JpaRepository<AIMessageEntity, Long> {
    // You can add custom queries here if needed in the future
}

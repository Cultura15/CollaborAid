package com.example.GoogleContacts_Cultura.repository;


import com.example.GoogleContacts_Cultura.entity.NotificationEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepo extends JpaRepository<NotificationEntity, Long> {
    List<NotificationEntity> findByUserId(Long userId);

}

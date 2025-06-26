package com.example.GoogleContacts_Cultura.repository;

import com.example.GoogleContacts_Cultura.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MessageRepo extends JpaRepository<MessageEntity, Long> {

    List<MessageEntity> findBySenderId(Long senderId);
    List<MessageEntity> findByReceiverId(Long receiverId);
    List<MessageEntity> findBySenderIdAndReceiverId(Long senderId, Long receiverId);


    // Custom query to fetch messages between users (USER -> USER)
    @Query("SELECT m FROM MessageEntity m WHERE (m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.sender.role = 'USER' AND m.receiver.role = 'USER') " +
            "OR (m.sender.id = :receiverId AND m.receiver.id = :senderId AND m.sender.role = 'USER' AND m.receiver.role = 'USER') " +
            "ORDER BY m.timestamp ASC")
    List<MessageEntity> findMessagesBetweenUsers(
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId
    );

    // Custom query for messages from USER to ADMIN
    @Query("SELECT m FROM MessageEntity m WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.sender.role = 'USER' AND m.receiver.role = 'ADMIN' ORDER BY m.timestamp ASC")
    List<MessageEntity> findMessagesFromUserToAdmin(
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId
    );

    // Custom query for messages from ADMIN to USER
    @Query("SELECT m FROM MessageEntity m WHERE m.sender.id = :senderId AND m.receiver.id = :receiverId AND m.sender.role = 'ADMIN' AND m.receiver.role = 'USER' ORDER BY m.timestamp ASC")
    List<MessageEntity> findMessagesFromAdminToUser(
            @Param("senderId") Long senderId,
            @Param("receiverId") Long receiverId
    );

    @Query("SELECT m FROM MessageEntity m WHERE " +
            "(m.sender.id = :adminId AND m.receiver.id = :userId) OR " +
            "(m.sender.id = :userId AND m.receiver.id = :adminId) " +
            "ORDER BY m.timestamp ASC")
    List<MessageEntity> findFullConversation(@Param("adminId") Long adminId, @Param("userId") Long userId);

}
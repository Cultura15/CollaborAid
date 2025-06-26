package com.example.GoogleContacts_Cultura.service;

import com.example.GoogleContacts_Cultura.DTO.MessageInputDTO;
import com.example.GoogleContacts_Cultura.entity.MessageEntity;
import com.example.GoogleContacts_Cultura.DTO.MessageDTO;
import com.example.GoogleContacts_Cultura.repository.MessageRepo;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.entity.MessageEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final MessageRepo repository;
    private final UserService userService;

    public MessageService(MessageRepo repository, UserService userService) {
        this.repository = repository;
        this.userService = userService;
    }

    // Send message method
    public MessageDTO sendMessage(Long senderId, Long receiverId, String content) {
        // Fetch sender and receiver UserEntity objects by ID
        UserEntity sender = userService.findById(senderId).orElseThrow(() -> new RuntimeException("Sender not found"));
        UserEntity receiver = userService.findById(receiverId).orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Create and save the message using the user IDs, not the full UserEntity objects
        MessageEntity message = new MessageEntity(sender, receiver, content, LocalDateTime.now());
        MessageEntity savedMessage = repository.save(message);

        // Return MessageDTO with sender and receiver UserEntity objects
        return new MessageDTO(savedMessage, sender, receiver);
    }

    // Get all messages
    public List<MessageDTO> getAllMessages() {
        List<MessageEntity> messages = repository.findAll();
        return messages.stream()
                .map(messageEntity -> {
                    UserEntity sender = userService.findById(messageEntity.getSender().getId()).orElseThrow(() -> new RuntimeException("Sender not found"));
                    UserEntity receiver = userService.findById(messageEntity.getReceiver().getId()).orElseThrow(() -> new RuntimeException("Receiver not found"));
                    return new MessageDTO(messageEntity, sender, receiver);
                })
                .collect(Collectors.toList());
    }



    //----------------------------------------------------------------------------------------------------------------------------------

    public List<MessageDTO> getMessagesSentByUser(Long senderId) {
        List<MessageEntity> messages = repository.findBySenderId(senderId);
        return messages.stream().map(this::convertToDTO).toList();
    }

    public List<MessageDTO> getMessagesReceivedByUser(Long receiverId) {
        List<MessageEntity> messages = repository.findByReceiverId(receiverId);
        return messages.stream().map(this::convertToDTO).toList();
    }

    public List<MessageDTO> getMessagesBetweenUsersWithToken(Long senderId, Long receiverId) {
        // Fetch messages sent by the sender to the receiver
        List<MessageEntity> messages = repository.findBySenderIdAndReceiverId(senderId, receiverId);
        // Fetch messages sent by the receiver to the sender (reverse)
        messages.addAll(repository.findBySenderIdAndReceiverId(receiverId, senderId));
        return messages.stream().map(this::convertToDTO).toList();
    }

    public MessageDTO sendMessageWithToken(Long senderId, MessageInputDTO requestDTO) {
        // Fetch the sender UserEntity from the database
        UserEntity sender = userService.findById(senderId)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Fetch the receiver UserEntity using the receiverId from the input DTO
        UserEntity receiver = userService.findById(requestDTO.getReceiverId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        // Create a new message entity
        MessageEntity messageEntity = new MessageEntity();
        messageEntity.setSender(sender);
        messageEntity.setReceiver(receiver);
        messageEntity.setContent(requestDTO.getContent());
        messageEntity.setTimestamp(LocalDateTime.now());

        // Save the message to the database
        MessageEntity savedMessage = repository.save(messageEntity);

        // Return the saved message as a DTO
        return convertToDTO(savedMessage);
    }





    private MessageDTO convertToDTO(MessageEntity message) {
        UserEntity sender = message.getSender();
        UserEntity receiver = message.getReceiver();
        return new MessageDTO(message, sender, receiver);
    }

    //----------------------------------------------------------------------------------------------------------------------------------


    // Get a specific message by ID
    public MessageDTO getMessageById(Long messageId) {
        MessageEntity messageEntity = repository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        UserEntity sender = userService.findById(messageEntity.getSender().getId())
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        UserEntity receiver = userService.findById(messageEntity.getReceiver().getId())
                .orElseThrow(() -> new RuntimeException("Receiver not found"));
        return new MessageDTO(messageEntity, sender, receiver);
    }

    // Delete a message by ID
    public void deleteMessage(Long messageId) {
        repository.deleteById(messageId);
    }

    // Get messages between two users
    public List<MessageDTO> getMessagesBetweenUsers(Long senderId, Long receiverId) {
        List<MessageEntity> messages = repository.findMessagesBetweenUsers(senderId, receiverId);
        return mapToMessageDTO(messages);
    }

    // Get messages between user and admin (USER -> ADMIN)
    public List<MessageDTO> getMessagesFromUserToAdmin(Long userId, Long adminId) {
        List<MessageEntity> messages = repository.findMessagesFromUserToAdmin(userId, adminId);
        return mapToMessageDTO(messages);
    }

    // Get messages between admin and user (ADMIN -> USER)
    public List<MessageDTO> getMessagesFromAdminToUser(Long adminId, Long userId) {
        List<MessageEntity> messages = repository.findMessagesFromAdminToUser(adminId, userId);
        return mapToMessageDTO(messages);
    }

    public List<MessageDTO> getFullConversationBetween(Long adminId, Long userId) {
        List<MessageEntity> allMessages = repository.findFullConversation(adminId, userId);
        return mapToMessageDTO(allMessages);
    }


    // Helper method to map MessageEntity to MessageDTO
    private List<MessageDTO> mapToMessageDTO(List<MessageEntity> messages) {
        return messages.stream()
                .map(messageEntity -> {
                    UserEntity sender = userService.findById(messageEntity.getSender().getId()).orElseThrow(() -> new RuntimeException("Sender not found"));
                    UserEntity receiver = userService.findById(messageEntity.getReceiver().getId()).orElseThrow(() -> new RuntimeException("Receiver not found"));
                    return new MessageDTO(messageEntity, sender, receiver);
                })
                .collect(Collectors.toList());
    }
}

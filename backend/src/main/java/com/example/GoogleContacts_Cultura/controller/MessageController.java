package com.example.GoogleContacts_Cultura.controller;

import com.example.GoogleContacts_Cultura.DTO.MessageDTO;
import com.example.GoogleContacts_Cultura.DTO.MessageInputDTO;
import com.example.GoogleContacts_Cultura.JWT.JwtUtil;
import com.example.GoogleContacts_Cultura.entity.MessageEntity;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.repository.MessageRepo;
import com.example.GoogleContacts_Cultura.service.MessageService;
import com.example.GoogleContacts_Cultura.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    private final MessageService messageService;
    private final SimpMessagingTemplate messagingTemplate;
    private final JwtUtil jwtUtil;
    private final UserService userService;
    private final MessageRepo messageRepository;

    @Autowired
    public MessageController(MessageService messageService, SimpMessagingTemplate messagingTemplate, JwtUtil jwtUtil, UserService userService, MessageRepo messageRepository) {
        this.messageService = messageService;
        this.messagingTemplate = messagingTemplate;
        this.jwtUtil = jwtUtil;
        this.userService = userService;
        this.messageRepository = messageRepository;

    }

    // Send a message
    @PostMapping("/send")
    public MessageDTO sendMessage(@RequestBody MessageEntity message) {
        return messageService.sendMessage(
                message.getSender().getId(),
                message.getReceiver().getId(),
                message.getContent()
        );
    }

    //----------------------------------------------------------------------------------------------------------------------------------
    @GetMapping("/sent")
    public List<MessageDTO> getMessagesSentByAuthenticatedUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        UserEntity user = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return messageService.getMessagesSentByUser(user.getId());
    }

    @GetMapping("/received")
    public List<MessageDTO> getMessagesReceivedByAuthenticatedUser(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        UserEntity receiver = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<MessageEntity> receivedMessages = messageRepository.findByReceiverId(receiver.getId());

        return receivedMessages.stream()
                .map(message -> new MessageDTO(message, message.getSender(), receiver))
                .collect(Collectors.toList());
    }



    @GetMapping("/conversation/user-authenticated/{receiverId}")
    public List<MessageDTO> getConversationWithReceiver(
            @PathVariable Long receiverId,
            HttpServletRequest request
    ) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7);
        String email = jwtUtil.extractUsername(token);
        UserEntity sender = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Fetch the messages between the authenticated sender and the receiver
        return messageService.getMessagesBetweenUsersWithToken(sender.getId(), receiverId);
    }

    // WebSocket handler for real-time messaging
    @MessageMapping("/sendMessage")
    public void handleMessage(MessageEntity messageEntity) {
        // Process and save the message via the service
        MessageDTO dto = messageService.sendMessage(
                messageEntity.getSender().getId(),
                messageEntity.getReceiver().getId(),
                messageEntity.getContent()
        );

        // Log sending actions
        System.out.println("Sending message to receiver: " + messageEntity.getReceiver().getId());
        messagingTemplate.convertAndSend(
                "/topic/messages/" + messageEntity.getReceiver().getId(),
                dto
        );

        // Optionally send the message to the sender's topic as well
        System.out.println("Sending message to sender: " + messageEntity.getSender().getId());
        messagingTemplate.convertAndSend(
                "/topic/messages/" + messageEntity.getSender().getId(),
                dto
        );
    }

    //----------------------------------------------------------------------------------------------------------------------------------



    @PostMapping("/send-authenticated")
    public MessageDTO sendMessageAsAuthenticatedUser(
            @RequestBody MessageInputDTO messageInputDTO,
            HttpServletRequest request
    ) {
        // Extract token from request
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Missing or invalid Authorization header");
        }

        String token = authHeader.substring(7); // Extract token
        String email = jwtUtil.extractUsername(token);
        UserEntity sender = userService.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        // Pass the senderId and messageInputDTO to the service
        return messageService.sendMessageWithToken(sender.getId(), messageInputDTO);
    }



    // Get all messages
    @GetMapping("/all")
    public List<MessageDTO> getAllMessages() {
        return messageService.getAllMessages();
    }

    // Get a message by ID
    @GetMapping("/{id}")
    public MessageDTO getMessageById(@PathVariable Long id) {
        return messageService.getMessageById(id);
    }

    // Delete a message
    @DeleteMapping("/delete/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageService.deleteMessage(id);
    }

    // Get messages between two users
    @GetMapping("/conversation/user/{senderId}/{receiverId}")
    public List<MessageDTO> getMessagesBetweenUsers(@PathVariable Long senderId, @PathVariable Long receiverId) {
        return messageService.getMessagesBetweenUsers(senderId, receiverId);
    }

    // Get messages between user and admin (USER -> ADMIN)
    @GetMapping("/conversation/user-to-admin/{userId}/{adminId}")
    public List<MessageDTO> getMessagesFromUserToAdmin(@PathVariable Long userId, @PathVariable Long adminId) {
        return messageService.getMessagesFromUserToAdmin(userId, adminId);
    }

    // Get messages between admin and user (ADMIN -> USER)
    @GetMapping("/conversation/admin-to-user/{adminId}/{userId}")
    public List<MessageDTO> getMessagesFromAdminToUser(@PathVariable Long adminId, @PathVariable Long userId) {
        return messageService.getMessagesFromAdminToUser(adminId, userId);
    }

    // Get full conversation between admin and user
    @GetMapping("/conversation/{adminId}/{userId}")
    public List<MessageDTO> getFullConversation(@PathVariable Long adminId, @PathVariable Long userId) {
        return messageService.getFullConversationBetween(adminId, userId);
    }



}

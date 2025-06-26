package com.example.GoogleContacts_Cultura.controller;

import com.example.GoogleContacts_Cultura.DTO.AIMessageRequest;
import com.example.GoogleContacts_Cultura.DTO.AIMessageResponse;
import com.example.GoogleContacts_Cultura.service.OpenAIService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/livechat")
public class LiveChatController {

    private static final Logger logger = LoggerFactory.getLogger(LiveChatController.class);
    private final OpenAIService openAIService;  // Service for calling OpenAI API

    public LiveChatController(OpenAIService openAIService) {
        this.openAIService = openAIService;
    }

    @PostMapping("/ask-ai")
    public Mono<ResponseEntity<AIMessageResponse>> askAI(@RequestBody AIMessageRequest request) {
        // Access user details from the request
        Long userId = request.getUser().getId();  // Get user ID
        String username = request.getUser().getUsername();  // Get username
        String userMessage = request.getMessage();  // Get the user's message

        logger.info("Received AI chat request from user: {} (ID: {})", username, userId);

        // Call OpenAI service to get a response based on user message
        return openAIService.getAIResponse(userMessage, username)
                .map(aiResponse -> ResponseEntity.ok(new AIMessageResponse(
                        request.getUser(),  // Pass the full UserEntity in the response
                        userMessage,
                        aiResponse,
                        LocalDateTime.now()
                )))
                .doOnError(error -> logger.error("Error fetching AI response", error))
                .onErrorResume(error -> Mono.just(ResponseEntity.internalServerError()
                        .body(new AIMessageResponse(
                                request.getUser(),
                                userMessage,
                                "An error occurred while processing your request. Please try again.",
                                LocalDateTime.now()
                        ))));
    }

    @PostMapping("/ask-ai/public")
    public Mono<ResponseEntity<AIMessageResponse>> askAIPublic(@RequestBody AIMessageRequest request) {
        String userMessage = request.getMessage();

        logger.info("Received PUBLIC AI request: {}", userMessage);

        return openAIService.getPublicAIResponse(userMessage)
                .map(aiResponse -> ResponseEntity.ok(new AIMessageResponse(
                        null, // No user info
                        userMessage,
                        aiResponse,
                        LocalDateTime.now()
                )))
                .onErrorResume(error -> Mono.just(ResponseEntity.internalServerError()
                        .body(new AIMessageResponse(
                                null,
                                userMessage,
                                "An error occurred while processing your request. Please try again later.",
                                LocalDateTime.now()
                        ))));
    }
}

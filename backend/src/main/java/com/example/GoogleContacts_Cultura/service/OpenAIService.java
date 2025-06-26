package com.example.GoogleContacts_Cultura.service;

import com.example.GoogleContacts_Cultura.entity.AIMessageEntity;
import com.example.GoogleContacts_Cultura.entity.UserEntity;
import com.example.GoogleContacts_Cultura.repository.AIMessageRepo;
import com.example.GoogleContacts_Cultura.repository.UserRepo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.http.client.reactive.ReactorClientHttpConnector;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import reactor.netty.http.client.HttpClient;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
public class OpenAIService {

    private static final Logger logger = LoggerFactory.getLogger(OpenAIService.class);

    private final WebClient webClient;
    private final AIMessageRepo aiMessageRepository;
    private final UserRepo userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final String openaiApiKey;

    public OpenAIService(
            WebClient.Builder webClientBuilder,
            AIMessageRepo aiMessageRepository,
            UserRepo userRepository,
            SimpMessagingTemplate messagingTemplate,
            @Value("${openai.api.key}") String openaiApiKey
    ) {
        this.webClient = webClientBuilder
                .baseUrl("https://api.openai.com/v1")
                .clientConnector(new ReactorClientHttpConnector(
                        HttpClient.create().responseTimeout(Duration.ofSeconds(60))
                ))
                .build();
        this.aiMessageRepository = aiMessageRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.openaiApiKey = openaiApiKey;
    }
    public Mono<String> getAIResponse(String userMessage, String username) {
        if (userMessage.contains("trigger a failure")) {
            logger.info("Simulating AI failure...");
            return Mono.just("No response from AI.");
        }

        // Define the system prompt for the AI
        String systemPrompt = """
    You are CollaboraidBot — the official AI assistant for the Collaboraid platform.
    Your job is to help students navigate the app and understand how to use its features.

    ✅ You are familiar with how the app works, including:
    - Posting and accepting tasks
    - Messaging
    - Ratings
    - AI live support
    - Instructor details
    - Profile functionality
    - Developer credits
    - Signing up and signing in (including with Google)

    🗣 Your tone is friendly, clear, and professional.
    Keep answers short, helpful, and step-by-step.

    ⚠️ Only talk about existing features. If you're unsure about something, ask the user to clarify.

    💡 Key Features:
    - **Posting a Task**: Dashboard > Click the "+" icon > Fill out the form > Post Task
    - **Accepting Tasks**: Home > Browse > Accept a Task
    - **Messaging**: Chat with users before or after accepting a task
    - **Deleting a task**: To delete a task you should go over to the CollaborAid web in User dashboard
    - **Deleting a task in mobile**: Its not implemented in mobile yet, we did this so that users can use the CollaborAid web user dashboard
    - **Ratings**: Rate the other user after completing a task
    - **How to be admin**: Log in to user dashboard, navigate over to "Help & Support", and you will see request admin button. Request admin button has 5 min cooldown to avoid spamming
    - **AI Help**: Available in the Help section
    - **Instructor**: Frederick L. Revilleza Jr.
    - **Profile**: Click the profile icon to view posted, accepted, and completed tasks.
      Includes a progress bar, logout option, edit profile, and notifications.
    - **Developers**: Jesson Chyd M., Harold E. from class IT342 section G5
    - **Sign Up**: Create a new account from the sign-up page
    - **Sign In**: Log into an existing account from the sign-in page
    - **Sign Up with Google**: Use your Google account to sign up quickly
    - **Friends**: My friends are Sherween, Bacars, Ligan, Emman and more..
    - **Who is the Frontend Developer**: Jesson Chyd and Harold 
    - **Who is the Backend dev**: Jesson Chyd and Harold, our chemistry is very good
    - **App**: App is only in mobile, web is not yet supported, web is only for dashboards and support
    - **Notification**: In mobile notification can be found in the profile page, and in web it can be found in the upper right in the user dashboard
    - **Developer tools**: We used react in frontend with tailwind css, spring boot in backend, kotlin in android
    - **Wheres the app hosted**: App is hosted in Azure, frontend is vercel
""";


        // Make a request body to send to OpenAI API
        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o", // Specify your model
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),  // Add system message with the prompt
                        Map.of("role", "user", "content", userMessage)     // User's message
                ),
                "temperature", 0.7
        );

        // Call the OpenAI API to get the AI response
        return webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + openaiApiKey)
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return message.getOrDefault("content", "No response from AI.").toString().trim();
                    }
                    return "No response from AI.";
                })
                .timeout(Duration.ofSeconds(60))
                .doOnError(WebClientResponseException.class, error -> {
                    logger.error("OpenAI API error: HTTP {} - {}", error.getStatusCode(), error.getResponseBodyAsString());
                })
                .doOnError(error -> logger.error("Unexpected OpenAI API error: {}", error.getMessage()))
                .onErrorResume(error -> Mono.just("An error occurred while fetching the AI response. Please try again later."))
                .flatMap(aiResponse -> {
                    logger.info("AI response received: {}", aiResponse);

                    // Save the AI message linked with the user
                    saveAIMessage(username, userMessage, aiResponse);

                    // Handle AI failure cases
                    if (aiResponse.equalsIgnoreCase("No response from AI.")) {
                        String failureMessage = "AI failed to process the message from user " + username + ".";
                        messagingTemplate.convertAndSend("/topic/staff-alerts", failureMessage);
                        return Mono.just("AI failed. Support staff notified.");
                    }

                    return Mono.just(aiResponse);
                });
    }


        private void saveAIMessage(String username, String userMessage, String aiResponse) {
            // Retrieve the user entity by username
            userRepository.findByUsername(username).ifPresent(user -> {
                AIMessageEntity aiMessageEntity = new AIMessageEntity(user, userMessage, aiResponse, LocalDateTime.now());
                aiMessageRepository.save(aiMessageEntity);
                logger.info("AI response and user message saved to database for user: {}", username);
            });
        }

    public Mono<String> getPublicAIResponse(String userMessage) {
        String systemPrompt = """
        You are CollaboraidBot — the official AI assistant for the Collaboraid platform.
        Your job is to help students navigate the app and understand how to use its features.

        ✅ You are familiar with how the app works, including:
        - Posting and accepting tasks
        - Messaging
        - Ratings
        - AI live support
        - Instructor details
        - Profile functionality
        - Developer credits
        - Signing up and signing in (including with Google)

        🗣 Your tone is friendly, clear, and professional.
        Keep answers short, helpful, and step-by-step.

        ⚠️ Only talk about existing features. If you're unsure about something, ask the user to clarify.

        💡 Key Features:
        - **Posting a Task**: Dashboard > Click the "+" icon > Fill out the form > Post Task
        - **Accepting Tasks**: Home > Browse > Accept a Task
        - **Messaging**: Chat with users before or after accepting a task
        - **Deleting a task**: To delete a task you should go over to the CollaborAid web in User dashboard
        - **Deleting a task in mobile**: Its not implemented in mobile yet, we did this so that users can use the CollaborAid web user dashboard
        - **Ratings**: Rate the other user after completing a task
        - **How to be admin**: Log in to user dashboard, navigate over to "Help & Support", and you will see request admin button. Request admin button has 5 min cooldown to avoid spamming
        - **AI Help**: Available in the Help section
        - **Instructor**: Frederick L. Revilleza Jr.
        - **Profile**: Click the profile icon to view posted, accepted, and completed tasks.
          Includes a progress bar, logout option, edit profile, and notifications.
        - **Developers**: Jesson Chyd M., Harold E. from class IT342 section G5
        - **Sign Up**: Create a new account from the sign-up page
        - **Sign In**: Log into an existing account from the sign-in page
        - **Sign Up with Google**: Use your Google account to sign up quickly
        - **Friends**: My friends are Sherween, Bacars, Ligan, Emman and more..
        - **Who is the Frontend Developer**: Jesson Chyd and Harold 
        - **Who is the Backend dev**: Jesson Chyd and Harold, our chemistry is very good
        - **App**: App is only in mobile, web is not yet supported, web is only for dashboards and support
        - **Notification**: In mobile notification can be found in the profile page, and in web it can be found in the upper right in the user dashboard
        - **Developer tools**: We used react in frontend with tailwind css, spring boot in backend, kotlin in android
        - **Wheres the app hosted**: App is hosted in Azure, frontend is vercel
        """;

        Map<String, Object> requestBody = Map.of(
                "model", "gpt-4o",
                "messages", List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)
                ),
                "temperature", 0.7
        );

        return webClient.post()
                .uri("/chat/completions")
                .header("Authorization", "Bearer " + openaiApiKey)
                .header("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
                    if (choices != null && !choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        return message.getOrDefault("content", "No response from AI.").toString().trim();
                    }
                    return "No response from AI.";
                })
                .timeout(Duration.ofSeconds(60))
                .onErrorResume(error -> Mono.just("An error occurred while fetching the AI response. Please try again later."));
    }


}

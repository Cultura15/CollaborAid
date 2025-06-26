package com.example.collaboraid.api

import com.example.collaboraid.model.AIMessage
import kotlinx.serialization.Serializable
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST

interface AIService {
    @POST("livechat/ask-ai/public")
    suspend fun askAI(@Body request: AIMessageRequest): Response<AIMessage>
}

@Serializable
data class AIMessageRequest(
    val user: User,
    val message: String
)

@Serializable
data class User(
    val id: Long,
    val username: String? = null
)

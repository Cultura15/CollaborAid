package com.example.collaboraid.api

import com.example.collaboraid.model.Message
import com.example.collaboraid.model.MessageInput
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path

interface MessageService {

    // Updated to match the backend endpoint
    @GET("messages/conversation/user-authenticated/{receiverId}")
    suspend fun getConversation(
        @Path("receiverId") receiverId: Long
    ): Response<List<Message>>

    @GET("messages/sent")
    suspend fun getSentMessages(): Response<List<Message>>

    @GET("messages/received")
    suspend fun getReceivedMessages(): Response<List<Message>>
}

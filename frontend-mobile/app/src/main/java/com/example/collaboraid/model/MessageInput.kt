package com.example.collaboraid.model

import kotlinx.serialization.Serializable

@Serializable
data class MessageInput(
    val receiverId: Long,
    val content: String
)

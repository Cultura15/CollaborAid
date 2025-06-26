package com.example.collaboraid.model

import kotlinx.serialization.Serializable

@Serializable
data class Message(
    val id: Long? = null,
    val tempId: String? = null,  // Temporary ID for tracking message status
    val messageId: Long? = null,
    // Sender fields
    val senderId: Long? = null,
    val senderUsername: String? = null,
    val senderEmail: String? = null,
    val senderRole: String? = null,
    // Receiver fields
    val receiverId: Long? = null,
    val receiverUsername: String? = null,
    val receiverEmail: String? = null,
    val receiverRole: String? = null,
    // Message content
    val content: String = "",
    val timestamp: String = "",
    val read: Boolean? = false,

    // For backward compatibility - these will be null from API
    val sender: User? = null,
    val receiver: User? = null,
    val sendStatus: String? = null  // SENDING, SENT, DELIVERED, READ, FAILED
)

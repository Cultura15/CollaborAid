package com.example.collaboraid.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class AIMessage(
    val id: Long? = null,

    @SerialName("user")
    val user: User? = null,

    @SerialName("userMessage")
    val userMessage: String = "",

    @SerialName("aiResponse")
    val aiResponse: String = "",

    @SerialName("timestamp")
    val timestamp: String = ""
) {
    @Serializable
    data class User(
        val id: Long? = null,
        val username: String? = null
    )
}

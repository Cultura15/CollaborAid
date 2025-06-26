package com.example.collaboraid.model

import kotlinx.serialization.Serializable

@Serializable
data class Task(
    val id: Long? = null,
    val title: String = "",
    val description: String = "",
    val status: String = "Open",
    val user: User? = null,
    val acceptedBy: User? = null,
    val markedDoneBy: Long? = null,
    val category: String = "",
    // New fields for formatting and images
    val formattedTitle: List<FormattedTextSegment> = emptyList(),
    val formattedDescription: List<FormattedTextSegment> = emptyList(),
    val imageUri: String? = null
)

@Serializable
data class FormattedTextSegment(
    val text: String = "",
    val isBold: Boolean = false,
    val isItalic: Boolean = false,
    val isUnderlined: Boolean = false,
    val alignment: Int = 0 // 0: Left, 1: Center, 2: Right, 3: Justify
)

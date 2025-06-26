package com.example.collaboraid.ui.viewmodels

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.model.AIMessage
import com.example.collaboraid.repository.AIRepository
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

class AIViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val TAG = "AIViewModel"
    private val aiRepository = AIRepository(sessionManager)

    private val _uiState = MutableStateFlow(AIUiState())
    val uiState: StateFlow<AIUiState> = _uiState.asStateFlow()

    fun askAI(userMessage: String) {
        if (userMessage.isBlank()) return

        Log.d(TAG, "Asking AI: $userMessage")
        _uiState.update { it.copy(isLoading = true) }

        // Create a temporary message with just the user's input
        val tempMessage = AIMessage(
            userMessage = userMessage,
            timestamp = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
        )

        // Add to UI immediately
        _uiState.update {
            it.copy(
                messages = it.messages + tempMessage
            )
        }

        viewModelScope.launch {
            try {
                aiRepository.askAI(userMessage)
                    .onSuccess { aiMessage ->
                        Log.d(TAG, "AI response received: $aiMessage")
                        // Replace the temporary message with the complete one
                        val updatedMessages = _uiState.value.messages.toMutableList()
                        updatedMessages[updatedMessages.lastIndex] = aiMessage

                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                messages = updatedMessages,
                                error = null
                            )
                        }
                    }
                    .onFailure { exception ->
                        Log.e(TAG, "Failed to get AI response", exception)
                        _uiState.update {
                            it.copy(
                                isLoading = false,
                                error = exception.message ?: "Failed to get AI response"
                            )
                        }

                        // Show error in chat
                        val errorMessage = AIMessage(
                            userMessage = userMessage,
                            aiResponse = "Sorry, I couldn't process your request. Please try again later. Error: ${exception.message}",
                            timestamp = SimpleDateFormat("HH:mm", Locale.getDefault()).format(Date())
                        )

                        val updatedMessages = _uiState.value.messages.toMutableList()
                        updatedMessages[updatedMessages.lastIndex] = errorMessage

                        _uiState.update {
                            it.copy(
                                messages = updatedMessages
                            )
                        }
                    }
            } catch (e: Exception) {
                Log.e(TAG, "Exception in askAI", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "An unexpected error occurred"
                    )
                }
            }
        }
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }
}

data class AIUiState(
    val isLoading: Boolean = false,
    val messages: List<AIMessage> = emptyList(),
    val error: String? = null
)

class AIViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AIViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return AIViewModel(sessionManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

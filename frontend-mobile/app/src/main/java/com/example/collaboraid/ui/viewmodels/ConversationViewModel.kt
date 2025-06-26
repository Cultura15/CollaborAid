package com.example.collaboraid.ui.viewmodels

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.model.Message
import com.example.collaboraid.repository.MessageRepository
import com.example.collaboraid.util.SessionManager
import com.example.collaboraid.util.WebSocketManager
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID

class ConversationViewModel(
    private val sessionManager: SessionManager,
    private val receiverId: Long
) : ViewModel() {

    private val TAG = "ConversationViewModel"
    private val webSocketManager = WebSocketManager(sessionManager)
    private val messageRepository = MessageRepository(sessionManager, webSocketManager)

    private val _uiState = MutableStateFlow(ConversationUiState())
    val uiState: StateFlow<ConversationUiState> = _uiState.asStateFlow()

    // Map to track message send status
    private val messageSendStatus = mutableMapOf<String, String>()

    // List to store pending messages
    private val pendingMessages = mutableListOf<Triple<Long, String, String>>() // receiverId, content, tempId

    init {
        // Set receiver name (you might want to fetch this from a user repository)
        _uiState.update { it.copy(receiverId = receiverId) }

        // Automatically connect to WebSocket when ViewModel is created
        if (isLoggedIn()) {
            Log.d(TAG, "Initializing WebSocket connection in ConversationViewModel")
            connectToWebSocket()

            // Load conversation history
            loadConversation()
        } else {
            Log.e(TAG, "Cannot connect to WebSocket: User not logged in")
        }
    }

    fun connectToWebSocket() {
        viewModelScope.launch {
            Log.d(TAG, "Connecting to WebSocket in ConversationViewModel")
            messageRepository.connectWebSocket()

            // Listen for WebSocket connection status
            messageRepository.getConnectionStatus().collect { connected ->
                Log.d(TAG, "WebSocket connection status changed: $connected")
                _uiState.update { it.copy(isWebSocketConnected = connected) }

                // If reconnected, try to send pending messages
                if (connected && pendingMessages.isNotEmpty()) {
                    Log.d(TAG, "WebSocket reconnected. Retrying ${pendingMessages.size} pending messages")
                    retrySendingPendingMessages()
                }
            }

            // Listen for real-time message updates
            messageRepository.getMessageUpdates().collect { message ->
                Log.d(TAG, "Received real-time message in ConversationViewModel: $message")

                // Only process messages relevant to this conversation
                if (message.senderId == receiverId || message.receiverId == receiverId) {
                    // Add the message to the UI state
                    val currentMessages = _uiState.value.messages.toMutableList()

                    // Check if this is an update to an existing message (for status updates)
                    val existingIndex = currentMessages.indexOfFirst {
                        it.id == message.id || (it.tempId != null && it.tempId == message.tempId)
                    }

                    if (existingIndex >= 0) {
                        // Update existing message
                        currentMessages[existingIndex] = message
                    } else {
                        // Add new message
                        currentMessages.add(message)
                    }

                    _uiState.update {
                        it.copy(
                            messages = currentMessages,
                            isLoading = false
                        )
                    }
                } else {
                    Log.d(TAG, "Ignoring message not relevant to this conversation")
                }
            }
        }
    }

    private fun retrySendingPendingMessages() {
        viewModelScope.launch {
            val iterator = pendingMessages.iterator()
            while (iterator.hasNext()) {
                val (receiverId, content, tempId) = iterator.next()

                val success = messageRepository.sendMessage(receiverId, content)
                if (success) {
                    // Message sent successfully
                    updateMessageStatus(tempId, "SENT")
                    iterator.remove()
                }
            }
        }
    }

    fun loadConversation() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            try {
                val result = messageRepository.getConversation(receiverId)

                if (result.isSuccess) {
                    val messages = result.getOrNull() ?: emptyList()

                    // Update receiver name from the first message if available
                    if (messages.isNotEmpty()) {
                        val firstMessage = messages.first()
                        val receiverName = if (firstMessage.senderId == receiverId) {
                            firstMessage.senderUsername ?: "Unknown"
                        } else {
                            firstMessage.receiverUsername ?: "Unknown"
                        }
                        _uiState.update { it.copy(receiverName = receiverName) }
                    }

                    _uiState.update {
                        it.copy(
                            messages = messages,
                            isLoading = false
                        )
                    }
                } else {
                    val error = result.exceptionOrNull()?.message ?: "Failed to load conversation"
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = error
                        )
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error loading conversation", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message ?: "An error occurred"
                    )
                }
            }
        }
    }

    fun sendMessage(content: String) {
        val currentUserId = sessionManager.getUserId() ?: return
        val currentUsername = sessionManager.getUsername() ?: "Me"

        // Create a temporary ID for this message
        val tempId = UUID.randomUUID().toString()

        // Create a temporary message to show immediately in the UI
        val tempMessage = Message(
            id = null,
            tempId = tempId,
            senderId = currentUserId,
            senderUsername = currentUsername,
            receiverId = receiverId,
            receiverUsername = _uiState.value.receiverName,
            content = content,
            timestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                .format(Date()),
            read = false,
            sendStatus = "SENDING"
        )

        // Add the temporary message to the UI
        val currentMessages = _uiState.value.messages.toMutableList()
        currentMessages.add(tempMessage)
        _uiState.update { it.copy(messages = currentMessages) }

        // Try to send the message via WebSocket
        viewModelScope.launch {
            val success = messageRepository.sendMessage(receiverId, content)

            if (!success) {
                // Update the message status to queued
                updateMessageStatus(tempId, "QUEUED")

                // Add to pending messages queue
                addToPendingMessages(receiverId, content, tempId)

                // Show a message to the user
                _uiState.update {
                    it.copy(error = "Message queued for sending. Will be delivered when connection is restored.")
                }
            } else {
                // Message sent successfully via WebSocket
                updateMessageStatus(tempId, "SENT")
            }
        }
    }

    private fun addToPendingMessages(receiverId: Long, content: String, tempId: String) {
        pendingMessages.add(Triple(receiverId, content, tempId))
    }

    fun retryMessage(tempId: String) {
        // Find the message in the current state
        val message = _uiState.value.messages.find { it.tempId == tempId } ?: return

        // Update status to SENDING
        updateMessageStatus(tempId, "SENDING")

        // Try to send again
        viewModelScope.launch {
            val success = messageRepository.sendMessage(
                receiverId = message.receiverId ?: return@launch,
                content = message.content
            )

            if (!success) {
                // Update status back to FAILED if still unsuccessful
                updateMessageStatus(tempId, "FAILED")
            } else {
                // Message sent successfully
                updateMessageStatus(tempId, "SENT")

                // Remove from pending messages if it was there
                pendingMessages.removeIf { it.third == tempId }
            }
        }
    }

    private fun updateMessageStatus(tempId: String, status: String) {
        val currentMessages = _uiState.value.messages.toMutableList()
        val index = currentMessages.indexOfFirst { it.tempId == tempId }

        if (index >= 0) {
            val message = currentMessages[index]
            currentMessages[index] = message.copy(sendStatus = status)
            _uiState.update { it.copy(messages = currentMessages) }
        }
    }

    fun getCurrentUserId(): Long? {
        return sessionManager.getUserId()
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }

    override fun onCleared() {
        super.onCleared()
        // Disconnect WebSocket when ViewModel is cleared
        messageRepository.disconnectWebSocket()
    }
}

data class ConversationUiState(
    val isLoading: Boolean = false,
    val messages: List<Message> = emptyList(),
    val receiverId: Long = 0,
    val receiverName: String = "User",
    val error: String? = null,
    val isWebSocketConnected: Boolean = false
)

class ConversationViewModelFactory(
    private val sessionManager: SessionManager,
    private val receiverId: Long
) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(ConversationViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return ConversationViewModel(sessionManager, receiverId) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

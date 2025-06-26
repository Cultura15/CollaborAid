package com.example.collaboraid.ui.viewmodels

import android.util.Log
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.example.collaboraid.model.Message
import com.example.collaboraid.model.User
import com.example.collaboraid.repository.MessageRepository
import com.example.collaboraid.util.SessionManager
import com.example.collaboraid.util.WebSocketManager
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.concurrent.ConcurrentHashMap

class MessagesViewModel(private val sessionManager: SessionManager) : ViewModel() {

    private val TAG = "MessagesViewModel"
    private val webSocketManager = WebSocketManager(sessionManager)
    private val messageRepository = MessageRepository(sessionManager, webSocketManager)

    private val _uiState = MutableStateFlow(MessagesUiState())
    val uiState: StateFlow<MessagesUiState> = _uiState.asStateFlow()

    // Map to store conversations by user ID
    private val conversationsMap = ConcurrentHashMap<Long, ConversationPreview>()

    // Map to store messages for each conversation
    private val conversationMessages = ConcurrentHashMap<Long, MutableList<Message>>()

    // Queue for messages that failed to send
    private val pendingMessages = ConcurrentHashMap<String, Pair<Long, String>>()

    init {
        _uiState.update { it.copy(username = sessionManager.getUsername() ?: "Messages") }
        Log.d(TAG, "Initialized with username: ${sessionManager.getUsername()}")
        Log.d(TAG, "Auth token available: ${sessionManager.getAuthToken() != null}")

        // Connect to WebSocket for real-time updates
        connectToWebSocket()
    }

    private fun connectToWebSocket() {
        // Only connect if logged in
        if (isLoggedIn()) {
            viewModelScope.launch {
                messageRepository.connectWebSocket()

                // Listen for real-time message updates
                messageRepository.getMessageUpdates().collect { message ->
                    Log.d(TAG, "Received real-time message: $message")

                    // Process the new message
                    processNewMessage(message)
                }
            }

            // Listen for connection status updates
            viewModelScope.launch {
                messageRepository.getConnectionStatus().collect { connected ->
                    Log.d(TAG, "WebSocket connection status: $connected")

                    _uiState.update { it.copy(isWebSocketConnected = connected) }

                    // If reconnected, try to send pending messages
                    if (connected && pendingMessages.isNotEmpty()) {
                        retrySendingPendingMessages()
                    }
                }
            }
        }
    }

    private fun retrySendingPendingMessages() {
        viewModelScope.launch {
            val iterator = pendingMessages.iterator()
            while (iterator.hasNext()) {
                val entry = iterator.next()
                val (receiverId, content) = entry.value

                if (messageRepository.sendMessage(receiverId, content)) {
                    // Message sent successfully, remove from pending
                    iterator.remove()
                }
            }
        }
    }

    private fun processNewMessage(message: Message) {
        val currentUserId = sessionManager.getUserId() ?: return

        // Determine if message is sent or received
        val otherUserId = if (message.senderId == currentUserId) {
            message.receiverId
        } else {
            message.senderId
        }

        if (otherUserId == null) return

        // Add message to conversation
        val messages = conversationMessages.getOrPut(otherUserId) { mutableListOf() }
        messages.add(message)

        // Update conversation preview
        updateConversationPreview(otherUserId, message)

        // Update UI state
        updateConversationsUiState()
    }

    private fun updateConversationPreview(userId: Long, message: Message) {
        val currentUserId = sessionManager.getUserId() ?: return
        val isFromCurrentUser = message.senderId == currentUserId

        // Create or update conversation preview
        val otherUser = if (isFromCurrentUser) {
            User(
                id = message.receiverId,
                username = message.receiverUsername ?: "Unknown",
                email = message.receiverEmail ?: "",
                role = message.receiverRole ?: ""
            )
        } else {
            User(
                id = message.senderId,
                username = message.senderUsername ?: "Unknown",
                email = message.senderEmail ?: "",
                role = message.senderRole ?: ""
            )
        }

        val preview = ConversationPreview(
            user = otherUser,
            lastMessage = message.content,
            timestamp = formatTimestamp(message.timestamp),
            hasUnread = !isFromCurrentUser && message.read != true
        )

        conversationsMap[userId] = preview
    }

    private fun updateConversationsUiState() {
        val conversations = conversationsMap.values.toList()
            .sortedByDescending { it.timestamp }

        _uiState.update {
            it.copy(
                conversations = conversations,
                error = null
            )
        }
    }

    fun loadConversations() {
        _uiState.update { it.copy(isLoading = true, error = null) }

        viewModelScope.launch {
            try {
                // Log the token being used
                val token = sessionManager.getAuthToken()
                Log.d(TAG, "Using auth token: ${token?.take(10)}...")

                // Fetch both sent and received messages in parallel
                val sentDeferred = async { messageRepository.getSentMessages() }
                val receivedDeferred = async { messageRepository.getReceivedMessages() }

                val sentResult = sentDeferred.await()
                val receivedResult = receivedDeferred.await()

                // Log the results of both API calls
                if (sentResult.isSuccess) {
                    Log.d(TAG, "GET /sent successful. Retrieved ${sentResult.getOrNull()?.size ?: 0} messages")
                } else {
                    Log.e(TAG, "GET /sent failed: ${sentResult.exceptionOrNull()?.message}")
                }

                if (receivedResult.isSuccess) {
                    Log.d(TAG, "GET /received successful. Retrieved ${receivedResult.getOrNull()?.size ?: 0} messages")
                } else {
                    Log.e(TAG, "GET /received failed: ${receivedResult.exceptionOrNull()?.message}")
                }

                // Check if both requests were successful
                if (sentResult.isSuccess && receivedResult.isSuccess) {
                    val sentMessages = sentResult.getOrNull() ?: emptyList()
                    val receivedMessages = receivedResult.getOrNull() ?: emptyList()

                    Log.d(TAG, "Combined messages: ${sentMessages.size} sent + ${receivedMessages.size} received")

                    // Combine and process messages
                    processMessages(sentMessages, receivedMessages)
                } else {
                    // Handle errors
                    val error = sentResult.exceptionOrNull()?.message
                        ?: receivedResult.exceptionOrNull()?.message
                        ?: "Failed to load messages"

                    Log.e(TAG, "Error loading messages: $error")

                    // Update UI with error
                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = error
                        )
                    }
                }
            } catch (e: Exception) {
                // Log the exception
                Log.e(TAG, "Exception in loadConversations: ${e.message}", e)

                // Update UI with error
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message
                    )
                }
            }
        }
    }

    private fun processMessages(sentMessages: List<Message>, receivedMessages: List<Message>) {
        val currentUserId = sessionManager.getUserId()
        Log.d(TAG, "Processing messages for user ID: $currentUserId")

        // Process sent messages - group by receiver
        sentMessages.forEach { message ->
            val otherUserId = message.receiverId ?: return@forEach

            // Add to conversation messages
            val messages = conversationMessages.getOrPut(otherUserId) { mutableListOf() }
            messages.add(message)

            // Update conversation preview if newer
            val existingPreview = conversationsMap[otherUserId]
            if (existingPreview == null ||
                (message.timestamp) > (existingPreview.timestamp)) {
                updateConversationPreview(otherUserId, message)
            }
        }

        // Process received messages - group by sender
        receivedMessages.forEach { message ->
            val otherUserId = message.senderId ?: return@forEach

            // Add to conversation messages
            val messages = conversationMessages.getOrPut(otherUserId) { mutableListOf() }
            messages.add(message)

            // Update conversation preview if newer
            val existingPreview = conversationsMap[otherUserId]
            if (existingPreview == null ||
                (message.timestamp) > (existingPreview.timestamp)) {
                updateConversationPreview(otherUserId, message)
            }
        }

        // Update UI state with sorted conversations
        updateConversationsUiState()

        _uiState.update {
            it.copy(isLoading = false)
        }
    }

    fun getConversationMessages(userId: Long): List<Message> {
        return conversationMessages[userId] ?: emptyList()
    }

    fun loadConversation(userId: Long) {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }

            try {
                val result = messageRepository.getConversation(userId)

                if (result.isSuccess) {
                    val messages = result.getOrNull() ?: emptyList()
                    Log.d(TAG, "Loaded ${messages.size} messages for conversation with user $userId")

                    // Store messages
                    conversationMessages[userId] = messages.toMutableList()

                    // Update UI state
                    if (messages.isNotEmpty()) {
                        updateConversationPreview(userId, messages.maxByOrNull { it.timestamp }!!)
                        updateConversationsUiState()
                    }

                    _uiState.update { it.copy(isLoading = false) }
                } else {
                    val error = result.exceptionOrNull()?.message ?: "Failed to load conversation"
                    Log.e(TAG, "Error loading conversation: $error")

                    _uiState.update {
                        it.copy(
                            isLoading = false,
                            error = error
                        )
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Exception in loadConversation", e)
                _uiState.update {
                    it.copy(
                        isLoading = false,
                        error = e.message
                    )
                }
            }
        }
    }

    fun sendMessage(receiverId: Long, content: String) {
        val messageId = System.currentTimeMillis().toString()

        viewModelScope.launch {
            // Check if WebSocket is connected
            if (messageRepository.isWebSocketConnected()) {
                // Send via WebSocket
                val success = messageRepository.sendMessage(receiverId, content)

                if (!success) {
                    // Store in pending messages if failed
                    pendingMessages[messageId] = Pair(receiverId, content)

                    _uiState.update {
                        it.copy(error = "Message queued for sending")
                    }
                }
            } else {
                // WebSocket not connected, store in pending messages
                pendingMessages[messageId] = Pair(receiverId, content)

                _uiState.update {
                    it.copy(error = "WebSocket not connected. Message queued for sending.")
                }

                // Try to reconnect
                connectToWebSocket()
            }
        }
    }

    private fun formatTimestamp(timestamp: String): String {
        // In a real app, you'd parse the timestamp and format it relative to current time
        // For now, just return a simple representation
        return if (timestamp.isNotEmpty()) {
            val now = System.currentTimeMillis()
            val hoursDiff = (now - timestamp.hashCode()) / (1000 * 60 * 60)

            when {
                hoursDiff < 24 -> "Today"
                hoursDiff < 48 -> "Yesterday"
                hoursDiff < 168 -> "${hoursDiff / 24}d"
                hoursDiff < 720 -> "${hoursDiff / 168}w"
                else -> "${hoursDiff / 720}m"
            }
        } else {
            "Recently"
        }
    }

    fun isLoggedIn(): Boolean {
        return sessionManager.getAuthToken() != null
    }

    override fun onCleared() {
        super.onCleared()
        // Disconnect WebSocket when ViewModel is cleared
        viewModelScope.launch {
            messageRepository.disconnectWebSocket()
        }
    }
}

data class MessagesUiState(
    val isLoading: Boolean = false,
    val conversations: List<ConversationPreview> = emptyList(),
    val username: String = "Messages",
    val error: String? = null,
    val isWebSocketConnected: Boolean = false
)

data class ConversationPreview(
    val user: User,
    val lastMessage: String,
    val timestamp: String,
    val hasUnread: Boolean = false
)

class MessagesViewModelFactory(private val sessionManager: SessionManager) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MessagesViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return MessagesViewModel(sessionManager) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
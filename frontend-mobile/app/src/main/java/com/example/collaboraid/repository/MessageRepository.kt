package com.example.collaboraid.repository

import android.util.Log
import com.example.collaboraid.api.RetrofitClient
import com.example.collaboraid.model.Message
import com.example.collaboraid.util.SessionManager
import com.example.collaboraid.util.WebSocketManager
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import kotlinx.coroutines.withTimeoutOrNull
import retrofit2.Response
import java.util.UUID

class MessageRepository(
    private val sessionManager: SessionManager,
    private val webSocketManager: WebSocketManager
) {
    private val TAG = "MessageRepository"

    // Track connection status
    private val _connectionStatus = MutableStateFlow(false)

    // Track if connection is in progress
    private var connectionInProgress = false

    // Queue for messages that need to be sent when connection is established
    private val messageQueue = mutableListOf<Pair<Long, String>>()

    // Maximum number of connection attempts
    private val MAX_CONNECTION_ATTEMPTS = 3
    private var connectionAttempts = 0

    // In MessageRepository
    fun getMessageUpdates(): Flow<Message> = webSocketManager.messageUpdates

    fun getConnectionStatus(): Flow<Boolean> = webSocketManager.connectionStatus

    fun isWebSocketConnected(): Boolean {
        return _connectionStatus.value
    }

    suspend fun connectWebSocket() {
        if (connectionInProgress) {
            Log.d(TAG, "WebSocket connection already in progress")
            return
        }

        connectionInProgress = true
        connectionAttempts++

        try {
            val token = sessionManager.getAuthToken() ?: throw IllegalStateException("No auth token")
            val userId = sessionManager.getUserId() ?: throw IllegalStateException("No user ID")

            Log.d(TAG, "Connecting to WebSocket with token: $token and userId: $userId")

            // Add a timeout for the connection attempt
            val connected = withTimeoutOrNull(15000) { // 15 seconds timeout
                webSocketManager.connect(token, userId.toString())
            } ?: false

            _connectionStatus.value = connected

            if (connected) {
                Log.d(TAG, "WebSocket connected successfully")
                connectionAttempts = 0 // Reset connection attempts on success
                // Process queued messages after actual connection
                processMessageQueue()
            } else {
                Log.e(TAG, "Failed to connect to WebSocket (Attempt $connectionAttempts of $MAX_CONNECTION_ATTEMPTS)")

                // Retry connection with exponential backoff if we haven't reached max attempts
                if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
                    val backoffDelay = (1000L * (1 shl (connectionAttempts - 1))).coerceAtMost(30000L) // Max 30 seconds
                    Log.d(TAG, "Retrying connection in $backoffDelay ms")
                    delay(backoffDelay)
                    connectionInProgress = false
                    connectWebSocket() // Recursive call for retry
                } else {
                    Log.e(TAG, "Max connection attempts reached, giving up")
                    connectionAttempts = 0 // Reset for future attempts
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error connecting to WebSocket", e)
            _connectionStatus.value = false

            // Retry on exception if we haven't reached max attempts
            if (connectionAttempts < MAX_CONNECTION_ATTEMPTS) {
                val backoffDelay = (1000L * (1 shl (connectionAttempts - 1))).coerceAtMost(30000L)
                Log.d(TAG, "Connection error, retrying in $backoffDelay ms")
                delay(backoffDelay)
                connectionInProgress = false
                connectWebSocket() // Recursive call for retry
            } else {
                Log.e(TAG, "Max connection attempts reached after error, giving up")
                connectionAttempts = 0 // Reset for future attempts
            }
        } finally {
            connectionInProgress = false
        }
    }

    fun disconnectWebSocket() {
        webSocketManager.disconnect()
        _connectionStatus.value = false
    }

    // Add these methods for REST API calls

    suspend fun getSentMessages(): Result<List<Message>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            Log.d(TAG, "Using token for getSentMessages: Bearer ${token.take(10)}...")

            // Ensure the token is set in RetrofitClient's static SessionManager
            RetrofitClient.SessionManager.setToken(token)

            val response = RetrofitClient.messageService.getSentMessages()
            if (response.isSuccessful) {
                val responseBody = response.body()
                if (responseBody != null) {
                    Log.d(TAG, "Received ${responseBody.size} sent messages")
                    // Log the first message to see its structure
                    if (responseBody.isNotEmpty()) {
                        Log.d(TAG, "First sent message: ${responseBody[0]}")
                    }
                    Result.success(responseBody)
                } else {
                    Log.e(TAG, "Response body is null for sent messages")
                    Result.failure(Exception("Response body is null for sent messages"))
                }
            } else {
                Log.e(TAG, "Failed to fetch sent messages: ${response.code()} - ${response.message()}")
                Result.failure(Exception("Failed to fetch sent messages: ${response.code()} - ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in getSentMessages", e)
            Result.failure(e)
        }
    }

    suspend fun getReceivedMessages(): Result<List<Message>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            Log.d(TAG, "Using token for getReceivedMessages: Bearer ${token.take(10)}...")

            // Ensure the token is set in RetrofitClient's static SessionManager
            RetrofitClient.SessionManager.setToken(token)

            val response = RetrofitClient.messageService.getReceivedMessages()
            if (response.isSuccessful) {
                val responseBody = response.body()
                if (responseBody != null) {
                    Log.d(TAG, "Received ${responseBody.size} received messages")
                    // Log the first message to see its structure
                    if (responseBody.isNotEmpty()) {
                        Log.d(TAG, "First received message: ${responseBody[0]}")
                    }
                    Result.success(responseBody)
                } else {
                    Log.e(TAG, "Response body is null for received messages")
                    Result.failure(Exception("Response body is null for received messages"))
                }
            } else {
                Log.e(TAG, "Failed to fetch received messages: ${response.code()} - ${response.message()}")
                Result.failure(Exception("Failed to fetch received messages: ${response.code()} - ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in getReceivedMessages", e)
            Result.failure(e)
        }
    }

    suspend fun getConversation(receiverId: Long): Result<List<Message>> = withContext(Dispatchers.IO) {
        try {
            val token = sessionManager.getAuthToken() ?: return@withContext Result.failure(Exception("No token found"))
            Log.d(TAG, "Using token for getConversation: Bearer ${token.take(10)}...")

            // Ensure the token is set in RetrofitClient's static SessionManager
            RetrofitClient.SessionManager.setToken(token)

            // Updated to use the new authenticated endpoint
            Log.d(TAG, "Getting conversation with receiver $receiverId")
            val response = RetrofitClient.messageService.getConversation(receiverId)

            Log.d(TAG, "getConversation response code: ${response.code()}")

            if (response.isSuccessful && response.body() != null) {
                val messages = response.body()!!
                Log.d(TAG, "Retrieved ${messages.size} messages for conversation with user $receiverId")
                Result.success(messages)
            } else {
                val errorBody = response.errorBody()?.string() ?: "Unknown error"
                Log.e(TAG, "Failed to get conversation: ${response.code()} - ${response.message()}, Error: $errorBody")
                Result.failure(Exception("Failed to get conversation: ${response.code()} - ${response.message()}"))
            }
        } catch (e: Exception) {
            Log.e(TAG, "Exception in getConversation", e)
            Result.failure(e)
        }
    }

    suspend fun sendMessage(receiverId: Long, content: String): Boolean {
        // Check if WebSocket is connected
        if (!_connectionStatus.value) {
            Log.e(TAG, "WebSocket not connected, cannot send message")

            // Queue the message for later
            messageQueue.add(Pair(receiverId, content))

            // Try to reconnect
            connectWebSocket()

            // Wait for connection to be established with a longer timeout
            val connected = withTimeoutOrNull(10000) { // wait up to 10 seconds
                var attempts = 0
                while (!_connectionStatus.value && attempts < 20) {
                    delay(500) // Check every 500ms
                    attempts++
                }
                _connectionStatus.value
            } ?: false

            if (!connected) {
                Log.e(TAG, "WebSocket still not connected after waiting")
                return false
            }
        }

        return try {
            val tempId = UUID.randomUUID().toString()
            val success = webSocketManager.sendMessage(receiverId, content, tempId)

            if (!success) {
                Log.e(TAG, "Failed to send message via WebSocket")
                messageQueue.add(Pair(receiverId, content))
                return false
            }

            true
        } catch (e: Exception) {
            Log.e(TAG, "Error sending message", e)
            messageQueue.add(Pair(receiverId, content))
            false
        }
    }

    private suspend fun processMessageQueue() {
        if (messageQueue.isEmpty()) {
            return
        }

        Log.d(TAG, "Processing message queue: ${messageQueue.size} messages")

        val iterator = messageQueue.iterator()
        while (iterator.hasNext()) {
            val (receiverId, content) = iterator.next()

            try {
                val tempId = UUID.randomUUID().toString()
                val success = webSocketManager.sendMessage(receiverId, content, tempId)

                if (success) {
                    // Message sent successfully, remove from queue
                    iterator.remove()
                } else {
                    // Stop processing if we can't send a message
                    Log.e(TAG, "Failed to send queued message, will retry later")
                    break
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error sending queued message", e)
                break
            }
        }
    }


}
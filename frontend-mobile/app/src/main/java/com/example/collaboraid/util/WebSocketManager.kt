package com.example.collaboraid.util

import android.util.Log
import com.example.collaboraid.model.Message
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asSharedFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.Response
import okhttp3.WebSocket
import okhttp3.WebSocketListener
import okio.ByteString
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.UUID
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import kotlinx.coroutines.CompletableDeferred
import okhttp3.logging.HttpLoggingInterceptor

class WebSocketManager(private val sessionManager: SessionManager) {
    private val TAG = "WebSocketManager"

    // Base URL for WebSocket connection
    private val BASE_URL = "wss://it342-g5-collaboraid.onrender.com/ws/websocket"

    private var webSocket: WebSocket? = null
    private val okHttpClient: OkHttpClient
    private val isConnected = AtomicBoolean(false)
    private val isConnecting = AtomicBoolean(false)

    // Flow for message updates
    private val _messageUpdates = MutableSharedFlow<Message>(replay = 0)
    val messageUpdates: SharedFlow<Message> = _messageUpdates.asSharedFlow()

    // Flow for connection status
    private val _connectionStatus = MutableStateFlow(false)
    val connectionStatus: StateFlow<Boolean> = _connectionStatus.asStateFlow()

    // Coroutine scope for this manager
    private val scope = CoroutineScope(SupervisorJob() + Dispatchers.IO)

    // STOMP session ID
    private var sessionId = ""

    // Track subscriptions
    private val subscriptions = mutableMapOf<String, String>() // topic to subscription ID

    init {
        // Create a logging interceptor for debugging
        val loggingInterceptor = HttpLoggingInterceptor { message ->
            Log.d(TAG, "OkHttp: $message")
        }
        loggingInterceptor.level = HttpLoggingInterceptor.Level.BODY

        // Create OkHttpClient
        okHttpClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(loggingInterceptor)
            .build()
    }

    suspend fun connect(token: String, userId: String): Boolean {
        if (isConnected.get()) {
            Log.d(TAG, "Already connected to WebSocket")
            return true
        }

        if (isConnecting.getAndSet(true)) {
            Log.d(TAG, "Connection already in progress")
            return false
        }

        val connectionDeferred = CompletableDeferred<Boolean>()

        try {
            Log.d(TAG, "Connecting to WebSocket: $BASE_URL")

            // Create WebSocket request
            val request = Request.Builder()
                .url(BASE_URL)
                .header("Authorization", "Bearer $token")
                .build()

            // Create WebSocket listener
            val listener = object : WebSocketListener() {
                override fun onOpen(webSocket: WebSocket, response: Response) {
                    Log.d(TAG, "WebSocket connection opened")

                    // Send STOMP CONNECT frame
                    val connectFrame = buildStompConnectFrame(token, userId)
                    webSocket.send(connectFrame)
                }

                override fun onMessage(webSocket: WebSocket, text: String) {
                    Log.d(TAG, "Received message: $text")

                    if (text.startsWith("CONNECTED")) {
                        // Extract session ID if present
                        val sessionIdMatch = Regex("session-id:([^\n]+)").find(text)
                        sessionId = sessionIdMatch?.groupValues?.get(1)?.trim() ?: UUID.randomUUID().toString()

                        Log.d(TAG, "STOMP connection established with session ID: $sessionId")
                        isConnected.set(true)
                        isConnecting.set(false)

                        // Update connection status
                        scope.launch {
                            _connectionStatus.emit(true)
                        }

                        // Subscribe to message topic
                        subscribeToMessageTopic(userId)

                        // Complete the connection
                        connectionDeferred.complete(true)
                    } else if (text.startsWith("MESSAGE")) {
                        // Process STOMP message
                        processStompMessage(text)
                    } else if (text.startsWith("ERROR")) {
                        Log.e(TAG, "STOMP error: $text")
                        handleDisconnection()
                        connectionDeferred.complete(false)
                    } else if (text.startsWith("RECEIPT")) {
                        // Handle receipt if needed
                        Log.d(TAG, "Received RECEIPT: $text")
                    }
                }

                override fun onFailure(webSocket: WebSocket, t: Throwable, response: Response?) {
                    Log.e(TAG, "WebSocket failure: ${t.message}", t)
                    handleDisconnection()
                    connectionDeferred.complete(false)

                    // Try to reconnect after a delay
                    scope.launch {
                        withContext(Dispatchers.IO) {
                            Thread.sleep(5000) // Wait 5 seconds before reconnecting
                            val newToken = sessionManager.getAuthToken()
                            val userId = sessionManager.getUserId()?.toString()
                            if (newToken != null && userId != null) {
                                connect(newToken, userId)
                            }
                        }
                    }
                }

                override fun onClosed(webSocket: WebSocket, code: Int, reason: String) {
                    Log.d(TAG, "WebSocket closed: $code - $reason")
                    handleDisconnection()
                }

                override fun onMessage(webSocket: WebSocket, bytes: ByteString) {
                    Log.d(TAG, "Received binary message: ${bytes.hex()}")
                    // Handle binary messages if needed
                }
            }

            // Connect to WebSocket
            webSocket = okHttpClient.newWebSocket(request, listener)

            // Wait for connection result
            return connectionDeferred.await()

        } catch (e: Exception) {
            Log.e(TAG, "Error connecting to WebSocket", e)
            handleDisconnection()
            connectionDeferred.complete(false)
            return false
        }
    }

    private fun buildStompConnectFrame(token: String, userId: String): String {
        return "CONNECT\n" +
                "accept-version:1.1,1.0\n" +
                "heart-beat:10000,10000\n" +
                "Authorization:Bearer $token\n" +
                "userId:$userId\n" +
                "\n" +  // Empty line is required by STOMP protocol
                "\u0000"  // NULL byte is required by STOMP protocol
    }

    private fun subscribeToMessageTopic(userId: String) {
        if (!isConnected.get()) {
            Log.d(TAG, "Cannot subscribe: Not connected")
            return
        }

        val topicDestination = "/topic/messages/$userId"

        // Check if already subscribed
        if (subscriptions.containsKey(topicDestination)) {
            Log.d(TAG, "Already subscribed to: $topicDestination")
            return
        }

        val subscriptionId = "sub-" + UUID.randomUUID().toString()

        Log.d(TAG, "Subscribing to message destination: $topicDestination")

        val subscribeFrame = "SUBSCRIBE\n" +
                "id:$subscriptionId\n" +
                "destination:$topicDestination\n" +
                "\n" +
                "\u0000"

        val sent = webSocket?.send(subscribeFrame) ?: false

        if (sent) {
            // Track this subscription
            subscriptions[topicDestination] = subscriptionId
            Log.d(TAG, "Successfully subscribed to: $topicDestination")
        } else {
            Log.e(TAG, "Failed to subscribe to: $topicDestination")
        }
    }

    private fun processStompMessage(stompFrame: String) {
        try {
            // Extract the body of the STOMP message
            val bodyStartIndex = stompFrame.indexOf("\n\n")
            if (bodyStartIndex == -1) {
                Log.e(TAG, "Invalid STOMP message format: $stompFrame")
                return
            }

            val body = stompFrame.substring(bodyStartIndex + 2).replace("\u0000", "")

            // Parse the JSON body
            val json = JSONObject(body)

            // Convert to Message object
            val message = parseMessage(json)

            // Emit the message
            scope.launch {
                _messageUpdates.emit(message)
            }

            Log.d(TAG, "Processed and emitted message: ${message.content}")

        } catch (e: Exception) {
            Log.e(TAG, "Error processing STOMP message", e)
            e.printStackTrace()
        }
    }

    private fun parseMessage(json: JSONObject): Message {
        return try {
            Message(
                id = if (json.has("id")) json.getLong("id") else null,
                tempId = if (json.has("tempId")) json.getString("tempId") else null,
                senderId = if (json.has("senderId")) {
                    json.getLong("senderId")
                } else if (json.has("sender") && !json.isNull("sender")) {
                    json.getJSONObject("sender").getLong("id")
                } else {
                    0L // Default value
                },
                senderUsername = if (json.has("senderUsername")) {
                    json.getString("senderUsername")
                } else if (json.has("sender") && !json.isNull("sender")) {
                    json.getJSONObject("sender").optString("username", "Unknown")
                } else {
                    "Unknown"
                },
                receiverId = if (json.has("receiverId")) {
                    json.getLong("receiverId")
                } else if (json.has("receiver") && !json.isNull("receiver")) {
                    json.getJSONObject("receiver").getLong("id")
                } else {
                    0L // Default value
                },
                receiverUsername = if (json.has("receiverUsername")) {
                    json.getString("receiverUsername")
                } else if (json.has("receiver") && !json.isNull("receiver")) {
                    json.getJSONObject("receiver").optString("username", "Unknown")
                } else {
                    null
                },
                content = json.getString("content"),
                timestamp = if (json.has("timestamp")) json.getString("timestamp") else SimpleDateFormat(
                    "yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()
                ).format(Date()),
                read = if (json.has("read")) json.getBoolean("read") else false,
                sendStatus = if (json.has("status")) json.getString("status") else "SENT",
                senderEmail = if (json.has("senderEmail")) json.getString("senderEmail") else null,
                receiverEmail = if (json.has("receiverEmail")) json.getString("receiverEmail") else null,
                senderRole = if (json.has("senderRole")) json.getString("senderRole") else null,
                receiverRole = if (json.has("receiverRole")) json.getString("receiverRole") else null
            )
        } catch (e: Exception) {
            Log.e(TAG, "Error parsing message: ${e.message}", e)
            Log.e(TAG, "JSON was: $json")

            // Return a default message in case of parsing error
            Message(
                id = null,
                tempId = null,
                senderId = 0,
                senderUsername = "Error",
                receiverId = 0,
                receiverUsername = null,
                content = "Error parsing message: ${e.message}",
                timestamp = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).format(Date()),
                read = false,
                sendStatus = "ERROR"
            )
        }
    }

    suspend fun sendMessage(receiverId: Long, content: String, tempId: String): Boolean {
        if (!isConnected.get()) {
            Log.e(TAG, "Cannot send message: WebSocket not connected")
            return false
        }

        try {
            val currentUserId = sessionManager.getUserId() ?: return false
            val currentUsername = sessionManager.getUsername() ?: "Unknown"

            // Create message payload to match MessageEntity structure
            val messagePayload = JSONObject().apply {
                put("sender", JSONObject().apply {
                    put("id", currentUserId)
                    put("username", currentUsername)
                })
                put("receiver", JSONObject().apply {
                    put("id", receiverId)
                })
                put("content", content)
                // Include tempId for tracking on the client side
                put("tempId", tempId)
            }

            Log.d(TAG, "Sending message: $messagePayload")

            // Create STOMP SEND frame
            val sendFrame = "SEND\n" +
                    "destination:/app/sendMessage\n" +
                    "content-type:application/json;charset=UTF-8\n" +
                    "content-length:${messagePayload.toString().length}\n" +
                    "\n" +
                    messagePayload.toString() +
                    "\u0000"

            // Send the message
            val sent = webSocket?.send(sendFrame) ?: false

            if (sent) {
                Log.d(TAG, "Message sent successfully")
            } else {
                Log.e(TAG, "Failed to send message")
            }

            return sent

        } catch (e: Exception) {
            Log.e(TAG, "Error sending message", e)
            e.printStackTrace()
            return false
        }
    }

    private fun handleDisconnection() {
        isConnected.set(false)
        isConnecting.set(false)
        subscriptions.clear()

        // Update connection status
        scope.launch {
            _connectionStatus.emit(false)
        }
    }

    fun disconnect() {
        try {
            Log.d(TAG, "Disconnecting from WebSocket")

            if (isConnected.get()) {
                // Send STOMP DISCONNECT frame
                val disconnectFrame = "DISCONNECT\n" +
                        "receipt:disconnect-${UUID.randomUUID()}\n" +
                        "\n" +
                        "\u0000"

                webSocket?.send(disconnectFrame)
            }

            // Close WebSocket
            webSocket?.close(1000, "Normal closure")
            webSocket = null

            handleDisconnection()

            Log.d(TAG, "Disconnected from WebSocket")
        } catch (e: Exception) {
            Log.e(TAG, "Error disconnecting from WebSocket", e)
            e.printStackTrace()
        }
    }

    fun isConnected(): Boolean {
        return isConnected.get()
    }

    // Add a heartbeat mechanism to keep the connection alive
    fun startHeartbeat() {
        if (!isConnected.get()) return

        scope.launch {
            while (isConnected.get()) {
                try {
                    // Send a heartbeat every 30 seconds
                    withContext(Dispatchers.IO) {
                        Thread.sleep(30000)
                    }

                    if (isConnected.get()) {
                        webSocket?.send("\n")
                        Log.d(TAG, "Heartbeat sent")
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "Error sending heartbeat", e)
                }
            }
        }
    }
}
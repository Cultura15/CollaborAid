package com.example.collaboraid.ui.screens.messages

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.layout.widthIn
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Send
import androidx.compose.material.icons.filled.SignalWifi4Bar
import androidx.compose.material.icons.filled.SignalWifiOff
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.collaboraid.model.Message
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.ConversationViewModel
import com.example.collaboraid.ui.viewmodels.ConversationViewModelFactory
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement.Absolute.spacedBy
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.material.icons.filled.AttachFile
import androidx.compose.material.icons.filled.Image
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Divider
import androidx.compose.runtime.DisposableEffect
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import kotlinx.coroutines.delay

private const val TAG = "ConversationScreen"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ConversationScreen(
    userId: Long,
    navController: NavController,
    viewModel: ConversationViewModel = viewModel(
        factory = ConversationViewModelFactory(SessionManager(LocalContext.current), userId)
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var messageText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val coroutineScope = rememberCoroutineScope()

    // Check if user is logged in and connect to WebSocket
    LaunchedEffect(Unit) {
        Log.d(TAG, "Checking if user is logged in")
        if (!viewModel.isLoggedIn()) {
            Log.d(TAG, "User not logged in, navigating to login screen")
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Conversation.route) { inclusive = true }
            }
        } else {
            Log.d(TAG, "User is logged in, loading conversation with user ID: $userId")
            // Load initial conversation history
            viewModel.loadConversation()
        }
    }

    // Auto-scroll to bottom when new messages arrive
    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.size - 1)
        }
    }

    // Periodically check WebSocket connection and reconnect if needed
//    LaunchedEffect(Unit) {
//        while (true) {
//            delay(10000) // Check every 10 seconds
//            if (!uiState.isWebSocketConnected) {
//                Log.d(TAG, "WebSocket disconnected, attempting to reconnect")
//                viewModel.connectToWebSocket()
//            }
//            delay(10000)
//        }
//    }
//
//    // Clean up when leaving the screen
//    DisposableEffect(Unit) {
//        onDispose {
//            Log.d(TAG, "ConversationScreen disposed")
//        }
//    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Profile picture
                        Box(
                            modifier = Modifier
                                .size(36.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF333333)),
                            contentAlignment = Alignment.Center
                        ) {
                            AsyncImage(
                                model = "https://ui-avatars.com/api/?name=${uiState.receiverName}&background=random",
                                contentDescription = "Profile picture",
                                modifier = Modifier.size(36.dp),
                                contentScale = ContentScale.Crop
                            )
                        }

                        Spacer(modifier = Modifier.width(12.dp))

                        Column {
                            Text(
                                text = uiState.receiverName,
                                fontWeight = FontWeight.Bold
                            )
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(8.dp)
                                        .background(
                                            if (uiState.isWebSocketConnected) Color.Green else Color.Red,
                                            CircleShape
                                        )
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = if (uiState.isWebSocketConnected) "Online" else "Offline",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color.Gray
                                )
                            }
                        }
                    }
                },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                actions = {
                    // WebSocket connection status indicator
                    IconButton(
                        onClick = {
                            if (!uiState.isWebSocketConnected) {
                                viewModel.connectToWebSocket()
                            }
                        }
                    ) {
                        Icon(
                            imageVector = if (uiState.isWebSocketConnected)
                                Icons.Default.SignalWifi4Bar else Icons.Default.SignalWifiOff,
                            contentDescription = if (uiState.isWebSocketConnected)
                                "Connected" else "Disconnected",
                            tint = if (uiState.isWebSocketConnected)
                                Color.Green else Color.Red
                        )
                    }

                    // Add refresh button
                    IconButton(onClick = { viewModel.loadConversation() }) {
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Refresh",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF000000),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White,
                    actionIconContentColor = Color.White
                )
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFF000000))
        ) {
            if (uiState.isLoading && uiState.messages.isEmpty()) {
                // Show loading indicator only if we don't have any messages yet
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color(0xFF1DA1F2))
                }
            } else if (uiState.error != null && uiState.messages.isEmpty()) {
                // Show error message with retry button only if we don't have any messages
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth(),
                    contentAlignment = Alignment.Center
                ) {
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = uiState.error ?: "An error occurred",
                            color = Color.Red,
                            modifier = Modifier.padding(16.dp)
                        )
                        IconButton(
                            onClick = { viewModel.loadConversation() }
                        ) {
                            Icon(
                                imageVector = Icons.Default.Refresh,
                                contentDescription = "Retry",
                                tint = Color.White
                            )
                        }
                    }
                }
            } else {
                // Messages list
                Box(
                    modifier = Modifier
                        .weight(1f)
                        .fillMaxWidth()
                ) {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(horizontal = 16.dp),
                        state = listState,
                        contentPadding = PaddingValues(vertical = 16.dp),
                        verticalArrangement = spacedBy(8.dp)
                    ) {
                        if (uiState.messages.isEmpty()) {
                            item {
                                Box(
                                    modifier = Modifier.fillMaxWidth(),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "No messages yet. Start a conversation!",
                                        color = Color.Gray
                                    )
                                }
                            }
                        } else {
                            // Make sure messages are sorted by timestamp (oldest first)
                            val sortedMessages = uiState.messages.sortedBy {
                                try {
                                    SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).parse(it.timestamp)?.time ?: 0
                                } catch (e: Exception) {
                                    0L
                                }
                            }

                            // Group messages by date
                            val groupedMessages = sortedMessages.groupBy { message ->
                                try {
                                    val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
                                        .parse(message.timestamp)
                                    SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(date)
                                } catch (e: Exception) {
                                    "Unknown Date"
                                }
                            }

                            // Display messages grouped by date
                            groupedMessages.forEach { (date, messages) ->
                                item {
                                    Text(
                                        text = formatDateHeader(date),
                                        color = Color.Gray,
                                        modifier = Modifier
                                            .fillMaxWidth()
                                            .padding(vertical = 8.dp),
                                        textAlign = TextAlign.Center
                                    )
                                }

                                itemsIndexed(messages) { index, message ->
                                    val isFromCurrentUser = message.senderId == viewModel.getCurrentUserId()
                                    val showSenderInfo = index == 0 ||
                                            messages.getOrNull(index - 1)?.senderId != message.senderId

                                    MessageItem(
                                        message = message,
                                        isFromCurrentUser = isFromCurrentUser,
                                        showSenderInfo = showSenderInfo,
                                        sendStatus = if (isFromCurrentUser) message.sendStatus else null,
                                        onRetry = { tempId ->
                                            if (tempId != null) {
                                                viewModel.retryMessage(tempId)
                                            }
                                        }
                                    )
                                }
                            }
                        }
                    }

                    // Show loading indicator for new messages being loaded
                    if (uiState.isLoading && uiState.messages.isNotEmpty()) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.TopCenter)
                                .padding(top = 8.dp)
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color(0xFF1DA1F2),
                                strokeWidth = 2.dp
                            )
                        }
                    }

                    // Scroll to bottom button
                    if (uiState.messages.size > 10) {
                        Box(
                            modifier = Modifier
                                .align(Alignment.BottomEnd)
                                .padding(16.dp)
                                .size(40.dp)
                                .clip(CircleShape)
                                .background(Color(0xFF1DA1F2))
                                .clickable {
                                    coroutineScope.launch {
                                        listState.animateScrollToItem(uiState.messages.size - 1)
                                    }
                                },
                            contentAlignment = Alignment.Center
                        ) {
                            Icon(
                                imageVector = Icons.Default.KeyboardArrowDown,
                                contentDescription = "Scroll to bottom",
                                tint = Color.White
                            )
                        }
                    }
                }
            }

            // Message input
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp),
                colors = CardDefaults.cardColors(
                    containerColor = Color(0xFF212121)
                ),
                shape = RoundedCornerShape(24.dp)
            ) {
                Column {
                    // Message input field
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(horizontal = 16.dp, vertical = 8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        // Attachment button
                        IconButton(
                            onClick = { /* Handle attachment */ },
                            modifier = Modifier.size(40.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.AttachFile,
                                contentDescription = "Attach file",
                                tint = Color.Gray
                            )
                        }

                        // Image button
                        IconButton(
                            onClick = { /* Handle image */ },
                            modifier = Modifier.size(40.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.Image,
                                contentDescription = "Send image",
                                tint = Color.Gray
                            )
                        }

                        // Text input
                        OutlinedTextField(
                            value = messageText,
                            onValueChange = { messageText = it },
                            placeholder = { Text("Type a message...", color = Color.Gray) },
                            modifier = Modifier
                                .weight(1f)
                                .padding(horizontal = 8.dp),
                            shape = RoundedCornerShape(50),
                            colors = OutlinedTextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedContainerColor = Color(0xFF212121),
                                unfocusedContainerColor = Color(0xFF212121),
                                cursorColor = Color.White,
                                focusedBorderColor = Color.Transparent,
                                unfocusedBorderColor = Color.Transparent,
                                unfocusedPlaceholderColor = Color.Gray,
                                focusedPlaceholderColor = Color.Gray
                            ),
                            maxLines = 3,
                            singleLine = false
                        )

                        // Send button
                        IconButton(
                            onClick = {
                                if (messageText.isNotBlank()) {
                                    viewModel.sendMessage(messageText)
                                    messageText = ""
                                }
                            },
                            modifier = Modifier
                                .size(40.dp)
                                .background(
                                    color = if (messageText.isBlank()) Color.Gray else Color(0xFF1DA1F2),
                                    shape = CircleShape
                                )
                        ) {
                            Icon(
                                imageVector = Icons.Default.Send,
                                contentDescription = "Send",
                                tint = Color.White
                            )
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun MessageItem(
    message: Message,
    isFromCurrentUser: Boolean,
    showSenderInfo: Boolean = true,
    sendStatus: String? = null,
    onRetry: (String?) -> Unit = {}
) {
    Column(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = if (showSenderInfo) 4.dp else 2.dp),
        horizontalAlignment = if (isFromCurrentUser) Alignment.End else Alignment.Start
    ) {
        // Show sender info only if it's a new sender
        if (showSenderInfo && !isFromCurrentUser) {
            Row(
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.padding(bottom = 4.dp)
            ) {
                // Profile picture for received messages
                Box(
                    modifier = Modifier
                        .size(24.dp)
                        .clip(CircleShape)
                        .background(Color(0xFF333333)),
                    contentAlignment = Alignment.Center
                ) {
                    if (message.senderUsername != null) {
                        AsyncImage(
                            model = "https://ui-avatars.com/api/?name=${message.senderUsername}&background=random",
                            contentDescription = "Profile picture",
                            modifier = Modifier.size(24.dp),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        Icon(
                            imageVector = Icons.Default.Person,
                            contentDescription = "Profile",
                            tint = Color(0xFF1DA1F2),
                            modifier = Modifier.size(16.dp)
                        )
                    }
                }

                Spacer(modifier = Modifier.width(8.dp))

                Text(
                    text = message.senderUsername ?: "Unknown",
                    color = Color.Gray,
                    style = MaterialTheme.typography.bodySmall
                )
            }
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = if (isFromCurrentUser) Arrangement.End else Arrangement.Start
        ) {
            // Message bubble
            Box(
                modifier = Modifier
                    .widthIn(max = 280.dp)
                    .clip(
                        RoundedCornerShape(
                            topStart = 16.dp,
                            topEnd = 16.dp,
                            bottomStart = if (isFromCurrentUser) 16.dp else 4.dp,
                            bottomEnd = if (isFromCurrentUser) 4.dp else 16.dp
                        )
                    )
                    .background(
                        if (isFromCurrentUser) Color(0xFF1DA1F2)
                        else Color(0xFF333333)
                    )
                    .padding(12.dp)
            ) {
                Column {
                    // Message content
                    Text(
                        text = message.content,
                        color = Color.White
                    )


                }
            }
        }

        // Row for timestamp and send status
        Row(
            modifier = Modifier.padding(top = 2.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Timestamp
            Text(
                text = formatMessageTime(message.timestamp),
                style = MaterialTheme.typography.bodySmall,
                color = Color.Gray
            )

            // Show send status for current user's messages
            if (isFromCurrentUser && sendStatus != null) {
                Spacer(modifier = Modifier.width(4.dp))

                // Status indicator
                when (sendStatus) {
                    "SENDING" -> {
                        CircularProgressIndicator(
                            modifier = Modifier.size(10.dp),
                            color = Color.Gray,
                            strokeWidth = 1.dp
                        )
                    }
                    "SENT" -> {
                        Text(
                            text = "✓",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                    }
                    "DELIVERED" -> {
                        Text(
                            text = "✓✓",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color.Gray
                        )
                    }
                    "READ" -> {
                        Text(
                            text = "✓✓",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF1DA1F2)
                        )
                    }
                    "FAILED", "QUEUED" -> {
                        // Add clickable retry icon for failed or queued messages
                        Icon(
                            imageVector = Icons.Default.Refresh,
                            contentDescription = "Retry",
                            tint = if (sendStatus == "FAILED") Color.Red else Color.Yellow,
                            modifier = Modifier
                                .size(12.dp)
                                .clickable {
                                    // Call retry function in ViewModel
                                    onRetry(message.tempId)
                                }
                        )
                    }
                }
            }
        }
    }
}

fun formatMessageTime(timestamp: String): String {
    return try {
        val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).parse(timestamp)
        SimpleDateFormat("h:mm a", Locale.getDefault()).format(date)
    } catch (e: Exception) {
        "Unknown time"
    }
}

fun formatDateHeader(dateStr: String): String {
    return try {
        val date = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(dateStr)
        val today = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(Date())
        val yesterday = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).format(
            Date(System.currentTimeMillis() - 24 * 60 * 60 * 1000)
        )

        when (dateStr) {
            today -> "Today"
            yesterday -> "Yesterday"
            else -> SimpleDateFormat("MMMM d, yyyy", Locale.getDefault()).format(date)
        }
    } catch (e: Exception) {
        dateStr
    }
}

package com.example.collaboraid.ui.screens.ai

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.SmartToy
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.collaboraid.model.AIMessage
import com.example.collaboraid.ui.components.BottomNavBar
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.AIViewModel
import com.example.collaboraid.ui.viewmodels.AIViewModelFactory
import com.example.collaboraid.util.SessionManager
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AIScreen(
    navController: NavController,
    viewModel: AIViewModel = viewModel(
        factory = AIViewModelFactory(SessionManager(LocalContext.current))
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var messageText by remember { mutableStateOf("") }
    val listState = rememberLazyListState()
    val context = LocalContext.current

    // Check if user is logged in
    LaunchedEffect(Unit) {
        if (!viewModel.isLoggedIn()) {
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.AI.route) { inclusive = true }
            }
        }
    }

    // Scroll to bottom when new messages arrive
    LaunchedEffect(uiState.messages.size) {
        if (uiState.messages.isNotEmpty()) {
            listState.animateScrollToItem(uiState.messages.size - 1)
        }
    }

    // Show error snackbar if needed
    val snackbarHostState = remember { SnackbarHostState() }
    LaunchedEffect(uiState.error) {
        uiState.error?.let {
            snackbarHostState.showSnackbar(
                message = it,
                duration = SnackbarDuration.Short
            )
        }
    }

    Scaffold(
        snackbarHost = { SnackbarHost(snackbarHostState) },
        topBar = {
            TopAppBar(
                title = {
                    Text(
                        "AI Assistant",
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF000000)
                ),
                actions = {
                    IconButton(onClick = { /* Settings */ }) {
                        Icon(
                            imageVector = Icons.Default.Settings,
                            contentDescription = "Settings",
                            tint = Color.White
                        )
                    }
                }
            )
        },
        bottomBar = {
            Column {
                // Message input
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .background(Color(0xFF000000))
                        .padding(horizontal = 16.dp, vertical = 12.dp)
                ) {
                    OutlinedTextField(
                        value = messageText,
                        onValueChange = { messageText = it },
                        placeholder = {
                            Text("Ask the AI assistant...", color = Color.Gray)
                        },
                        modifier = Modifier
                            .fillMaxWidth()
                            .clip(RoundedCornerShape(24.dp)),
                        colors = TextFieldDefaults.colors(
                            focusedTextColor = Color.White,
                            unfocusedTextColor = Color.White,
                            cursorColor = Color.White,
                            focusedContainerColor = Color(0xFF1E1E1E),
                            unfocusedContainerColor = Color(0xFF1E1E1E),
                            focusedIndicatorColor = Color.Transparent,
                            unfocusedIndicatorColor = Color.Transparent
                        ),
                        trailingIcon = {
                            IconButton(
                                onClick = {
                                    if (messageText.isNotBlank() && !uiState.isLoading) {
                                        viewModel.askAI(messageText)
                                        messageText = ""
                                    }
                                },
                                enabled = !uiState.isLoading && messageText.isNotBlank()
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Send,
                                    contentDescription = "Send",
                                    tint = if (!uiState.isLoading && messageText.isNotBlank())
                                        Color(0xFF1D9BF0) else Color.Gray
                                )
                            }
                        },
                        maxLines = 3,
                        enabled = !uiState.isLoading,
                        shape = RoundedCornerShape(24.dp)
                    )
                }

                // Bottom navigation
                BottomNavBar(navController = navController)
            }
        },
        containerColor = Color(0xFF000000)
    ) { paddingValues ->
        // Messages list
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp),
            state = listState,
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Spacer(modifier = Modifier.height(8.dp))
            }

            // Welcome message
            if (uiState.messages.isEmpty()) {
                item {
                    Column(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.SmartToy,
                            contentDescription = "AI",
                            tint = Color(0xFF1D9BF0),
                            modifier = Modifier.size(48.dp)
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        Text(
                            text = "CollaborAid AI Assistant",
                            color = Color.White,
                            fontSize = 24.sp,
                            fontWeight = FontWeight.Bold
                        )

                        Spacer(modifier = Modifier.height(8.dp))

                        Text(
                            text = "How can I help you today?",
                            color = Color.Gray,
                            fontSize = 16.sp
                        )

                        Spacer(modifier = Modifier.height(24.dp))

                        // Suggested prompts
                        SuggestedPrompt("How do I find help with my task?") {
                            messageText = "How do I find help with my task?"
                            viewModel.askAI(messageText)
                            messageText = ""
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        SuggestedPrompt("Tips for writing a good task description") {
                            messageText = "Tips for writing a good task description"
                            viewModel.askAI(messageText)
                            messageText = ""
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        SuggestedPrompt("How to rate completed tasks?") {
                            messageText = "How to rate completed tasks?"
                            viewModel.askAI(messageText)
                            messageText = ""
                        }
                    }
                }
            }

            items(uiState.messages) { message ->
                // User message
                if (message.userMessage.isNotBlank()) {
                    AIMessageItem(
                        message = message,
                        isFromUser = true
                    )
                }

                // AI response
                if (message.aiResponse.isNotBlank()) {
                    AIMessageItem(
                        message = message,
                        isFromUser = false
                    )
                }
            }

            item {
                if (uiState.isLoading) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(8.dp),
                        horizontalArrangement = Arrangement.Start
                    ) {
                        CircularProgressIndicator(
                            modifier = Modifier.size(24.dp),
                            color = Color(0xFF1D9BF0),
                            strokeWidth = 2.dp
                        )
                    }
                }
            }

            item {
                Spacer(modifier = Modifier.height(16.dp))
            }
        }
    }
}

@Composable
fun SuggestedPrompt(text: String, onClick: () -> Unit) {
    Button(
        onClick = onClick,
        modifier = Modifier
            .fillMaxWidth()
            .padding(horizontal = 16.dp),
        shape = RoundedCornerShape(16.dp),
        colors = ButtonDefaults.buttonColors(
            containerColor = Color(0xFF1E1E1E),
            contentColor = Color.White
        )
    ) {
        Text(
            text = text,
            modifier = Modifier.padding(8.dp)
        )
    }
}

@Composable
fun AIMessageItem(
    message: AIMessage,
    isFromUser: Boolean
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 4.dp),
        horizontalArrangement = if (isFromUser) Arrangement.End else Arrangement.Start
    ) {
        if (!isFromUser) {
            // AI icon
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF1D9BF0))
                    .align(Alignment.Top),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Outlined.SmartToy,
                    contentDescription = "AI",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }

            Spacer(modifier = Modifier.width(8.dp))
        }

        Column(
            horizontalAlignment = if (isFromUser) Alignment.End else Alignment.Start,
            modifier = Modifier.widthIn(max = 280.dp)
        ) {
            // Message bubble
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = if (isFromUser) Color(0xFF1D9BF0) else Color(0xFF2A2A2A),
                modifier = Modifier.padding(end = if (isFromUser) 0.dp else 48.dp)
            ) {
                Text(
                    text = if (isFromUser) message.userMessage else message.aiResponse,
                    color = if (isFromUser) Color.White else Color.White,
                    modifier = Modifier.padding(12.dp)
                )
            }

            Spacer(modifier = Modifier.height(4.dp))

            // Timestamp
            val timestamp = if (message.timestamp.isEmpty()) {
                SimpleDateFormat("h:mm a", Locale.getDefault()).format(Date())
            } else {
                message.timestamp
            }

            Text(
                text = timestamp,
                color = Color.Gray,
                fontSize = 12.sp
            )
        }

        if (isFromUser) {
            Spacer(modifier = Modifier.width(8.dp))

            // User icon
            Box(
                modifier = Modifier
                    .size(36.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF2A2A2A))
                    .align(Alignment.Top),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = Icons.Default.Person,
                    contentDescription = "User",
                    tint = Color.White,
                    modifier = Modifier.size(20.dp)
                )
            }
        }
    }
}

package com.example.collaboraid.ui.screens.messages

import android.util.Log
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Edit
import androidx.compose.material.icons.filled.KeyboardArrowDown
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.outlined.CameraAlt
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Tab
import androidx.compose.material3.TabRow
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.collaboraid.model.User
import com.example.collaboraid.ui.components.BottomNavBar
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.ConversationPreview
import com.example.collaboraid.ui.viewmodels.MessagesViewModel
import com.example.collaboraid.ui.viewmodels.MessagesViewModelFactory
import com.example.collaboraid.util.SessionManager

private const val TAG = "MessagesScreen"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MessagesScreen(
    navController: NavController,
    viewModel: MessagesViewModel = viewModel(
        factory = MessagesViewModelFactory(SessionManager(LocalContext.current))
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTabIndex by remember { mutableStateOf(0) }
    val tabs = listOf("Messages", "Requests")

    // Check if user is logged in
    LaunchedEffect(Unit) {
        Log.d(TAG, "Checking if user is logged in")
        if (!viewModel.isLoggedIn()) {
            Log.d(TAG, "User not logged in, navigating to login screen")
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Messages.route) { inclusive = true }
            }
        } else {
            Log.d(TAG, "User is logged in, loading conversations")
            viewModel.loadConversations()
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF000000) // Black background
    ) {
        Scaffold(
            containerColor = Color(0xFF000000),
            topBar = {
                Column {
                    TopAppBar(
                        title = {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = uiState.username,
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                                Icon(
                                    imageVector = Icons.Default.KeyboardArrowDown,
                                    contentDescription = "Dropdown",
                                    tint = Color.White,
                                    modifier = Modifier.padding(start = 4.dp)
                                )
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
                            // Add refresh button
                            IconButton(onClick = { viewModel.loadConversations() }) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Refresh",
                                    tint = Color.White
                                )
                            }
                            IconButton(onClick = { /* Open new message */ }) {
                                Icon(
                                    imageVector = Icons.Default.Edit,
                                    contentDescription = "New Message",
                                    tint = Color.White
                                )
                            }
                        },
                        colors = TopAppBarDefaults.topAppBarColors(
                            containerColor = Color(0xFF000000),
                            titleContentColor = Color.White
                        )
                    )

                    // Tab row
                    TabRow(
                        selectedTabIndex = selectedTabIndex,
                        containerColor = Color(0xFF000000),
                        contentColor = Color.White
                    ) {
                        tabs.forEachIndexed { index, title ->
                            Tab(
                                selected = selectedTabIndex == index,
                                onClick = { selectedTabIndex = index },
                                text = {
                                    Text(
                                        text = title,
                                        fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal
                                    )
                                }
                            )
                        }
                    }
                }
            },
            bottomBar = {
                BottomNavBar(navController = navController)
            }
        ) { paddingValues ->
            if (selectedTabIndex == 0) {
                // Messages tab
                if (uiState.isLoading) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center
                    ) {
                        androidx.compose.material3.CircularProgressIndicator(
                            color = Color(0xFF1DA1F2)
                        )
                    }
                } else if (uiState.error != null) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center
                    ) {
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "Error: ${uiState.error}",
                                color = Color.Red,
                                modifier = Modifier.padding(16.dp)
                            )
                            IconButton(
                                onClick = { viewModel.loadConversations() }
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Refresh,
                                    contentDescription = "Retry",
                                    tint = Color.White
                                )
                            }
                        }
                    }
                } else if (uiState.conversations.isEmpty()) {
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "No messages yet",
                            color = Color.Gray
                        )
                    }
                } else {
                    LazyColumn(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(paddingValues)
                    ) {
                        items(uiState.conversations) { conversation ->
                            MessageItem(
                                conversation = conversation,
                                onClick = {
                                    navController.navigate("${Screen.Conversation.route}/${conversation.user.id}")
                                }
                            )
                        }
                    }
                }
            } else {
                // Requests tab (empty for now)
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = "No message requests",
                        color = Color.Gray
                    )
                }
            }
        }
    }
}

@Composable
fun MessageItem(
    conversation: ConversationPreview,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
            .padding(horizontal = 16.dp, vertical = 12.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        // Profile picture with colorful border if has unread
        Box(
            modifier = Modifier
                .size(56.dp)
                .clip(CircleShape)
                .then(
                    if (conversation.hasUnread) {
                        Modifier.border(
                            width = 2.dp,
                            brush = Brush.linearGradient(
                                colors = listOf(
                                    Color(0xFFFF0000),
                                    Color(0xFFFF8000),
                                    Color(0xFFFFFF00),
                                    Color(0xFF00FF00),
                                    Color(0xFF00FFFF),
                                    Color(0xFF0000FF),
                                    Color(0xFFFF00FF)
                                )
                            ),
                            shape = CircleShape
                        )
                    } else {
                        Modifier
                    }
                )
                .padding(if (conversation.hasUnread) 2.dp else 0.dp),
            contentAlignment = Alignment.Center
        ) {
            AsyncImage(
                model = "https://ui-avatars.com/api/?name=${conversation.user.username}&background=random",
                contentDescription = "Profile picture",
                modifier = Modifier
                    .size(52.dp)
                    .clip(CircleShape),
                contentScale = ContentScale.Crop
            )
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Message info
        Column(
            modifier = Modifier.weight(1f)
        ) {
            Text(
                text = conversation.user.username,
                style = MaterialTheme.typography.bodyLarge,
                fontWeight = FontWeight.Bold,
                color = Color.White
            )

            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = conversation.lastMessage,
                    style = MaterialTheme.typography.bodyMedium,
                    color = if (conversation.hasUnread) Color.White else Color.Gray,
                    maxLines = 1,
                    overflow = TextOverflow.Ellipsis,
                    modifier = Modifier.weight(1f, fill = false)
                )

                Text(
                    text = " · ${conversation.timestamp}",
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray
                )
            }
        }

        Spacer(modifier = Modifier.width(12.dp))

        // Camera icon
        IconButton(
            onClick = { /* Open camera */ },
            modifier = Modifier.size(40.dp)
        ) {
            Icon(
                imageVector = Icons.Outlined.CameraAlt,
                contentDescription = "Camera",
                tint = Color.Gray
            )
        }

        // Unread indicator
        if (conversation.hasUnread) {
            Spacer(modifier = Modifier.width(8.dp))
            Box(
                modifier = Modifier
                    .size(8.dp)
                    .background(Color(0xFF0095F6), CircleShape)
            )
        }
    }

    Divider(
        color = Color(0xFF222222),
        thickness = 0.5.dp,
        modifier = Modifier.padding(start = 84.dp)
    )
}

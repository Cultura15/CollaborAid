package com.example.collaboraid.ui.screens.notifications

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.collaboraid.model.Notification
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.NotificationsViewModel
import com.example.collaboraid.ui.viewmodels.NotificationsViewModelFactory
import com.example.collaboraid.util.SessionManager
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun NotificationsScreen(
    navController: NavController,
    viewModel: NotificationsViewModel = viewModel(
        factory = NotificationsViewModelFactory(SessionManager(LocalContext.current))
    )
) {
    val uiState by viewModel.uiState.collectAsState()

    // Check if user is logged in
    LaunchedEffect(Unit) {
        if (!viewModel.isLoggedIn()) {
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Notifications.route) { inclusive = true }
            }
        } else {
            viewModel.loadNotifications()
        }
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Notifications") },
                navigationIcon = {
                    IconButton(onClick = { navController.popBackStack() }) {
                        Icon(
                            imageVector = Icons.Default.ArrowBack,
                            contentDescription = "Back",
                            tint = Color.White
                        )
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = Color(0xFF000000),
                    titleContentColor = Color.White,
                    navigationIconContentColor = Color.White
                ),
                actions = {
                    // Clear all button
                    TextButton(
                        onClick = {
                            viewModel.clearAllNotifications()
                        },
                        colors = ButtonDefaults.textButtonColors(
                            contentColor = Color(0xFF1DA1F2)
                        )
                    ) {
                        Text("Clear all")
                    }
                }
            )
        },
        containerColor = Color(0xFF000000)
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(Color(0xFF000000))
        ) {
            if (uiState.isLoading) {
                CircularProgressIndicator(
                    modifier = Modifier.align(Alignment.Center),
                    color = Color(0xFF1DA1F2)
                )
            } else if (uiState.error != null) {
                Column(
                    modifier = Modifier.align(Alignment.Center),
                    horizontalAlignment = Alignment.CenterHorizontally
                ) {
                    Text(
                        text = uiState.error ?: "An error occurred",
                        color = Color.Red
                    )
                    Spacer(modifier = Modifier.height(16.dp))
                    Button(
                        onClick = { viewModel.loadNotifications() },
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF1DA1F2)
                        )
                    ) {
                        Text("Retry")
                    }
                }
            } else if (uiState.notifications.isEmpty()) {
                Text(
                    text = "No notifications",
                    modifier = Modifier.align(Alignment.Center),
                    color = Color.Gray
                )
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(horizontal = 16.dp)
                ) {
                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                    }

                    items(uiState.notifications) { notification ->
                        NotificationItem(
                            notification = notification,
                            onClick = {
                                // Mark as read when notification is clicked
                                viewModel.markNotificationAsRead(notification.id)

                                // Navigate based on notification type
                                when (notification.type) {
                                    "TASK_ACCEPTED", "TASK_DONE_REQUESTED", "TASK_DONE_CONFIRMED" -> {
                                        notification.taskId?.let { taskId ->
                                            navController.navigate("task_progress/${taskId}?isPosted=true")
                                        }
                                    }
                                    "NEW_MESSAGE" -> {
                                        notification.userId?.let { userId ->
                                            navController.navigate("${Screen.Conversation.route}/$userId")
                                        }
                                    }
                                    else -> {
                                        // Default navigation to feed
                                        navController.navigate(Screen.Feed.route)
                                    }
                                }
                            },
                            onDelete = {
                                viewModel.deleteNotification(notification.id)
                            }
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                    }

                    item {
                        Spacer(modifier = Modifier.height(16.dp))
                    }
                }
            }
        }
    }
}

@Composable
fun NotificationItem(
    notification: Notification,
    onClick: () -> Unit,
    onDelete: () -> Unit
) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRead) Color(0xFF121212) else Color(0xFF1A1A1A)
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            // Notification icon
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .clip(CircleShape)
                    .background(Color(0xFF1DA1F2)),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = when (notification.type) {
                        "TASK_ACCEPTED" -> Icons.Default.Person
                        "TASK_COMPLETED", "TASK_DONE_REQUESTED", "TASK_DONE_CONFIRMED" -> Icons.Default.CheckCircle
                        "NEW_MESSAGE" -> Icons.Default.Message
                        else -> Icons.Default.Notifications
                    },
                    contentDescription = "Notification Icon",
                    tint = Color.White
                )
            }

            Spacer(modifier = Modifier.width(16.dp))

            // Notification content
            Column(
                modifier = Modifier.weight(1f)
            ) {
                // If title is empty, use a default based on type
                val displayTitle = if (notification.title.isNotEmpty()) {
                    notification.title
                } else {
                    when (notification.type) {
                        "TASK_ACCEPTED" -> "Task Accepted"
                        "TASK_DONE_REQUESTED" -> "Task Completion Requested"
                        "TASK_DONE_CONFIRMED" -> "Task Completed"
                        "NEW_MESSAGE" -> "New Message"
                        else -> "Notification"
                    }
                }

                Text(
                    text = displayTitle,
                    style = MaterialTheme.typography.bodyLarge,
                    fontWeight = FontWeight.Bold,
                    color = Color.White
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = notification.message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = Color.Gray,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = formatNotificationTime(notification.timestamp),
                    style = MaterialTheme.typography.bodySmall,
                    color = Color.Gray
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            // Delete button
            IconButton(
                onClick = onDelete
            ) {
                Icon(
                    imageVector = Icons.Default.Delete,
                    contentDescription = "Delete",
                    tint = Color.Gray
                )
            }
        }
    }
}

fun formatNotificationTime(timestamp: String): String {
    return try {
        val date = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault()).parse(timestamp)
        val now = Calendar.getInstance()
        val notificationTime = Calendar.getInstance()
        notificationTime.time = date

        when {
            // Today
            now.get(Calendar.DATE) == notificationTime.get(Calendar.DATE) &&
                    now.get(Calendar.MONTH) == notificationTime.get(Calendar.MONTH) &&
                    now.get(Calendar.YEAR) == notificationTime.get(Calendar.YEAR) -> {
                SimpleDateFormat("h:mm a", Locale.getDefault()).format(date)
            }
            // Yesterday
            now.get(Calendar.DATE) - notificationTime.get(Calendar.DATE) == 1 &&
                    now.get(Calendar.MONTH) == notificationTime.get(Calendar.MONTH) &&
                    now.get(Calendar.YEAR) == notificationTime.get(Calendar.YEAR) -> {
                "Yesterday at ${SimpleDateFormat("h:mm a", Locale.getDefault()).format(date)}"
            }
            // This week
            now.get(Calendar.WEEK_OF_YEAR) == notificationTime.get(Calendar.WEEK_OF_YEAR) &&
                    now.get(Calendar.YEAR) == notificationTime.get(Calendar.YEAR) -> {
                SimpleDateFormat("EEEE", Locale.getDefault()).format(date)
            }
            // This year
            now.get(Calendar.YEAR) == notificationTime.get(Calendar.YEAR) -> {
                SimpleDateFormat("MMM d", Locale.getDefault()).format(date)
            }
            // Older
            else -> {
                SimpleDateFormat("MMM d, yyyy", Locale.getDefault()).format(date)
            }
        }
    } catch (e: Exception) {
        "Unknown time"
    }
}

// Icons that were missing
object Icons {
    object Default {
        val CheckCircle = androidx.compose.material.icons.Icons.Default.CheckCircle
        val Message = androidx.compose.material.icons.Icons.Default.Message
        val Person = androidx.compose.material.icons.Icons.Default.Person
        val Notifications = androidx.compose.material.icons.Icons.Default.Notifications
    }
}

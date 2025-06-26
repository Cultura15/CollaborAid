package com.example.collaboraid.ui.screens.task

import androidx.compose.foundation.background
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
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.MoreVert
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.collaboraid.model.Task
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.TaskProgressViewModel
import com.example.collaboraid.ui.viewmodels.TaskProgressViewModelFactory
import com.example.collaboraid.util.RichTextUtil
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun TaskProgressScreen(
    taskId: Long,
    isPosted: Boolean,
    navController: NavController,
    viewModel: TaskProgressViewModel = viewModel(
        factory = TaskProgressViewModelFactory(SessionManager(LocalContext.current), taskId, isPosted)
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var showRequestDoneDialog by remember { mutableStateOf(false) }
    var showConfirmDoneDialog by remember { mutableStateOf(false) }
    val snackbarHostState = remember { SnackbarHostState() }

    // Check if user is logged in
    LaunchedEffect(Unit) {
        if (!viewModel.isLoggedIn()) {
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Feed.route) { inclusive = true }
            }
        } else {
            viewModel.loadTask()
        }
    }

    // Handle task status changes
    LaunchedEffect(uiState.taskStatusChanged) {
        if (uiState.taskStatusChanged) {
            // Reload the task to get the updated status
            viewModel.loadTask()
        }
    }

    // Handle success message and navigation
    LaunchedEffect(uiState.successMessage, uiState.shouldNavigateBack) {
        uiState.successMessage?.let { message ->
            snackbarHostState.showSnackbar(message)
            // Add a small delay to allow the user to see the message
            delay(1500)
            if (uiState.shouldNavigateBack) {
                navController.popBackStack()
                viewModel.resetNavigation()
            }
        }
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF000000) // Black background
    ) {
        Scaffold(
            containerColor = Color(0xFF000000),
            snackbarHost = { SnackbarHost(snackbarHostState) },
            topBar = {
                TopAppBar(
                    title = { Text("Task Progress") },
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
                        IconButton(onClick = { /* Share */ }) {
                            Icon(
                                imageVector = Icons.Outlined.Share,
                                contentDescription = "Share",
                                tint = Color.White
                            )
                        }
                        IconButton(onClick = { /* More options */ }) {
                            Icon(
                                imageVector = Icons.Default.MoreVert,
                                contentDescription = "More",
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
            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = Color(0xFF1DA1F2))
                }
            } else if (uiState.error != null) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = uiState.error ?: "An error occurred",
                        color = Color.Red,
                        modifier = Modifier.padding(16.dp)
                    )
                }
            } else {
                LazyColumn(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(paddingValues)
                        .padding(horizontal = 16.dp)
                ) {
                    item {
                        // User info
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            modifier = Modifier.padding(vertical = 16.dp)
                        ) {
                            // Profile picture
                            Box(
                                modifier = Modifier
                                    .size(48.dp)
                                    .clip(CircleShape)
                                    .background(Color.DarkGray),
                                contentAlignment = Alignment.Center
                            ) {
                                uiState.task?.user?.let { user ->
                                    AsyncImage(
                                        model = "https://ui-avatars.com/api/?name=${user.username}&background=random",
                                        contentDescription = "Profile picture",
                                        modifier = Modifier.size(48.dp),
                                        contentScale = ContentScale.Crop
                                    )
                                }
                            }

                            Spacer(modifier = Modifier.width(12.dp))

                            // Username and timestamp
                            Column {
                                Text(
                                    text = uiState.task?.user?.username ?: "Unknown User",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = Color.White
                                )
                                Text(
                                    text = "@${uiState.task?.user?.username?.lowercase()?.replace(" ", "") ?: "unknown"}",
                                    style = MaterialTheme.typography.bodySmall,
                                    color = Color.Gray
                                )
                            }

                            Spacer(modifier = Modifier.weight(1f))

                            // Status chip
                            Box(
                                modifier = Modifier
                                    .clip(RoundedCornerShape(16.dp))
                                    .background(
                                        when (uiState.task?.status) {
                                            "Open" -> Color(0xFF4CAF50).copy(alpha = 0.2f)
                                            "In Progress" -> Color(0xFFFFC107).copy(alpha = 0.2f)
                                            "Done" -> Color(0xFF2196F3).copy(alpha = 0.2f)
                                            "Pending Verification" -> Color(0xFFFF9800).copy(alpha = 0.2f)
                                            else -> Color(0xFF2196F3).copy(alpha = 0.2f)
                                        }
                                    )
                                    .padding(horizontal = 12.dp, vertical = 6.dp)
                            ) {
                                Text(
                                    text = uiState.task?.status ?: "Unknown",
                                    style = MaterialTheme.typography.labelMedium,
                                    color = when (uiState.task?.status) {
                                        "Open" -> Color(0xFF4CAF50)
                                        "In Progress" -> Color(0xFFFFC107)
                                        "Done" -> Color(0xFF2196F3)
                                        "Pending Verification" -> Color(0xFFFF9800)
                                        else -> Color(0xFF2196F3)
                                    }
                                )
                            }
                        }

                        // Get formatting information from local storage
                        val context = LocalContext.current
                        val (titleSegments, descriptionSegments) = uiState.task?.id?.let {
                            RichTextUtil.loadFormattedTextSegments(it, context)
                        } ?: Pair(emptyList(), emptyList())

                        // Task title
                        if (titleSegments.isNotEmpty()) {
                            Text(
                                text = RichTextUtil.buildAnnotatedString(titleSegments),
                                style = MaterialTheme.typography.headlineSmall,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        } else {
                            Text(
                                text = uiState.task?.title ?: "",
                                style = MaterialTheme.typography.headlineSmall,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                        }

                        Spacer(modifier = Modifier.height(8.dp))

                        // Task description
                        if (descriptionSegments.isNotEmpty()) {
                            Text(
                                text = RichTextUtil.buildAnnotatedString(descriptionSegments),
                                style = MaterialTheme.typography.bodyLarge,
                                color = Color.LightGray
                            )
                        } else {
                            Text(
                                text = uiState.task?.description ?: "",
                                style = MaterialTheme.typography.bodyLarge,
                                color = Color.LightGray
                            )
                        }

                        // Display image if available
                        uiState.task?.id?.let { taskId ->
                            val imageUri = RichTextUtil.getImageForTask(taskId, context)
                            imageUri?.let { uri ->
                                Spacer(modifier = Modifier.height(12.dp))
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(200.dp)
                                        .clip(RoundedCornerShape(8.dp))
                                        .background(Color(0xFF1E1E1E))
                                ) {
                                    AsyncImage(
                                        model = uri,
                                        contentDescription = "Task Image",
                                        modifier = Modifier.fillMaxSize(),
                                        contentScale = ContentScale.Fit
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Progress section
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF121212))
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "Progress",
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Progress bar
                            val progress = when (uiState.task?.status) {
                                "Open" -> 0.0f
                                "In Progress" -> 0.5f
                                "Pending Verification" -> 0.8f
                                "Done" -> 1.0f
                                else -> 0.0f
                            }

                            LinearProgressIndicator(
                                progress = { progress },
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(8.dp)
                                    .clip(RoundedCornerShape(4.dp)),
                                color = Color(0xFF1DA1F2),
                                trackColor = Color(0xFF333333)
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Progress steps
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                ProgressStep(
                                    title = "Open",
                                    isCompleted = true,
                                    isActive = uiState.task?.status == "Open"
                                )

                                ProgressStep(
                                    title = "In Progress",
                                    isCompleted = uiState.task?.status == "In Progress" ||
                                            uiState.task?.status == "Pending Verification" ||
                                            uiState.task?.status == "Done",
                                    isActive = uiState.task?.status == "In Progress"
                                )

                                ProgressStep(
                                    title = "Verification",
                                    isCompleted = uiState.task?.status == "Pending Verification" ||
                                            uiState.task?.status == "Done",
                                    isActive = uiState.task?.status == "Pending Verification"
                                )

                                ProgressStep(
                                    title = "Done",
                                    isCompleted = uiState.task?.status == "Done",
                                    isActive = uiState.task?.status == "Done"
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Action buttons based on task status and user role
                        if (uiState.task?.status == "In Progress") {
                            // Check if the current user is the one who accepted the task
                            if (!isPosted) {
                                // User is the one who accepted the task
                                Button(
                                    onClick = { showRequestDoneDialog = true },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(50),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF1DA1F2)
                                    )
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = "Request Done",
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Request to Mark as Done",
                                        modifier = Modifier.padding(vertical = 8.dp)
                                    )
                                }
                            }
                        } else if (uiState.task?.status == "Pending Verification") {
                            // Check who requested the task to be marked as done
                            val markedDoneBy = uiState.task?.markedDoneBy
                            val currentUserId = viewModel.getCurrentUserId()

                            // If the current user is NOT the one who requested to mark as done
                            if (markedDoneBy != null && markedDoneBy != currentUserId) {
                                Button(
                                    onClick = { showConfirmDoneDialog = true },
                                    modifier = Modifier.fillMaxWidth(),
                                    shape = RoundedCornerShape(50),
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = Color(0xFF4CAF50)
                                    )
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Confirm Done",
                                        modifier = Modifier.size(20.dp)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Confirm Task Completion",
                                        modifier = Modifier.padding(vertical = 8.dp)
                                    )
                                }
                            } else {
                                // User is waiting for confirmation
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .clip(RoundedCornerShape(50))
                                        .background(Color(0xFF333333))
                                        .padding(vertical = 16.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "Waiting for confirmation",
                                        color = Color.White
                                    )
                                }
                            }
                        } else if (uiState.task?.status == "Done") {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .clip(RoundedCornerShape(50))
                                    .background(Color(0xFF4CAF50).copy(alpha = 0.2f))
                                    .padding(vertical = 16.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Done",
                                        tint = Color(0xFF4CAF50)
                                    )
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text(
                                        text = "Task Completed Successfully",
                                        color = Color(0xFF4CAF50),
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            }
                        }

                        Spacer(modifier = Modifier.height(16.dp))

                        // Message button - only show if the current user is not the creator of the task
                        // or if the task has been accepted by someone else
                        val shouldShowMessageButton = if (isPosted) {
                            // If current user is the task creator, only show message button if task is accepted
                            uiState.task?.acceptedBy != null
                        } else {
                            // If current user is the acceptor, always show message button to contact creator
                            true
                        }

                        if (shouldShowMessageButton) {
                            OutlinedButton(
                                onClick = {
                                    // Navigate to conversation with the other party
                                    val otherUserId = if (isPosted) {
                                        uiState.task?.acceptedBy?.id
                                    } else {
                                        uiState.task?.user?.id
                                    }

                                    otherUserId?.let {
                                        navController.navigate("${Screen.Conversation.route}/$it")
                                    }
                                },
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(50),
                                colors = ButtonDefaults.outlinedButtonColors(
                                    contentColor = Color.White
                                )
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Message,
                                    contentDescription = "Message",
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = "Message ${if (isPosted) "Helper" else "Creator"}",
                                    modifier = Modifier.padding(vertical = 8.dp)
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(24.dp))

                        // Task details
                        Column(
                            modifier = Modifier
                                .fillMaxWidth()
                                .clip(RoundedCornerShape(12.dp))
                                .background(Color(0xFF121212))
                                .padding(16.dp)
                        ) {
                            Text(
                                text = "Task Details",
                                style = MaterialTheme.typography.titleMedium,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )

                            Spacer(modifier = Modifier.height(16.dp))

                            // Category
                            DetailRow(
                                label = "Category",
                                value = uiState.task?.category ?: "General"
                            )

                            Divider(
                                color = Color(0xFF333333),
                                modifier = Modifier.padding(vertical = 12.dp)
                            )

                            // Posted by
                            DetailRow(
                                label = "Posted by",
                                value = uiState.task?.user?.username ?: "Unknown"
                            )

                            Divider(
                                color = Color(0xFF333333),
                                modifier = Modifier.padding(vertical = 12.dp)
                            )

                            // Accepted by
                            DetailRow(
                                label = "Accepted by",
                                value = uiState.task?.acceptedBy?.username ?: "Not accepted yet"
                            )

                            if (uiState.task?.status == "Done") {
                                Divider(
                                    color = Color(0xFF333333),
                                    modifier = Modifier.padding(vertical = 12.dp)
                                )

                                // Completed on
                                DetailRow(
                                    label = "Completed on",
                                    value = "Today" // In a real app, use actual completion date
                                )
                            }
                        }

                        Spacer(modifier = Modifier.height(32.dp))
                    }
                }
            }

            // Request Done Dialog
            if (showRequestDoneDialog) {
                AlertDialog(
                    onDismissRequest = { showRequestDoneDialog = false },
                    containerColor = Color(0xFF212121),
                    title = {
                        Text(
                            text = "Request to Mark as Done",
                            color = Color.White,
                            style = MaterialTheme.typography.titleLarge
                        )
                    },
                    text = {
                        Text(
                            text = "Are you sure you want to mark this task as done? This will notify the task creator to verify your work.",
                            color = Color.LightGray
                        )
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                viewModel.requestMarkAsDone()
                                showRequestDoneDialog = false
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF1DA1F2)
                            )
                        ) {
                            Text("Request Done")
                        }
                    },
                    dismissButton = {
                        OutlinedButton(
                            onClick = { showRequestDoneDialog = false },
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color.White
                            )
                        ) {
                            Text("Cancel")
                        }
                    }
                )
            }

            // Confirm Done Dialog
            if (showConfirmDoneDialog) {
                AlertDialog(
                    onDismissRequest = { showConfirmDoneDialog = false },
                    containerColor = Color(0xFF212121),
                    title = {
                        Text(
                            text = "Confirm Task Completion",
                            color = Color.White,
                            style = MaterialTheme.typography.titleLarge
                        )
                    },
                    text = {
                        Text(
                            text = "Are you satisfied with the work done? Confirming will mark the task as completed and close it.",
                            color = Color.LightGray
                        )
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                viewModel.confirmTaskDone()
                                showConfirmDoneDialog = false
                            },
                            colors = ButtonDefaults.buttonColors(
                                containerColor = Color(0xFF4CAF50)
                            )
                        ) {
                            Text("Confirm Completion")
                        }
                    },
                    dismissButton = {
                        OutlinedButton(
                            onClick = { showConfirmDoneDialog = false },
                            colors = ButtonDefaults.outlinedButtonColors(
                                contentColor = Color.White
                            )
                        ) {
                            Text("Cancel")
                        }
                    }
                )
            }
        }
    }
}

@Composable
fun ProgressStep(
    title: String,
    isCompleted: Boolean,
    isActive: Boolean
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier
                .size(24.dp)
                .clip(CircleShape)
                .background(
                    when {
                        isCompleted -> Color(0xFF1DA1F2)
                        isActive -> Color(0xFF1DA1F2).copy(alpha = 0.5f)
                        else -> Color(0xFF333333)
                    }
                ),
            contentAlignment = Alignment.Center
        ) {
            if (isCompleted) {
                Icon(
                    imageVector = Icons.Default.Check,
                    contentDescription = null,
                    tint = Color.White,
                    modifier = Modifier.size(16.dp)
                )
            }
        }

        Spacer(modifier = Modifier.height(4.dp))

        Text(
            text = title,
            style = MaterialTheme.typography.bodySmall,
            color = when {
                isCompleted || isActive -> Color.White
                else -> Color.Gray
            },
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun DetailRow(
    label: String,
    value: String
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = MaterialTheme.typography.bodyMedium,
            color = Color.Gray
        )

        Text(
            text = value,
            style = MaterialTheme.typography.bodyMedium,
            color = Color.White,
            fontWeight = FontWeight.Medium
        )
    }
}

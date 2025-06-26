package com.example.collaboraid.ui.screens.profile

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.composed
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.layout.positionInRoot
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.collaboraid.model.Task
import com.example.collaboraid.ui.components.BottomNavBar
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.ProfileViewModel
import com.example.collaboraid.ui.viewmodels.ProfileViewModelFactory
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ProfileScreen(
    navController: NavController,
    viewModel: ProfileViewModel = viewModel(
        factory = ProfileViewModelFactory(SessionManager(LocalContext.current))
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTabIndex by remember { mutableStateOf(0) }
    val tabs = listOf("Posted Tasks", "Accepted Tasks", "Done Tasks")
    var showNotifications by remember { mutableStateOf(false) }
    var showLogoutDialog by remember { mutableStateOf(false) }

    // Check if user is logged in
    LaunchedEffect(Unit) {
        if (!viewModel.isLoggedIn()) {
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Profile.route) { inclusive = true }
            }
        } else {
            viewModel.loadUserProfile()
            viewModel.loadPostedTasks()
            viewModel.loadAcceptedTasks()
            viewModel.loadDoneTasks()
            viewModel.loadNotifications()
        }
    }

    // Auto refresh tasks periodically
    LaunchedEffect(Unit) {
        while (true) {
            delay(30000) // Refresh every 30 seconds
            when (selectedTabIndex) {
                0 -> viewModel.loadPostedTasks()
                1 -> viewModel.loadAcceptedTasks()
                2 -> viewModel.loadDoneTasks()
            }
            viewModel.loadNotifications()
        }
    }

    // Handle logout
    LaunchedEffect(uiState.isLoggedOut) {
        if (uiState.isLoggedOut) {
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Profile.route) { inclusive = true }
            }
        }
    }

    // Logout confirmation dialog
    if (showLogoutDialog) {
        AlertDialog(
            onDismissRequest = { showLogoutDialog = false },
            title = { Text("Logout Confirmation") },
            text = { Text("Are you sure you want to logout?") },
            confirmButton = {
                Button(
                    onClick = {
                        showLogoutDialog = false
                        viewModel.logout()
                    },
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF1DA1F2)
                    )
                ) {
                    Text("Logout")
                }
            },
            dismissButton = {
                OutlinedButton(
                    onClick = { showLogoutDialog = false }
                ) {
                    Text("Cancel")
                }
            },
            containerColor = Color(0xFF121212),
            titleContentColor = Color.White,
            textContentColor = Color.White
        )
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF000000) // Black background
    ) {
        Scaffold(
            containerColor = Color(0xFF000000),
            topBar = {
                TopAppBar(
                    title = { Text("Profile") },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xFF000000),
                        titleContentColor = Color.White,
                        actionIconContentColor = Color.White
                    ),
                    actions = {
                        // Notifications
                        BadgedBox(
                            badge = {
                                if (uiState.notifications.any { !it.isRead }) {
                                    Badge {
                                        Text(text = uiState.notifications.count { !it.isRead }.toString())
                                    }
                                }
                            }
                        ) {
                            IconButton(onClick = {
                                // Navigate to notifications screen
                                navController.navigate(Screen.Notifications.route)
                            }) {
                                Icon(
                                    imageVector = Icons.Default.Notifications,
                                    contentDescription = "Notifications"
                                )
                            }
                        }

                        // Logout - now shows confirmation dialog
                        IconButton(onClick = { showLogoutDialog = true }) {
                            Icon(
                                imageVector = Icons.Default.ExitToApp,
                                contentDescription = "Logout"
                            )
                        }
                    }
                )
            },
            bottomBar = {
                BottomNavBar(navController = navController)
            }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
            ) {
                // Profile header
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalAlignment = Alignment.Start
                ) {
                    // Profile picture and edit button - rearranged to have profile pic on left
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        // Profile picture - now on the left
                        Box(
                            modifier = Modifier
                                .size(80.dp)
                                .clip(CircleShape)
                                .border(2.dp, Color(0xFF1DA1F2), CircleShape)
                                .background(Color(0xFF121212)),
                            contentAlignment = Alignment.Center
                        ) {
                            // Use profile picture if available, otherwise use avatar
                            if (uiState.profilePicture != null) {
                                AsyncImage(
                                    model = uiState.profilePicture,
                                    contentDescription = "Profile picture",
                                    modifier = Modifier.size(80.dp),
                                    contentScale = ContentScale.Crop
                                )
                            } else {
                                AsyncImage(
                                    model = "https://ui-avatars.com/api/?name=${uiState.username}&background=random",
                                    contentDescription = "Profile picture",
                                    modifier = Modifier.size(80.dp),
                                    contentScale = ContentScale.Crop
                                )
                            }
                        }

                        // Edit button - now on the right
                        Box(
                            modifier = Modifier
                                .clip(RoundedCornerShape(50))
                                .background(Color(0xFF1DA1F2))
                                .clickable {
                                    // Navigate to edit profile screen
                                    navController.navigate(Screen.EditProfile.route)
                                }
                                .padding(horizontal = 16.dp, vertical = 8.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Edit,
                                    contentDescription = "Edit profile",
                                    tint = Color.White,
                                    modifier = Modifier.size(16.dp)
                                )
                                Spacer(modifier = Modifier.width(4.dp))
                                Text(
                                    text = "Edit",
                                    color = Color.White,
                                    fontWeight = FontWeight.Bold
                                )
                            }
                        }
                    }

                    Spacer(modifier = Modifier.height(16.dp))

                    // Username
                    Text(
                        text = uiState.username,
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White,
                        fontWeight = FontWeight.Bold
                    )

                    // Email
                    Text(
                        text = uiState.email,
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.Gray
                    )

                    Spacer(modifier = Modifier.height(8.dp))

                    // Bio
                    Text(
                        text = uiState.bio.ifEmpty { "CollaborAid user helping others with tasks" },
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White
                    )

                    Spacer(modifier = Modifier.height(16.dp))

                    // User stats
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceEvenly
                    ) {
                        // Posted
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "${uiState.postedTasks.size}",
                                style = MaterialTheme.typography.titleLarge,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Posted",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.Gray
                            )
                        }

                        // Accepted
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "${uiState.acceptedTasks.size}",
                                style = MaterialTheme.typography.titleLarge,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Accepted",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.Gray
                            )
                        }

                        // Done
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "${uiState.doneTasks.size}",
                                style = MaterialTheme.typography.titleLarge,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Done",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.Gray
                            )
                        }

                        // Rating
                        Column(
                            horizontalAlignment = Alignment.CenterHorizontally
                        ) {
                            Text(
                                text = "4",
                                style = MaterialTheme.typography.titleLarge,
                                color = Color.White,
                                fontWeight = FontWeight.Bold
                            )
                            Text(
                                text = "Rating",
                                style = MaterialTheme.typography.bodyMedium,
                                color = Color.Gray
                            )
                        }
                    }
                }

                // Tab row
                TabRow(
                    selectedTabIndex = selectedTabIndex,
                    containerColor = Color(0xFF000000),
                    contentColor = Color(0xFF1DA1F2),
                    indicator = { tabPositions ->
                        Box(
                            modifier = Modifier
                                .customTabIndicatorOffset(tabPositions[selectedTabIndex])
                                .height(3.dp)
                                .background(Color(0xFF1DA1F2))
                        )
                    }
                ) {
                    tabs.forEachIndexed { index, title ->
                        Tab(
                            selected = selectedTabIndex == index,
                            onClick = {
                                selectedTabIndex = index
                                when (index) {
                                    0 -> viewModel.loadPostedTasks()
                                    1 -> viewModel.loadAcceptedTasks()
                                    2 -> viewModel.loadDoneTasks()
                                }
                            },
                            text = {
                                Text(
                                    text = title,
                                    color = if (selectedTabIndex == index) Color(0xFF1DA1F2) else Color.Gray,
                                    fontWeight = if (selectedTabIndex == index) FontWeight.Bold else FontWeight.Normal
                                )
                            }
                        )
                    }
                }

                // Content based on selected tab
                when {
                    uiState.isLoading -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(
                                color = Color(0xFF1DA1F2)
                            )
                        }
                    }
                    uiState.error != null -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = uiState.error ?: "An error occurred",
                                color = Color.Red
                            )
                        }
                    }
                    selectedTabIndex == 0 && uiState.postedTasks.isEmpty() -> {
                        EmptyTasksMessage(
                            message = "You haven't posted any tasks yet",
                            buttonText = "Post a Task",
                            onClick = { navController.navigate(Screen.PostTask.route) }
                        )
                    }
                    selectedTabIndex == 1 && uiState.acceptedTasks.isEmpty() -> {
                        EmptyTasksMessage(
                            message = "You haven't accepted any tasks yet",
                            buttonText = "Browse Tasks",
                            onClick = { navController.navigate(Screen.Feed.route) }
                        )
                    }
                    selectedTabIndex == 2 && uiState.doneTasks.isEmpty() -> {
                        EmptyTasksMessage(
                            message = "You haven't completed any tasks yet",
                            buttonText = "Browse Tasks",
                            onClick = { navController.navigate(Screen.Feed.route) }
                        )
                    }
                    else -> {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxSize()
                                .padding(horizontal = 16.dp)
                        ) {
                            item {
                                Spacer(modifier = Modifier.height(16.dp))
                            }

                            val tasks = when (selectedTabIndex) {
                                0 -> uiState.postedTasks.reversed()
                                1 -> uiState.acceptedTasks.reversed()
                                2 -> uiState.doneTasks.reversed()
                                else -> emptyList()
                            }

                            items(tasks) { task ->
                                ProfileTaskItem(
                                    task = task,
                                    tabType = when (selectedTabIndex) {
                                        0 -> "posted"
                                        1 -> "accepted"
                                        2 -> "done"
                                        else -> ""
                                    },
                                    onTaskClick = {
                                        when (selectedTabIndex) {
                                            0 -> {
                                                // For posted tasks, navigate to task progress screen with isPosted=true
                                                navController.navigate("task_progress/${task.id}?isPosted=true")
                                            }
                                            1 -> {
                                                // For accepted tasks, navigate to task progress screen with isPosted=false
                                                navController.navigate("task_progress/${task.id}?isPosted=false")
                                            }
                                            2 -> {
                                                // For done tasks, navigate to task detail screen
                                                navController.navigate("task_detail/${task.id}")
                                            }
                                        }
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
    }
}

@Composable
fun EmptyTasksMessage(
    message: String,
    buttonText: String,
    onClick: () -> Unit
) {
    Box(
        modifier = Modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Column(
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(
                text = message,
                style = MaterialTheme.typography.bodyLarge,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(16.dp))

            Box(
                modifier = Modifier
                    .clip(RoundedCornerShape(50))
                    .background(Color(0xFF1DA1F2))
                    .clickable(onClick = onClick)
                    .padding(horizontal = 16.dp, vertical = 8.dp)
            ) {
                Text(
                    text = buttonText,
                    color = Color.White,
                    fontWeight = FontWeight.Bold
                )
            }
        }
    }
}

@Composable
fun ProfileTaskItem(
    task: Task,
    tabType: String,
    onTaskClick: () -> Unit
) {
    Box(
        modifier = Modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(12.dp))
            .background(Color(0xFF121212))
            .clickable(onClick = onTaskClick)
            .padding(16.dp)
    ) {
        Column {
            // User info row
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Profile picture
                Box(
                    modifier = Modifier
                        .size(40.dp)
                        .clip(CircleShape)
                        .background(Color.DarkGray),
                    contentAlignment = Alignment.Center
                ) {
                    val user = when (tabType) {
                        "posted" -> task.acceptedBy
                        "accepted", "done" -> task.user
                        else -> null
                    }

                    // Use profile picture if available, otherwise use avatar
                    if (user?.profilePicture != null) {
                        AsyncImage(
                            model = user.profilePicture,
                            contentDescription = "Profile picture",
                            modifier = Modifier.size(40.dp),
                            contentScale = ContentScale.Crop
                        )
                    } else {
                        AsyncImage(
                            model = "https://ui-avatars.com/api/?name=${user?.username ?: "User"}&background=random",
                            contentDescription = "Profile picture",
                            modifier = Modifier.size(40.dp),
                            contentScale = ContentScale.Crop
                        )
                    }
                }

                Spacer(modifier = Modifier.width(12.dp))

                // Username and timestamp
                Column(
                    modifier = Modifier.weight(1f)
                ) {
                    Text(
                        text = when (tabType) {
                            "posted" -> task.acceptedBy?.username ?: "Not accepted yet"
                            "accepted", "done" -> task.user?.username ?: "Unknown"
                            else -> "Unknown"
                        },
                        style = MaterialTheme.typography.bodyMedium,
                        color = Color.White
                    )
                    Text(
                        text = when (tabType) {
                            "posted" -> "You posted · 1d ago"
                            "accepted" -> "You accepted · 1d ago"
                            "done" -> "Completed · 1d ago"
                            else -> "1d ago"
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }

                // Status chip
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(16.dp))
                        .background(
                            when (task.status) {
                                "Open" -> Color(0xFF4CAF50).copy(alpha = 0.2f)
                                "In Progress" -> Color(0xFFFFC107).copy(alpha = 0.2f)
                                "Pending Verification" -> Color(0xFFFF9800).copy(alpha = 0.2f)
                                "Done" -> Color(0xFF2196F3).copy(alpha = 0.2f)
                                else -> Color(0xFF2196F3).copy(alpha = 0.2f)
                            }
                        )
                        .padding(horizontal = 12.dp, vertical = 6.dp)
                ) {
                    Text(
                        text = task.status,
                        style = MaterialTheme.typography.labelMedium,
                        color = when (task.status) {
                            "Open" -> Color(0xFF4CAF50)
                            "In Progress" -> Color(0xFFFFC107)
                            "Pending Verification" -> Color(0xFFFF9800)
                            "Done" -> Color(0xFF2196F3)
                            else -> Color(0xFF2196F3)
                        }
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Task title
            Text(
                text = task.title,
                style = MaterialTheme.typography.titleMedium,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )

            // Task description
            Text(
                text = task.description,
                style = MaterialTheme.typography.bodyMedium,
                color = Color.LightGray,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Category and stats
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Category chip
                Box(
                    modifier = Modifier
                        .clip(RoundedCornerShape(4.dp))
                        .background(Color(0xFF333333))
                        .padding(horizontal = 8.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = task.category,
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.White
                    )
                }

                Spacer(modifier = Modifier.weight(1f))

                // Upvotes
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Outlined.KeyboardArrowUp,
                        contentDescription = "Upvotes",
                        tint = Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "15",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Comments
                Row(
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        imageVector = Icons.Outlined.Comment,
                        contentDescription = "Comments",
                        tint = Color.Gray,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text(
                        text = "7",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color.Gray
                    )
                }

                Spacer(modifier = Modifier.width(16.dp))

                // Share
                Icon(
                    imageVector = Icons.Outlined.Share,
                    contentDescription = "Share",
                    tint = Color.Gray,
                    modifier = Modifier.size(16.dp)
                )
            }
        }
    }
}

// Fixed tab indicator offset function
fun Modifier.customTabIndicatorOffset(
    currentTabPosition: TabPosition
): Modifier = composed {
    val currentTabWidth = currentTabPosition.width
    val indicatorWidth = currentTabWidth * 0.3f // Make indicator 30% of tab width

    // Calculate the offset to center the indicator under the tab
    val offsetX = currentTabPosition.left + (currentTabWidth - indicatorWidth) / 2

    // Apply the offset and width to the indicator
    fillMaxWidth()
        .wrapContentSize(Alignment.BottomStart)
        .offset(x = offsetX)
        .width(indicatorWidth)
}
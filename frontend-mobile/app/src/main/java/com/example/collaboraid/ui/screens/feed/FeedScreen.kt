package com.example.collaboraid.ui.screens.feed

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
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Clear
import androidx.compose.material.icons.filled.Notifications
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.outlined.BookmarkBorder
import androidx.compose.material.icons.outlined.ChatBubbleOutline
import androidx.compose.material.icons.outlined.KeyboardArrowUp
import androidx.compose.material.icons.outlined.Share
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextFieldDefaults
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
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.collaboraid.model.Category
import com.example.collaboraid.model.Task
import com.example.collaboraid.ui.components.BottomNavBar
import com.example.collaboraid.ui.components.TaskCard
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.FeedViewModel
import com.example.collaboraid.ui.viewmodels.FeedViewModelFactory
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.delay

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun FeedScreen(
    navController: NavController,
    viewModel: FeedViewModel = viewModel(
        factory = FeedViewModelFactory(SessionManager(LocalContext.current))
    )
) {
    val uiState by viewModel.uiState.collectAsState()
    var selectedTabIndex by remember { mutableStateOf(0) }
    var searchQuery by remember { mutableStateOf("") }
    var selectedCategory by remember { mutableStateOf("For you") }
    val categories = listOf("For you") + Category.values().map { Category.toDisplayName(it) }

    // Check if user is logged in
    LaunchedEffect(Unit) {
        if (!viewModel.isLoggedIn()) {
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Feed.route) { inclusive = true }
            }
        } else {
            viewModel.loadTasks()
            viewModel.loadNotifications()
        }
    }

    // Auto refresh tasks periodically
    LaunchedEffect(Unit) {
        while (true) {
            delay(30000) // Refresh every 30 seconds
            when (selectedTabIndex) {
                0 -> viewModel.loadNotifications()
            }
        }
    }

    // Apply search filter when query changes
    LaunchedEffect(searchQuery) {
        viewModel.searchTasks(searchQuery)
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF121212) // Dark background
    ) {
        Scaffold(
            containerColor = Color(0xFF121212),
            floatingActionButton = {
                FloatingActionButton(
                    onClick = { navController.navigate(Screen.PostTask.route) },
                    containerColor = Color(0xFF1DA1F2),
                    contentColor = Color.White
                ) {
                    Icon(Icons.Filled.Add, contentDescription = "Add Task")
                }
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
                // App title and notification icon in a row
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(16.dp),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "CollaborAid",
                        style = MaterialTheme.typography.headlineMedium,
                        color = Color.White
                    )

                    // Notifications icon on the right
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
                                contentDescription = "Notifications",
                                tint = Color.White // Ensure icon is white
                            )
                        }
                    }
                }

                // Search bar
                OutlinedTextField(
                    value = searchQuery,
                    onValueChange = {
                        searchQuery = it
                        viewModel.searchTasks(it)
                    },
                    placeholder = { Text("Search tasks", color = Color.Gray) },
                    leadingIcon = { Icon(Icons.Default.Search, contentDescription = "Search", tint = Color.Gray) },
                    trailingIcon = {
                        if (searchQuery.isNotEmpty()) {
                            Icon(
                                Icons.Default.Clear,
                                contentDescription = "Clear",
                                tint = Color.Gray,
                                modifier = Modifier.clickable {
                                    searchQuery = ""
                                    viewModel.searchTasks("")
                                }
                            )
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .padding(bottom = 16.dp),
                    shape = RoundedCornerShape(50),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedTextColor = Color.White,
                        unfocusedTextColor = Color.White,
                        focusedContainerColor = Color(0xFF212121),
                        unfocusedContainerColor = Color(0xFF212121),
                        cursorColor = Color.White,
                        focusedBorderColor = Color.Transparent,
                        unfocusedBorderColor = Color.Transparent
                    ),
                    singleLine = true
                )

                // Categories
                LazyRow(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(bottom = 16.dp),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    contentPadding = androidx.compose.foundation.layout.PaddingValues(horizontal = 16.dp)
                ) {
                    items(categories) { category ->
                        CategoryChip(
                            category = category,
                            selected = category == selectedCategory,
                            onSelected = {
                                selectedCategory = category
                                viewModel.filterTasksByCategory(category)
                            }
                        )
                    }
                }

                // Content based on selected category
                when {
                    uiState.isLoading -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            CircularProgressIndicator(color = Color(0xFF1DA1F2))
                        }
                    }
                    uiState.error != null -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(
                                    text = uiState.error ?: "An error occurred",
                                    color = Color.Red,
                                    modifier = Modifier.padding(bottom = 16.dp)
                                )
                                IconButton(
                                    onClick = { viewModel.loadTasks() },
                                    modifier = Modifier
                                        .background(Color(0xFF1DA1F2), CircleShape)
                                        .padding(8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Refresh,
                                        contentDescription = "Retry",
                                        tint = Color.White
                                    )
                                }
                            }
                        }
                    }
                    uiState.tasks.isEmpty() -> {
                        Box(
                            modifier = Modifier.fillMaxSize(),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = if (searchQuery.isNotEmpty() || selectedCategory != "For you")
                                    "No matching tasks found"
                                else
                                    "No tasks available",
                                style = MaterialTheme.typography.bodyLarge,
                                color = Color.Gray
                            )
                        }
                    }
                    else -> {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize()
                        ) {
                            items(uiState.tasks.reversed()) { task ->
                                TaskCard(
                                    task = task,
                                    onTaskClick = {
                                        navController.navigate("task_detail/${task.id}")
                                    }
                                )
                                Divider(color = Color(0xFF333333), thickness = 0.5.dp)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun CategoryChip(
    category: String,
    selected: Boolean,
    onSelected: () -> Unit
) {
    // Get category colors from Category enum if it's a valid category
    val (backgroundColor, textColor) = if (category != "For you") {
        try {
            val categoryEnum = Category.fromDisplayName(category)
            Category.getColorForEnum(categoryEnum)
        } catch (e: Exception) {
            if (selected) Pair(Color(0xFF1DA1F2), Color.White)
            else Pair(Color(0xFF212121), Color.Gray)
        }
    } else {
        if (selected) Pair(Color(0xFF1DA1F2), Color.White)
        else Pair(Color(0xFF212121), Color.Gray)
    }

    Box(
        modifier = Modifier
            .clip(RoundedCornerShape(50))
            .background(
                if (selected) backgroundColor
                else Color(0xFF212121)
            )
            .clickable { onSelected() }
            .padding(horizontal = 16.dp, vertical = 8.dp),
        contentAlignment = Alignment.Center
    ) {
        Text(
            text = category,
            color = if (selected) textColor else Color.Gray,
            style = MaterialTheme.typography.bodyMedium
        )
    }
}

package com.example.collaboraid.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.collaboraid.ui.screens.ai.AIScreen
import com.example.collaboraid.ui.screens.auth.LoginScreen
import com.example.collaboraid.ui.screens.auth.RegisterScreen
import com.example.collaboraid.ui.screens.feed.FeedScreen
import com.example.collaboraid.ui.screens.messages.ConversationScreen
import com.example.collaboraid.ui.screens.messages.MessagesScreen
import com.example.collaboraid.ui.screens.notifications.NotificationsScreen
import com.example.collaboraid.ui.screens.post.PostTaskScreen
import com.example.collaboraid.ui.screens.profile.EditProfileScreen
import com.example.collaboraid.ui.screens.profile.ProfileScreen
import com.example.collaboraid.ui.screens.task.TaskDetailScreen
import com.example.collaboraid.ui.screens.task.TaskProgressScreen

@Composable
fun AppNavHost(navController: NavHostController) {
    NavHost(
        navController = navController,
        startDestination = Screen.Login.route
    ) {
        composable(Screen.Login.route) {
            LoginScreen(navController = navController)
        }

        composable(Screen.Register.route) {
            RegisterScreen(navController = navController)
        }

        composable(Screen.Feed.route) {
            FeedScreen(navController = navController)
        }

        composable(Screen.Messages.route) {
            MessagesScreen(navController = navController)
        }

        composable("${Screen.Conversation.route}/{userId}") { backStackEntry ->
            val userId = backStackEntry.arguments?.getString("userId")?.toLongOrNull() ?: 0L
            ConversationScreen(userId = userId, navController = navController)
        }

        composable("task_detail/{taskId}") { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId")?.toLongOrNull() ?: 0L
            TaskDetailScreen(taskId = taskId, navController = navController)
        }

        composable("task_progress/{taskId}?isPosted={isPosted}") { backStackEntry ->
            val taskId = backStackEntry.arguments?.getString("taskId")?.toLongOrNull() ?: 0L
            val isPosted = backStackEntry.arguments?.getString("isPosted")?.toBoolean() ?: false
            TaskProgressScreen(taskId = taskId, isPosted = isPosted, navController = navController)
        }

        composable(Screen.AI.route) {
            AIScreen(navController = navController)
        }

        composable(Screen.PostTask.route) {
            PostTaskScreen(navController = navController)
        }

        composable(Screen.Profile.route) {
            ProfileScreen(navController = navController)
        }

        composable(Screen.EditProfile.route) {
            EditProfileScreen(navController = navController)
        }

        composable(Screen.Notifications.route) {
            NotificationsScreen(navController = navController)
        }
    }
}

sealed class Screen(val route: String) {
    object Login : Screen("login")
    object Register : Screen("register")
    object Feed : Screen("feed")
    object Messages : Screen("messages")
    object Conversation : Screen("conversation")
    object AI : Screen("ai")
    object PostTask : Screen("post_task")
    object Profile : Screen("profile")
    object EditProfile : Screen("edit_profile")
    object Notifications : Screen("notifications")
}

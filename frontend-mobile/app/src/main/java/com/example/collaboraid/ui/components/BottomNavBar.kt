package com.example.collaboraid.ui.components

import androidx.compose.foundation.layout.navigationBarsPadding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Message
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.SmartToy
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Message
import androidx.compose.material.icons.outlined.Person
import androidx.compose.material.icons.outlined.SmartToy
import androidx.compose.material3.Icon
import androidx.compose.material3.NavigationBar
import androidx.compose.material3.NavigationBarItem
import androidx.compose.material3.NavigationBarItemDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState
import com.example.collaboraid.ui.navigation.Screen

data class BottomNavItem(
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector,
    val route: String
)

@Composable
fun BottomNavBar(navController: NavController) {
    val items = listOf(
        BottomNavItem(
            label = "Home",
            icon = Icons.Outlined.Home,
            selectedIcon = Icons.Filled.Home,
            route = Screen.Feed.route
        ),
        BottomNavItem(
            label = "Messages",
            icon = Icons.Outlined.Message,
            selectedIcon = Icons.Filled.Message,
            route = Screen.Messages.route
        ),
        BottomNavItem(
            label = "Post",
            icon = Icons.Filled.Add,
            selectedIcon = Icons.Filled.Add,
            route = Screen.PostTask.route
        ),
        BottomNavItem(
            label = "AI Chat",
            icon = Icons.Outlined.SmartToy,
            selectedIcon = Icons.Filled.SmartToy,
            route = Screen.AI.route
        ),
        BottomNavItem(
            label = "Profile",
            icon = Icons.Outlined.Person,
            selectedIcon = Icons.Filled.Person,
            route = Screen.Profile.route
        )
    )

    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentRoute = navBackStackEntry?.destination?.route

    NavigationBar(
        modifier = Modifier.navigationBarsPadding(),
        containerColor = Color.Black,
        contentColor = Color.White
    ) {
        items.forEach { item ->
            val selected = currentRoute == item.route
            NavigationBarItem(
                icon = {
                    Icon(
                        imageVector = if (selected) item.selectedIcon else item.icon,
                        contentDescription = item.label,
                        tint = if (selected) Color(0xFF1DA1F2) else Color.White
                    )
                },
                label = {
                    Text(
                        text = item.label,
                        color = if (selected) Color(0xFF1DA1F2) else Color.White
                    )
                },
                selected = selected,
                onClick = {
                    if (currentRoute != item.route) {
                        navController.navigate(item.route) {
                            popUpTo(navController.graph.startDestinationId) {
                                saveState = true
                            }
                            launchSingleTop = true
                            restoreState = true
                        }
                    }
                },
                colors = NavigationBarItemDefaults.colors(
                    selectedIconColor = Color(0xFF1DA1F2),
                    unselectedIconColor = Color.White,
                    selectedTextColor = Color(0xFF1DA1F2),
                    unselectedTextColor = Color.White,
                    indicatorColor = Color.Black
                )
            )
        }
    }
}

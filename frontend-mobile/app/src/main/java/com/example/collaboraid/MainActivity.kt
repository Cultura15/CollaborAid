package com.example.collaboraid

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.compose.rememberNavController
import com.example.collaboraid.ui.navigation.AppNavHost
import com.example.collaboraid.ui.theme.CollaborAidTheme

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
                    CollaborAidTheme {
                        Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    CollaborAidApp()
                }
            }
        }
    }
}

@Composable
fun CollaborAidApp() {
    val navController = rememberNavController()
    AppNavHost(navController = navController)
}

package com.example.collaboraid.ui.screens.auth

import android.app.Activity
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Visibility
import androidx.compose.material.icons.filled.VisibilityOff
import androidx.compose.material.icons.outlined.Info
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.unit.dp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.collaboraid.R
import com.example.collaboraid.repository.AuthRepository
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.AuthViewModel
import com.example.collaboraid.util.GoogleSignInHelper
import com.example.collaboraid.util.SessionManager
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException

// Simple ViewModel Factory for AuthViewModel
class AuthViewModelFactory(private val authRepository: AuthRepository) : ViewModelProvider.Factory {
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(AuthViewModel::class.java)) {
            @Suppress("UNCHECKED_CAST")
            return AuthViewModel(authRepository) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}

@Composable
fun LoginScreen(
    navController: NavController
) {
    // Create dependencies
    val context = LocalContext.current
    val sessionManager = SessionManager(context)
    val authRepository = AuthRepository(sessionManager)
    val factory = AuthViewModelFactory(authRepository)

    // Create ViewModel
    val viewModel: AuthViewModel = viewModel(factory = factory)

    val uiState by viewModel.uiState.collectAsState()
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var passwordVisible by remember { mutableStateOf(false) }

    // Create scroll state
    val scrollState = rememberScrollState()

    // Create GoogleSignInHelper
    val googleSignInHelper = remember { GoogleSignInHelper(context) }

    // Activity Result Launcher for Google Sign-In
    val googleSignInLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.StartActivityForResult()
    ) { result ->
        try {
            val task = GoogleSignIn.getSignedInAccountFromIntent(result.data)
            val account = task.getResult(ApiException::class.java)

            // Successfully signed in with Google
            Log.d("LoginScreen", "Google Sign-In successful: ${account.email}")

            // Use the AuthViewModel to handle the Google login and get a JWT token
            viewModel.handleGoogleLogin(account)

        } catch (e: ApiException) {
            // Sign in failed
            Log.e("LoginScreen", "Google sign in failed with code: ${e.statusCode}", e)
            viewModel.setError("Google sign in failed: ${e.statusCode}")
        } catch (e: Exception) {
            Log.e("LoginScreen", "Unexpected error during Google sign in", e)
            viewModel.setError("Unexpected error: ${e.message}")
        }
    }

    // Check if user is already logged in
    LaunchedEffect(Unit) {
        viewModel.checkLoginStatus()
    }

    // Handle login result
    LaunchedEffect(uiState.isLoggedIn) {
        if (uiState.isLoggedIn) {
            navController.navigate(Screen.Feed.route) {
                popUpTo(Screen.Login.route) { inclusive = true }
            }
        }
    }

    // Spotify-like colors
    val spotifyBlack = Color(0xFF121212)
    val spotifyBlue = Color(0xFF052F60)
    val spotifyDarkGray = Color(0xFF212121)
    val spotifyLightGray = Color(0xFF535353)
    val spotifyWhite = Color(0xFFFFFFFF)

    // Use Box as the root container with fillMaxSize
    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(spotifyBlack)
    ) {
        // Use a scrollable column for the content
        Column(
            modifier = Modifier
                .fillMaxWidth() // Use fillMaxWidth instead of fillMaxSize to avoid scroll issues
                .verticalScroll(scrollState) // Apply vertical scroll
                .padding(horizontal = 24.dp, vertical = 32.dp), // Add padding
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            // App logo - centered like Spotify
            Image(
                painter = painterResource(id = R.drawable.app_logoz),
                contentDescription = "CollaborAid Logo",
                modifier = Modifier
                    .size(180.dp)
                    .padding(vertical = 16.dp),
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Welcome text - centered like Spotify
            Text(
                text = "Login to CollaborAid",
                style = MaterialTheme.typography.headlineSmall,
                color = spotifyWhite,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Email field - Spotify style
            Text(
                text = "Email",
                style = MaterialTheme.typography.bodyMedium,
                color = spotifyWhite,
                modifier = Modifier
                    .align(Alignment.Start)
                    .padding(bottom = 8.dp)
            )

            TextField(
                value = email,
                onValueChange = { email = it },
                placeholder = { Text("Email address", color = spotifyLightGray) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                ),
                singleLine = true,
                colors = TextFieldDefaults.colors(
                    focusedTextColor = spotifyWhite,
                    unfocusedTextColor = spotifyWhite,
                    cursorColor = spotifyBlue,
                    focusedContainerColor = spotifyDarkGray,
                    unfocusedContainerColor = spotifyDarkGray,
                    disabledContainerColor = spotifyDarkGray,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                ),
                shape = RoundedCornerShape(4.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Password field - Spotify style
            Text(
                text = "Password",
                style = MaterialTheme.typography.bodyMedium,
                color = spotifyWhite,
                modifier = Modifier
                    .align(Alignment.Start)
                    .padding(bottom = 8.dp)
            )

            TextField(
                value = password,
                onValueChange = { password = it },
                placeholder = { Text("Password", color = spotifyLightGray) },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible) Icons.Filled.Visibility else Icons.Filled.VisibilityOff,
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = spotifyLightGray
                        )
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                singleLine = true,
                colors = TextFieldDefaults.colors(
                    focusedTextColor = spotifyWhite,
                    unfocusedTextColor = spotifyWhite,
                    cursorColor = spotifyBlue,
                    focusedContainerColor = spotifyDarkGray,
                    unfocusedContainerColor = spotifyDarkGray,
                    disabledContainerColor = spotifyDarkGray,
                    focusedIndicatorColor = Color.Transparent,
                    unfocusedIndicatorColor = Color.Transparent
                ),
                shape = RoundedCornerShape(4.dp)
            )

            // Error message
            if (uiState.error != null) {
                Spacer(modifier = Modifier.height(16.dp))
                Text(
                    text = uiState.error ?: "",
                    color = Color.Red,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.align(Alignment.Start)
                )
            }

            // Forgot password - Spotify style (right aligned)
            TextButton(
                onClick = { /* Forgot password functionality */ },
                modifier = Modifier.align(Alignment.End),
                contentPadding = PaddingValues(vertical = 8.dp, horizontal = 0.dp)
            ) {
                Text(
                    text = "Forgot your password?",
                    color = spotifyWhite,
                    style = MaterialTheme.typography.bodyMedium
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            val isFormFilled = email.isNotBlank() && password.isNotBlank()

            // Login button - Spotify style (blue)
            Button(
                onClick = {
                    viewModel.login(email, password)
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                enabled = !uiState.isLoading && isFormFilled,
                shape = RoundedCornerShape(24.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = spotifyBlue,
                    contentColor = spotifyWhite,
                    disabledContainerColor = spotifyBlue.copy(alpha = 0.3f),
                    disabledContentColor = spotifyWhite.copy(alpha = 0.3f)
                )
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = spotifyWhite,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text(
                        text = "LOG IN",
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Divider with OR - Spotify style
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Divider(
                    modifier = Modifier.weight(1f),
                    color = spotifyLightGray.copy(alpha = 0.5f)
                )
                Text(
                    text = "OR",
                    modifier = Modifier.padding(horizontal = 16.dp),
                    color = spotifyLightGray
                )
                Divider(
                    modifier = Modifier.weight(1f),
                    color = spotifyLightGray.copy(alpha = 0.5f)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Google sign in button
            Button(
                onClick = {
                    try {
                        // Check if Google Play Services is available
                        if (googleSignInHelper.isGooglePlayServicesAvailable()) {
                            // Clear any previous errors
                            viewModel.clearError()

                            // Launch Google Sign-In
                            val signInIntent = googleSignInHelper.googleSignInClient.signInIntent
                            googleSignInLauncher.launch(signInIntent)
                        } else {
                            viewModel.setError("Google Play Services is not available")
                        }
                    } catch (e: Exception) {
                        Log.e("LoginScreen", "Error launching Google Sign-In", e)
                        viewModel.setError("Error launching Google Sign-In: ${e.message}")
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(56.dp),
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color.White,
                    contentColor = Color.Black
                )
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.Center,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Image(
                        painter = painterResource(id = R.drawable.google_logo),
                        contentDescription = "Google Logo",
                        modifier = Modifier.size(20.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "CONTINUE WITH GOOGLE",
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            Spacer(modifier = Modifier.height(32.dp))

            // Don't have an account - Spotify style (centered)
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Don't have an account?",
                    color = spotifyLightGray
                )
                TextButton(
                    onClick = {
                        navController.navigate(Screen.Register.route)
                    }
                ) {
                    Text(
                        text = "SIGN UP",
                        color = spotifyWhite,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            // Add extra space at the bottom to ensure everything is visible when scrolled
            Spacer(modifier = Modifier.height(40.dp))
        }
    }
}
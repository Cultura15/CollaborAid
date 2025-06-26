package com.example.collaboraid.ui.screens.auth

import android.app.Activity
import android.util.Log
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
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
import androidx.compose.ui.unit.sp
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import com.example.collaboraid.R
import com.example.collaboraid.api.RetrofitClient
import com.example.collaboraid.repository.AuthRepository
import com.example.collaboraid.ui.navigation.Screen
import com.example.collaboraid.ui.viewmodels.AuthViewModel
import com.example.collaboraid.util.GoogleSignInHelper
import com.example.collaboraid.util.SessionManager
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.common.api.ApiException

@Composable
fun RegisterScreen(
    navController: NavController,
    viewModel: AuthViewModel = viewModel(
        factory = createAuthViewModelFactory(LocalContext.current)
    )
) {
    val context = LocalContext.current
    val uiState by viewModel.uiState.collectAsState()
    var username by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var confirmPassword by remember { mutableStateOf("") }
    var passwordError by remember { mutableStateOf<String?>(null) }
    var passwordVisible by remember { mutableStateOf(false) }
    var confirmPasswordVisible by remember { mutableStateOf(false) }

    // Password strength variables
    val passwordStrength = calculatePasswordStrength(password)
    val strengthColor = getStrengthColor(passwordStrength)
    val strengthText = getStrengthText(passwordStrength)

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

    // Handle registration result
    LaunchedEffect(uiState.isRegistered) {
        if (uiState.isRegistered) {
            navController.navigate(Screen.Login.route) {
                popUpTo(Screen.Register.route) { inclusive = true }
            }
        }
    }

    // Handle login result (for Google Sign-In)
    LaunchedEffect(uiState.isLoggedIn) {
        if (uiState.isLoggedIn) {
            navController.navigate(Screen.Feed.route) {
                popUpTo(Screen.Register.route) { inclusive = true }
            }
        }
    }

    // Define gradient colors
    val gradientColors = listOf(
        Color(0xFF1B2F3F), // Dark blue at top
        Color(0xFF0A1128), // Dark blue
        Color(0xFF1A1A2E), // Dark blue-purple
        Color(0xFF000000)  // Dark purple with hint of red at bottom
    )

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(
                brush = Brush.verticalGradient(
                    colors = gradientColors
                )
            )
    ) {
        // Make the entire content scrollable
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(scrollState)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Spacer(modifier = Modifier.height(5.dp))

            // App logo
            Image(
                painter = painterResource(id = R.drawable.app_logoz),
                contentDescription = "CollaborAid Logo",
                modifier = Modifier
                    .height(150.dp) // make it bigger
                    .width(150.dp), // adjust width if you want
                contentScale = ContentScale.Fit
            )

            Spacer(modifier = Modifier.height(24.dp))

            // Create account text
            Text(
                text = "Create Account",
                style = MaterialTheme.typography.headlineMedium,
                color = Color.White,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(8.dp))

            Text(
                text = "Sign up to get started",
                style = MaterialTheme.typography.bodyLarge,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(32.dp))

            // Username field
            OutlinedTextField(
                value = username,
                onValueChange = { username = it },
                label = { Text("Username", color = Color.Gray) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Person,
                        contentDescription = "Username",
                        tint = Color.Gray
                    )
                },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Text,
                    imeAction = ImeAction.Next
                ),
                singleLine = true,
                colors = TextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    cursorColor = Color(0xFF1D9BF0),
                    focusedIndicatorColor = Color(0xFF1D9BF0),
                    unfocusedIndicatorColor = Color(0xFF333333),
                    focusedContainerColor = Color(0xFF121212),
                    unfocusedContainerColor = Color(0xFF121212)
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Email field
            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email", color = Color.Gray) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Email,
                        contentDescription = "Email",
                        tint = Color.Gray
                    )
                },
                modifier = Modifier.fillMaxWidth(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Email,
                    imeAction = ImeAction.Next
                ),
                singleLine = true,
                colors = TextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    cursorColor = Color(0xFF1D9BF0),
                    focusedIndicatorColor = Color(0xFF1D9BF0),
                    unfocusedIndicatorColor = Color(0xFF333333),
                    focusedContainerColor = Color(0xFF121212),
                    unfocusedContainerColor = Color(0xFF121212)
                ),
                shape = RoundedCornerShape(8.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Password field
            OutlinedTextField(
                value = password,
                onValueChange = {
                    password = it
                    passwordError = if (confirmPassword.isNotEmpty() && it != confirmPassword)
                        "Passwords do not match" else null
                },
                label = { Text("Password", color = Color.Gray) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Lock,
                        contentDescription = "Password",
                        tint = Color.Gray
                    )
                },
                trailingIcon = {
                    IconButton(onClick = { passwordVisible = !passwordVisible }) {
                        Icon(
                            imageVector = if (passwordVisible)
                                Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                            contentDescription = if (passwordVisible) "Hide password" else "Show password",
                            tint = Color.Gray
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = if (passwordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Next
                ),
                singleLine = true,
                colors = TextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    cursorColor = Color(0xFF1D9BF0),
                    focusedIndicatorColor = Color(0xFF1D9BF0),
                    unfocusedIndicatorColor = Color(0xFF333333),
                    focusedContainerColor = Color(0xFF121212),
                    unfocusedContainerColor = Color(0xFF121212),
                    errorIndicatorColor = MaterialTheme.colorScheme.error,
                    errorContainerColor = Color(0xFF121212),
                    errorTextColor = MaterialTheme.colorScheme.error
                ),
                shape = RoundedCornerShape(8.dp),
                isError = passwordError != null
            )

            // Password strength indicator
            if (password.isNotEmpty()) {
                Spacer(modifier = Modifier.height(4.dp))

                // Password requirements text
                Text(
                    text = "Password must have at least 8 characters with numbers, uppercase, and special characters",
                    color = Color.Gray,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Password strength progress bar
                LinearProgressIndicator(
                    progress = { passwordStrength / 100f },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(4.dp),
                    color = strengthColor,
                    trackColor = Color(0xFF333333)
                )

                Spacer(modifier = Modifier.height(4.dp))

                // Password strength text
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = strengthText,
                        color = strengthColor,
                        style = MaterialTheme.typography.bodySmall
                    )

                    Text(
                        text = "$passwordStrength%",
                        color = strengthColor,
                        style = MaterialTheme.typography.bodySmall
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Confirm Password field
            OutlinedTextField(
                value = confirmPassword,
                onValueChange = {
                    confirmPassword = it
                    passwordError = if (it != password) "Passwords do not match" else null
                },
                label = { Text("Confirm Password", color = Color.Gray) },
                leadingIcon = {
                    Icon(
                        imageVector = Icons.Outlined.Lock,
                        contentDescription = "Confirm Password",
                        tint = Color.Gray
                    )
                },
                trailingIcon = {
                    IconButton(onClick = { confirmPasswordVisible = !confirmPasswordVisible }) {
                        Icon(
                            imageVector = if (confirmPasswordVisible)
                                Icons.Outlined.Visibility else Icons.Outlined.VisibilityOff,
                            contentDescription = if (confirmPasswordVisible) "Hide password" else "Show password",
                            tint = Color.Gray
                        )
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = if (confirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                keyboardOptions = KeyboardOptions(
                    keyboardType = KeyboardType.Password,
                    imeAction = ImeAction.Done
                ),
                singleLine = true,
                colors = TextFieldDefaults.colors(
                    focusedTextColor = Color.White,
                    unfocusedTextColor = Color.White,
                    cursorColor = Color(0xFF1D9BF0),
                    focusedIndicatorColor = Color(0xFF1D9BF0),
                    unfocusedIndicatorColor = Color(0xFF333333),
                    focusedContainerColor = Color(0xFF121212),
                    unfocusedContainerColor = Color(0xFF121212),
                    errorIndicatorColor = MaterialTheme.colorScheme.error,
                    errorContainerColor = Color(0xFF121212),
                    errorTextColor = MaterialTheme.colorScheme.error
                ),
                shape = RoundedCornerShape(8.dp),
                isError = passwordError != null
            )

            // Password error message
            if (passwordError != null) {
                Text(
                    text = passwordError ?: "",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            // Error message
            if (uiState.error != null) {
                Text(
                    text = uiState.error ?: "",
                    color = MaterialTheme.colorScheme.error,
                    style = MaterialTheme.typography.bodySmall,
                    modifier = Modifier.padding(top = 4.dp)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Register button
            Button(
                onClick = {
                    if (password == confirmPassword) {
                        if (passwordStrength >= 70) { // Only allow registration if password is strong enough
                            viewModel.register(username, email, password)
                        } else {
                            viewModel.setError("Password is too weak. Please make it stronger.")
                        }
                    } else {
                        passwordError = "Passwords do not match"
                    }
                },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(50.dp),
                enabled = !uiState.isLoading &&
                        username.isNotBlank() &&
                        email.isNotBlank() &&
                        password.isNotBlank() &&
                        confirmPassword.isNotBlank() &&
                        passwordError == null,
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = Color(0xFF1D9BF0),
                    contentColor = Color.White
                )
            ) {
                if (uiState.isLoading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.dp
                    )
                } else {
                    Text("Create Account")
                }
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Divider with OR
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Divider(
                    modifier = Modifier.weight(1f),
                    color = Color(0xFF333333)
                )
                Text(
                    text = "OR",
                    modifier = Modifier.padding(horizontal = 16.dp),
                    color = Color.Gray
                )
                Divider(
                    modifier = Modifier.weight(1f),
                    color = Color(0xFF333333)
                )
            }

            Spacer(modifier = Modifier.height(24.dp))

            // Google sign up button
            Button(
                onClick = {
                    try {
                        // Check if Google Play Services is available
                        if (googleSignInHelper.isGooglePlayServicesAvailable()) {
                            // Clear any previous errors
                            viewModel.clearError()

                            // Use the updated GoogleSignInClient with ID token request
                            val signInIntent = googleSignInHelper.googleSignInClient.signInIntent

                            // Log that we're launching the sign-in intent
                            Log.d("RegisterScreen", "Launching Google Sign-In intent")

                            // Launch Google Sign-In
                            googleSignInLauncher.launch(signInIntent)
                        } else {
                            viewModel.setError("Google Play Services is not available")
                        }
                    } catch (e: Exception) {
                        Log.e("RegisterScreen", "Error launching Google Sign-In", e)
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
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Text(
                        text = "Sign in with Google",
                        fontWeight = FontWeight.Medium
                    )
                }
            }

            // Login link
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 24.dp),
                horizontalArrangement = Arrangement.Center,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Already have an account?",
                    color = Color.Gray
                )
                TextButton(
                    onClick = {
                        navController.navigate(Screen.Login.route) {
                            popUpTo(Screen.Register.route) { inclusive = true }
                        }
                    }
                ) {
                    Text(
                        text = "Sign In",
                        color = Color(0xFF1D9BF0),
                        fontWeight = FontWeight.Bold,
                    )
                }
            }

            // Add extra space at the bottom to ensure everything is visible when scrolled
            Spacer(modifier = Modifier.height(16.dp))
        }
    }
}

// Password strength calculation function
fun calculatePasswordStrength(password: String): Int {
    if (password.isEmpty()) return 0

    var score = 0

    // Length check (up to 25%)
    val lengthScore = (password.length * 3).coerceAtMost(25)
    score += lengthScore

    // Contains number (15%)
    if (password.any { it.isDigit() }) {
        score += 15
    }

    // Contains lowercase (10%)
    if (password.any { it.isLowerCase() }) {
        score += 10
    }

    // Contains uppercase (20%)
    if (password.any { it.isUpperCase() }) {
        score += 20
    }

    // Contains special character (30%)
    if (password.any { !it.isLetterOrDigit() }) {
        score += 30
    }

    return score
}

// Get color based on password strength
fun getStrengthColor(strength: Int): Color {
    return when {
        strength < 30 -> Color.Red
        strength < 70 -> Color(0xFFFF9800) // Orange
        else -> Color(0xFF4CAF50) // Green
    }
}

// Get text description based on password strength
fun getStrengthText(strength: Int): String {
    return when {
        strength < 30 -> "Weak"
        strength < 70 -> "Moderate"
        else -> "Strong"
    }
}

// Helper function to create AuthViewModel factory
fun createAuthViewModelFactory(context: android.content.Context): ViewModelProvider.Factory {
    return object : ViewModelProvider.Factory {
        override fun <T : ViewModel> create(modelClass: Class<T>): T {
            if (modelClass.isAssignableFrom(AuthViewModel::class.java)) {
                val sessionManager = SessionManager(context)
                // Get the AuthService from RetrofitClient
                val authService = RetrofitClient.authService
                // Create AuthRepository with both required parameters
                val authRepository = AuthRepository(sessionManager)
                @Suppress("UNCHECKED_CAST")
                return AuthViewModel(authRepository) as T
            }
            throw IllegalArgumentException("Unknown ViewModel class")
        }
    }
}
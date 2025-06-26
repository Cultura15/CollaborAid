package com.example.collaboraid.ui.screens.profile

import android.content.Context
import android.net.Uri
import android.util.Log
import android.webkit.MimeTypeMap
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CalendarMonth
import androidx.compose.material.icons.filled.Camera
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.ChevronRight
import androidx.compose.material.icons.filled.Email
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Phone
import androidx.compose.material.icons.filled.Place
import androidx.compose.material3.AlertDialog
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Divider
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextFieldDefaults
import androidx.compose.material3.TopAppBar
import androidx.compose.material3.TopAppBarDefaults
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavController
import coil.compose.AsyncImage
import com.example.collaboraid.model.User
import com.example.collaboraid.ui.viewmodels.ProfileViewModel
import com.example.collaboraid.ui.viewmodels.ProfileViewModelFactory
import com.example.collaboraid.util.SessionManager
import kotlinx.coroutines.launch
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

private const val TAG = "EditProfileScreen"

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditProfileScreen(
    navController: NavController,
    viewModel: ProfileViewModel = viewModel(
        factory = ProfileViewModelFactory(SessionManager(LocalContext.current))
    )
) {
    val context = LocalContext.current
    val sessionManager = SessionManager(context)
    val uiState by viewModel.uiState.collectAsState()
    val snackbarHostState = remember { SnackbarHostState() }
    val coroutineScope = rememberCoroutineScope()

    // Debug: Log session values
    LaunchedEffect(Unit) {
        sessionManager.logStoredValues()
    }

    var usernameInput by remember { mutableStateOf("") }
    var bioInput by remember { mutableStateOf("") }
    var emailInput by remember { mutableStateOf("") }
    var phoneInput by remember { mutableStateOf("") }
    var dateOfBirthInput by remember { mutableStateOf("") }
    var countryInput by remember { mutableStateOf("") }
    var selectedImageUri by remember { mutableStateOf<Uri?>(null) }
    var isUpdatingProfile by remember { mutableStateOf(false) }
    var isUploadingImage by remember { mutableStateOf(false) }
    var showConfirmationDialog by remember { mutableStateOf(false) }
    var imageError by remember { mutableStateOf<String?>(null) }
    var debugInfo by remember { mutableStateOf<String?>(null) }

    // Load user profile data
    LaunchedEffect(Unit) {
        viewModel.loadUserProfile()
    }

    // Update local state when profile data is loaded
    LaunchedEffect(uiState.username, uiState.bio, uiState.email) {
        Log.d(TAG, "UI State updated: username=${uiState.username}, email=${uiState.email}, bio=${uiState.bio}")
        usernameInput = uiState.username
        bioInput = uiState.bio
        emailInput = uiState.email
        phoneInput = sessionManager.getPhone() ?: ""
        dateOfBirthInput = sessionManager.getDateOfBirth() ?: ""
        countryInput = sessionManager.getCountry() ?: "Indonesia"
    }

    // Image picker launcher
    val imagePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.GetContent()
    ) { uri: Uri? ->
        uri?.let {
            selectedImageUri = it
            imageError = null
            debugInfo = "Selected image URI: $it"
            Log.d(TAG, "Image selected: $it")

            // Get MIME type for debugging
            val mimeType = getMimeTypeFromUri(context, it)
            debugInfo += "\nMIME type: $mimeType"
            Log.d(TAG, "Image MIME type: $mimeType")
        }
    }

    // Confirmation dialog
    if (showConfirmationDialog) {
        AlertDialog(
            onDismissRequest = { showConfirmationDialog = false },
            title = { Text("Save Changes?") },
            text = { Text("Are you sure you want to save these profile changes?") },
            confirmButton = {
                TextButton(
                    onClick = {
                        showConfirmationDialog = false
                        isUpdatingProfile = true

                        // Log the data being sent
                        Log.d(TAG, "Updating user: username=$usernameInput, email=$emailInput, bio=$bioInput")

                        // Create updated user object
                        val updatedUser = User(
                            id = sessionManager.getUserId(),
                            username = usernameInput,
                            email = emailInput,
                            bio = bioInput,
                        )

                        // Save additional fields to SessionManager
                        coroutineScope.launch {
                            sessionManager.savePhone(phoneInput)
                            sessionManager.saveDateOfBirth(dateOfBirthInput)
                            sessionManager.saveCountry(countryInput)
                        }

                        // Update user details
                        viewModel.updateUserDetails(
                            updatedUser,
                            onSuccess = {
                                isUpdatingProfile = false
                                // Save bio to session manager
                                coroutineScope.launch {
                                    sessionManager.saveBio(bioInput)
                                    snackbarHostState.showSnackbar("Profile details updated successfully")
                                }
                                navController.popBackStack()
                            },
                            onError = { errorMessage ->
                                isUpdatingProfile = false
                                coroutineScope.launch {
                                    snackbarHostState.showSnackbar("Error: $errorMessage")
                                }
                            }
                        )
                    }
                ) {
                    Text("Yes", color = Color(0xFF1DA1F2))
                }
            },
            dismissButton = {
                TextButton(
                    onClick = { showConfirmationDialog = false }
                ) {
                    Text("Cancel", color = Color.Gray)
                }
            },
            containerColor = Color(0xFF15202B),
            textContentColor = Color.White,
            titleContentColor = Color.White
        )
    }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color(0xFF15202B) // Dark Twitter/X background
    ) {
        Scaffold(
            containerColor = Color(0xFF15202B),
            topBar = {
                TopAppBar(
                    title = { Text("Edit Profile", fontWeight = FontWeight.Bold) },
                    colors = TopAppBarDefaults.topAppBarColors(
                        containerColor = Color(0xFF15202B),
                        titleContentColor = Color.White,
                        navigationIconContentColor = Color.White
                    ),
                    navigationIcon = {
                        IconButton(onClick = { navController.popBackStack() }) {
                            Icon(
                                imageVector = Icons.Default.ArrowBack,
                                contentDescription = "Back"
                            )
                        }
                    }
                )
            },
            snackbarHost = { SnackbarHost(snackbarHostState) }
        ) { paddingValues ->
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(paddingValues)
                    .verticalScroll(rememberScrollState()),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Progress indicator
                Column(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp, vertical = 8.dp)
                ) {
                    LinearProgressIndicator(
                        progress = { 0.8f },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(4.dp),
                        color = Color(0xFF1DA1F2),
                        trackColor = Color(0xFF38444D)
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "You only need 20% more!",
                        color = Color.White,
                        fontWeight = FontWeight.Bold,
                        fontSize = 16.sp
                    )
                    Text(
                        text = "Complete your data by filling all fields!",
                        color = Color(0xFF8899A6),
                        fontSize = 14.sp
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Profile picture with edit option
                Box(
                    modifier = Modifier
                        .size(100.dp)
                        .clip(CircleShape)
                        .border(2.dp, Color(0xFF1DA1F2), CircleShape)
                        .background(Color(0xFF38444D))
                        .clickable { imagePickerLauncher.launch("image/*") },
                    contentAlignment = Alignment.Center
                ) {
                    // Show selected image or current profile picture
                    when {
                        selectedImageUri != null -> {
                            AsyncImage(
                                model = selectedImageUri,
                                contentDescription = "Selected profile picture",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop,
                                onError = {
                                    Log.e(TAG, "Error loading selected image: ${it.result.throwable}")
                                    imageError = "Error loading image"
                                }
                            )
                        }
                        uiState.profilePicture != null -> {
                            AsyncImage(
                                model = uiState.profilePicture,
                                contentDescription = "Current profile picture",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop,
                                onError = {
                                    Log.e(TAG, "Error loading profile picture: ${it.result.throwable}")
                                }
                            )
                        }
                        else -> {
                            AsyncImage(
                                model = "https://ui-avatars.com/api/?name=${usernameInput}&background=random",
                                contentDescription = "Profile picture",
                                modifier = Modifier.fillMaxSize(),
                                contentScale = ContentScale.Crop
                            )
                        }
                    }

                    // Camera icon overlay
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .background(Color(0x80000000)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Default.Camera,
                            contentDescription = "Change profile picture",
                            tint = Color.White,
                            modifier = Modifier.size(32.dp)
                        )
                    }
                }

                // Error message for image loading
                if (imageError != null) {
                    Text(
                        text = imageError!!,
                        color = Color.Red,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(top = 4.dp)
                    )
                }

                // Debug info (only in debug builds)
                if (debugInfo != null) {
                    Text(
                        text = debugInfo!!,
                        color = Color.Yellow,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(top = 4.dp, start = 16.dp, end = 16.dp),
                        textAlign = TextAlign.Center
                    )
                }

                // Upload profile picture button (only show if an image is selected)
                if (selectedImageUri != null) {
                    Spacer(modifier = Modifier.height(16.dp))

                    Button(
                        onClick = {
                            isUploadingImage = true
                            debugInfo = null

                            try {
                                // Convert URI to File
                                val imageFile = uriToFile(context, selectedImageUri!!)
                                Log.d(TAG, "Created file from URI: ${imageFile.absolutePath}, size: ${imageFile.length()} bytes")
                                debugInfo = "File created: ${imageFile.name}, size: ${imageFile.length()} bytes"

                                // Upload profile picture
                                viewModel.uploadProfilePicture(
                                    imageFile,
                                    onSuccess = {
                                        isUploadingImage = false
                                        selectedImageUri = null // Clear selected image
                                        debugInfo = null
                                        coroutineScope.launch {
                                            snackbarHostState.showSnackbar("Profile picture updated successfully")
                                        }
                                    },
                                    onError = { errorMessage ->
                                        isUploadingImage = false
                                        Log.e(TAG, "Error uploading profile picture: $errorMessage")
                                        debugInfo = "Upload error: $errorMessage"
                                        coroutineScope.launch {
                                            snackbarHostState.showSnackbar("Error: $errorMessage")
                                        }
                                    }
                                )
                            } catch (e: Exception) {
                                isUploadingImage = false
                                Log.e(TAG, "Exception creating file from URI", e)
                                debugInfo = "File error: ${e.message}"
                                coroutineScope.launch {
                                    snackbarHostState.showSnackbar("Error: ${e.message ?: "Failed to process image"}")
                                }
                            }
                        },
                        modifier = Modifier.fillMaxWidth(0.8f),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = Color(0xFF1DA1F2)
                        ),
                        shape = RoundedCornerShape(50),
                        enabled = !isUploadingImage
                    ) {
                        if (isUploadingImage) {
                            CircularProgressIndicator(
                                color = Color.White,
                                modifier = Modifier.size(24.dp)
                            )
                        } else {
                            Text(
                                text = "Upload Profile Picture",
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(vertical = 4.dp)
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Form fields
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = Color(0xFF192734)
                    ),
                    shape = RoundedCornerShape(12.dp)
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        // Name field
                        Text(
                            text = "Name",
                            color = Color(0xFF8899A6),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(bottom = 4.dp)
                        )
                        OutlinedTextField(
                            value = usernameInput,
                            onValueChange = { usernameInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedContainerColor = Color(0xFF192734),
                                unfocusedContainerColor = Color(0xFF192734),
                                cursorColor = Color(0xFF1DA1F2),
                                focusedIndicatorColor = Color(0xFF1DA1F2),
                                unfocusedIndicatorColor = Color(0xFF38444D)
                            ),
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Person,
                                    contentDescription = "Name",
                                    tint = Color(0xFF8899A6)
                                )
                            },
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Email field - read only
                        Text(
                            text = "Email Address",
                            color = Color(0xFF8899A6),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(bottom = 4.dp)
                        )
                        OutlinedTextField(
                            value = emailInput,
                            onValueChange = { /* Read-only field */ },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedTextColor = Color.Gray,
                                unfocusedTextColor = Color.Gray,
                                focusedContainerColor = Color(0xFF192734),
                                unfocusedContainerColor = Color(0xFF192734),
                                cursorColor = Color(0xFF1DA1F2),
                                focusedIndicatorColor = Color(0xFF38444D),
                                unfocusedIndicatorColor = Color(0xFF38444D)
                            ),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email),
                            readOnly = true,
                            enabled = false,
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Email,
                                    contentDescription = "Email",
                                    tint = Color(0xFF8899A6)
                                )
                            },
                            trailingIcon = {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    modifier = Modifier.padding(end = 8.dp)
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Check,
                                        contentDescription = "Verified",
                                        tint = Color(0xFF1DA1F2),
                                        modifier = Modifier.size(16.dp)
                                    )
                                    Spacer(modifier = Modifier.width(4.dp))
                                    Text(
                                        text = "VERIFIED",
                                        color = Color(0xFF1DA1F2),
                                        fontSize = 12.sp,
                                        fontWeight = FontWeight.Bold
                                    )
                                }
                            },
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Phone Number field
                        Text(
                            text = "Phone Number",
                            color = Color(0xFF8899A6),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(bottom = 4.dp)
                        )
                        OutlinedTextField(
                            value = phoneInput,
                            onValueChange = { phoneInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedContainerColor = Color(0xFF192734),
                                unfocusedContainerColor = Color(0xFF192734),
                                cursorColor = Color(0xFF1DA1F2),
                                focusedIndicatorColor = Color(0xFF1DA1F2),
                                unfocusedIndicatorColor = Color(0xFF38444D)
                            ),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Phone,
                                    contentDescription = "Phone",
                                    tint = Color(0xFF8899A6)
                                )
                            },
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Date of Birth field
                        Text(
                            text = "Date of Birth",
                            color = Color(0xFF8899A6),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(bottom = 4.dp)
                        )
                        OutlinedTextField(
                            value = dateOfBirthInput,
                            onValueChange = { dateOfBirthInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedContainerColor = Color(0xFF192734),
                                unfocusedContainerColor = Color(0xFF192734),
                                cursorColor = Color(0xFF1DA1F2),
                                focusedIndicatorColor = Color(0xFF1DA1F2),
                                unfocusedIndicatorColor = Color(0xFF38444D)
                            ),
                            placeholder = { Text("dd/mm/yyyy", color = Color(0xFF8899A6)) },
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.CalendarMonth,
                                    contentDescription = "Date of Birth",
                                    tint = Color(0xFF8899A6)
                                )
                            },
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Country field
                        Text(
                            text = "Country",
                            color = Color(0xFF8899A6),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(bottom = 4.dp)
                        )
                        OutlinedTextField(
                            value = countryInput,
                            onValueChange = { countryInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedContainerColor = Color(0xFF192734),
                                unfocusedContainerColor = Color(0xFF192734),
                                cursorColor = Color(0xFF1DA1F2),
                                focusedIndicatorColor = Color(0xFF1DA1F2),
                                unfocusedIndicatorColor = Color(0xFF38444D)
                            ),
                            leadingIcon = {
                                Icon(
                                    imageVector = Icons.Default.Place,
                                    contentDescription = "Country",
                                    tint = Color(0xFF8899A6)
                                )
                            },
                            trailingIcon = {
                                Icon(
                                    imageVector = Icons.Default.ChevronRight,
                                    contentDescription = "Select",
                                    tint = Color(0xFF8899A6)
                                )
                            },
                            singleLine = true
                        )

                        Spacer(modifier = Modifier.height(16.dp))

                        // Bio field
                        Text(
                            text = "Bio",
                            color = Color(0xFF8899A6),
                            fontSize = 14.sp,
                            modifier = Modifier.padding(bottom = 4.dp)
                        )
                        OutlinedTextField(
                            value = bioInput,
                            onValueChange = { bioInput = it },
                            modifier = Modifier.fillMaxWidth(),
                            colors = TextFieldDefaults.colors(
                                focusedTextColor = Color.White,
                                unfocusedTextColor = Color.White,
                                focusedContainerColor = Color(0xFF192734),
                                unfocusedContainerColor = Color(0xFF192734),
                                cursorColor = Color(0xFF1DA1F2),
                                focusedIndicatorColor = Color(0xFF1DA1F2),
                                unfocusedIndicatorColor = Color(0xFF38444D)
                            ),
                            minLines = 3,
                            maxLines = 5
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))

                // Save profile details button
                Button(
                    onClick = { showConfirmationDialog = true },
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(horizontal = 16.dp)
                        .height(50.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Color(0xFF1DA1F2)
                    ),
                    shape = RoundedCornerShape(50),
                    enabled = !isUpdatingProfile && !isUploadingImage
                ) {
                    if (isUpdatingProfile) {
                        CircularProgressIndicator(
                            color = Color.White,
                            modifier = Modifier.size(24.dp)
                        )
                    } else {
                        Text(
                            text = "Save Changes",
                            fontWeight = FontWeight.Bold,
                            fontSize = 16.sp
                        )
                    }
                }

                Spacer(modifier = Modifier.height(24.dp))
            }
        }
    }
}

// Helper function to convert URI to File
private fun uriToFile(context: Context, uri: Uri): File {
    val inputStream = context.contentResolver.openInputStream(uri)
        ?: throw IOException("Failed to open input stream for URI: $uri")

    val tempFile = File.createTempFile("profile_picture", ".jpg", context.cacheDir)
    tempFile.deleteOnExit()

    Log.d("EditProfileScreen", "Creating file from URI: $uri")
    Log.d("EditProfileScreen", "Temp file path: ${tempFile.absolutePath}")

    try {
        FileOutputStream(tempFile).use { outputStream ->
            val buffer = ByteArray(4 * 1024) // 4k buffer
            var read: Int
            while (inputStream.read(buffer).also { read = it } != -1) {
                outputStream.write(buffer, 0, read)
            }
            outputStream.flush()
        }
    } finally {
        inputStream.close()
    }

    Log.d("EditProfileScreen", "File created successfully, size: ${tempFile.length()} bytes")

    return tempFile
}

// Helper function to get MIME type from URI
private fun getMimeTypeFromUri(context: Context, uri: Uri): String? {
    return context.contentResolver.getType(uri) ?: run {
        val fileExtension = MimeTypeMap.getFileExtensionFromUrl(uri.toString())
        MimeTypeMap.getSingleton().getMimeTypeFromExtension(fileExtension.lowercase())
    }
}

package com.example.collaboraid.util

import android.content.Context
import android.util.Log
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.longPreferencesKey
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.example.collaboraid.api.RetrofitClient
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.runBlocking

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "session_prefs")

class SessionManager(private val context: Context) {

    private val TAG = "SessionManager"

    companion object {
        private val AUTH_TOKEN = stringPreferencesKey("auth_token")
        private val USER_ID = longPreferencesKey("user_id")
        private val USERNAME = stringPreferencesKey("username")
        private val EMAIL = stringPreferencesKey("email")
        private val PROFILE_PICTURE_URL = stringPreferencesKey("profile_picture_url")
        private val IS_GOOGLE_SIGN_IN = booleanPreferencesKey("is_google_sign_in")
        private val GOOGLE_ID_TOKEN = stringPreferencesKey("google_id_token")

        // New profile information keys
        private val BIO = stringPreferencesKey("bio")
        private val PHONE = stringPreferencesKey("phone")
        private val DATE_OF_BIRTH = stringPreferencesKey("date_of_birth")
        private val COUNTRY = stringPreferencesKey("country")
    }

    suspend fun saveAuthToken(token: String) {
        Log.d(TAG, "Saving auth token: ${token.take(10)}...")
        context.dataStore.edit { preferences ->
            preferences[AUTH_TOKEN] = token
        }
        // Update the static token in RetrofitClient for the auth interceptor
        RetrofitClient.SessionManager.setToken(token)
    }

    suspend fun saveUserId(userId: Long) {
        Log.d(TAG, "Saving user ID: $userId")
        context.dataStore.edit { preferences ->
            preferences[USER_ID] = userId
        }
    }

    suspend fun saveUsername(username: String) {
        Log.d(TAG, "Saving username: $username")
        context.dataStore.edit { preferences ->
            preferences[USERNAME] = username
        }
    }

    suspend fun saveEmail(email: String) {
        Log.d(TAG, "Saving email: $email")
        context.dataStore.edit { preferences ->
            preferences[EMAIL] = email
        }
    }

    suspend fun saveProfilePictureUrl(url: String?) {
        if (url != null) {
            Log.d(TAG, "Saving profile picture URL: $url")
            context.dataStore.edit { preferences ->
                preferences[PROFILE_PICTURE_URL] = url
            }
        }
    }

    suspend fun saveIsGoogleSignIn(isGoogleSignIn: Boolean) {
        Log.d(TAG, "Saving Google Sign-In status: $isGoogleSignIn")
        context.dataStore.edit { preferences ->
            preferences[IS_GOOGLE_SIGN_IN] = isGoogleSignIn
        }
    }

    suspend fun saveGoogleIdToken(token: String) {
        Log.d(TAG, "Saving Google ID token: ${token.take(10)}...")
        context.dataStore.edit { preferences ->
            preferences[GOOGLE_ID_TOKEN] = token
        }
    }

    // New profile information save methods
    suspend fun saveBio(bio: String) {
        Log.d(TAG, "Saving bio")
        context.dataStore.edit { preferences ->
            preferences[BIO] = bio
        }
    }

    suspend fun savePhone(phone: String) {
        Log.d(TAG, "Saving phone: $phone")
        context.dataStore.edit { preferences ->
            preferences[PHONE] = phone
        }
    }

    suspend fun saveDateOfBirth(dateOfBirth: String) {
        Log.d(TAG, "Saving date of birth: $dateOfBirth")
        context.dataStore.edit { preferences ->
            preferences[DATE_OF_BIRTH] = dateOfBirth
        }
    }

    suspend fun saveCountry(country: String) {
        Log.d(TAG, "Saving country: $country")
        context.dataStore.edit { preferences ->
            preferences[COUNTRY] = country
        }
    }

    fun getAuthToken(): String? = runBlocking {
        val token = context.dataStore.data.map { preferences ->
            preferences[AUTH_TOKEN]
        }.first()

        // Also update the static token in RetrofitClient
        if (token != null) {
            RetrofitClient.SessionManager.setToken(token)
        }

        token
    }

    fun getUserId(): Long? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[USER_ID]
        }.first()
    }

    fun getUsername(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[USERNAME]
        }.first()
    }

    fun getEmail(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[EMAIL]
        }.first()
    }

    fun getProfilePictureUrl(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[PROFILE_PICTURE_URL]
        }.first()
    }

    fun isGoogleSignIn(): Boolean = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[IS_GOOGLE_SIGN_IN] ?: false
        }.first()
    }

    fun getGoogleIdToken(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[GOOGLE_ID_TOKEN]
        }.first()
    }

    // New profile information get methods
    fun getBio(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[BIO]
        }.first()
    }

    fun getPhone(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[PHONE]
        }.first()
    }

    fun getDateOfBirth(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[DATE_OF_BIRTH]
        }.first()
    }

    fun getCountry(): String? = runBlocking {
        context.dataStore.data.map { preferences ->
            preferences[COUNTRY]
        }.first()
    }

    suspend fun clearSession() {
        Log.d(TAG, "Clearing session")
        context.dataStore.edit { preferences ->
            preferences.clear()
        }
        // Clear the static token in RetrofitClient
        RetrofitClient.SessionManager.setToken(null)
    }

    val authTokenFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[AUTH_TOKEN]
    }

    val userIdFlow: Flow<Long?> = context.dataStore.data.map { preferences ->
        preferences[USER_ID]
    }

    val usernameFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[USERNAME]
    }

    val emailFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[EMAIL]
    }

    val profilePictureUrlFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[PROFILE_PICTURE_URL]
    }

    val isGoogleSignInFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[IS_GOOGLE_SIGN_IN] ?: false
    }

    // New profile information flows
    val bioFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[BIO]
    }

    val phoneFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[PHONE]
    }

    val dateOfBirthFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[DATE_OF_BIRTH]
    }

    val countryFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[COUNTRY]
    }

    // Add this method to the SessionManager class to expose the context
    fun getContext(): Context {
        return context
    }

    // Helper method to save all user data at once from Google Sign-In
    suspend fun saveGoogleUserData(
        token: String,
        userId: Long,
        username: String,
        email: String,
        profilePictureUrl: String?,
        googleIdToken: String
    ) {
        saveAuthToken(token)
        saveUserId(userId)
        saveUsername(username)
        saveEmail(email)
        saveProfilePictureUrl(profilePictureUrl)
        saveIsGoogleSignIn(true)
        saveGoogleIdToken(googleIdToken)
    }

    // Helper method to save all profile information at once
    suspend fun saveProfileInfo(
        bio: String?,
        phone: String?,
        dateOfBirth: String?,
        country: String?
    ) {
        bio?.let { saveBio(it) }
        phone?.let { savePhone(it) }
        dateOfBirth?.let { saveDateOfBirth(it) }
        country?.let { saveCountry(it) }
    }

    // Debug method to log all stored values
    fun logStoredValues() {
        Log.d(TAG, "Auth Token: ${getAuthToken()?.take(10)}...")
        Log.d(TAG, "User ID: ${getUserId()}")
        Log.d(TAG, "Username: ${getUsername()}")
        Log.d(TAG, "Email: ${getEmail()}")
        Log.d(TAG, "Bio: ${getBio()}")
        Log.d(TAG, "Phone: ${getPhone()}")
        Log.d(TAG, "Date of Birth: ${getDateOfBirth()}")
        Log.d(TAG, "Country: ${getCountry()}")
    }
}

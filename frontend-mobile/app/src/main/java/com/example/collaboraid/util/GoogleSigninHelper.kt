package com.example.collaboraid.util

import android.content.Context
import android.util.Log
import com.google.android.gms.auth.api.signin.GoogleSignIn
import com.google.android.gms.auth.api.signin.GoogleSignInAccount
import com.google.android.gms.auth.api.signin.GoogleSignInClient
import com.google.android.gms.auth.api.signin.GoogleSignInOptions
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability

/**
 * Helper class for Google Sign-In functionality
 */
class GoogleSignInHelper(private val context: Context) {

    private val TAG = "GoogleSignInHelper"

    // Your Web Client ID (for backend verification)
    private val WEB_CLIENT_ID = "201627461876-e5inri7djsldv3me4t9gvr0rqf4m8k01.apps.googleusercontent.com"

    // Create GoogleSignInOptions with ID token for backend verification
    private val gso = GoogleSignInOptions.Builder(GoogleSignInOptions.DEFAULT_SIGN_IN)
        .requestEmail()
        .requestProfile()
        .requestIdToken("201627461876-go9n1oe7mpcof8uf175v12gug1jqfeug.apps.googleusercontent.com")
        .build()

    // Initialize the GoogleSignInClient
    val googleSignInClient: GoogleSignInClient by lazy {
        GoogleSignIn.getClient(context, gso)
    }

    /**
     * Check if a user is already signed in
     * @return GoogleSignInAccount if user is signed in, null otherwise
     */
    fun getLastSignedInAccount(): GoogleSignInAccount? {
        return GoogleSignIn.getLastSignedInAccount(context)
    }

    /**
     * Check if user is already signed in
     * @return true if user is signed in, false otherwise
     */
    fun isSignedIn(): Boolean {
        return getLastSignedInAccount() != null
    }

    /**
     * Check if Google Play Services is available
     * @return true if Google Play Services is available, false otherwise
     */
    fun isGooglePlayServicesAvailable(): Boolean {
        val googleApiAvailability = GoogleApiAvailability.getInstance()
        val resultCode = googleApiAvailability.isGooglePlayServicesAvailable(context)

        if (resultCode != ConnectionResult.SUCCESS) {
            Log.e(TAG, "Google Play Services not available: $resultCode")

            // Check if error is resolvable
            if (googleApiAvailability.isUserResolvableError(resultCode)) {
                Log.d(TAG, "Google Play Services error is resolvable")
            }

            return false
        }

        return true
    }

    /**
     * Sign out the current user
     * @param onComplete Callback to be called when sign out is complete
     */
    fun signOut(onComplete: () -> Unit) {
        googleSignInClient.signOut().addOnCompleteListener {
            if (it.isSuccessful) {
                Log.d(TAG, "User signed out from Google successfully")
            } else {
                Log.e(TAG, "Error signing out from Google", it.exception)
            }
            onComplete()
        }
    }

    /**
     * Log account information for debugging
     * @param account The GoogleSignInAccount to log
     */
    fun logAccountInfo(account: GoogleSignInAccount) {
        Log.d(TAG, "Google Account Information:")
        Log.d(TAG, "ID: ${account.id}")
        Log.d(TAG, "Email: ${account.email}")
        Log.d(TAG, "Display Name: ${account.displayName}")
        Log.d(TAG, "Given Name: ${account.givenName}")
        Log.d(TAG, "Family Name: ${account.familyName}")
        Log.d(TAG, "Photo URL: ${account.photoUrl}")
        Log.d(TAG, "ID Token: ${account.idToken?.take(15)}...")
    }
}
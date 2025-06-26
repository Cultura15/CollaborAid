import java.util.Properties
import kotlin.apply

plugins {
    alias(libs.plugins.android.application)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)

    id("org.jetbrains.kotlin.plugin.serialization") version "1.9.0"
}

android {
    namespace = "com.example.collaboraid"
    compileSdk = 35

    defaultConfig {
        applicationId = "com.example.collaboraid"
        minSdk = 27
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"

        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

        // Load API URL from local.properties
        val properties = Properties().apply {
            load(project.rootProject.file("local.properties").inputStream())
        }
        buildConfigField(
            "String",
            "API_BASE_URL",
            "\"${properties.getProperty("API_BASE_URL") ?: "https://it342-g5-collaboraid.onrender.com/api/"}\""
        )

        // Add Google Client ID for authentication
        buildConfigField(
            "String",
            "GOOGLE_CLIENT_ID",
            "\"201627461876-e5inri7djsldv3me4t9gvr0rqf4m8k01.apps.googleusercontent.com\""
        )

        vectorDrawables {
            useSupportLibrary = true
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
    kotlinOptions {
        jvmTarget = "11"
    }
    buildFeatures {
        compose = true
        buildConfig = true
    }
}

dependencies {

    implementation(libs.androidx.core.ktx)
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.7.0")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.7.0")
    implementation("androidx.navigation:navigation-compose:2.7.5")

    // Compose
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.activity.compose)
    implementation(libs.androidx.ui)
    implementation(libs.androidx.ui.graphics)
    implementation(libs.androidx.ui.tooling.preview)
    implementation(libs.androidx.material3)
    implementation("androidx.compose.material:material-icons-extended")

    // WebSocket and STOMP
    implementation("org.java-websocket:Java-WebSocket:1.5.3")
    implementation("com.google.code.gson:gson:2.12.1")

    // RxJava 2 & RxAndroid (required by the STOMP client)
    implementation("io.reactivex.rxjava2:rxjava:2.2.21")
    implementation("io.reactivex.rxjava2:rxandroid:2.1.1")




    // Google Sign-In
    implementation("com.google.android.gms:play-services-auth:20.7.0")

    // Coil for image loading
    implementation("io.coil-kt:coil-compose:2.4.0")

    // Accompanist
    implementation("com.google.accompanist:accompanist-systemuicontroller:0.30.1")

    // Retrofit & Network
    implementation("com.squareup.retrofit2:retrofit:2.9.0")
    implementation("com.squareup.retrofit2:converter-gson:2.9.0") // KEEP if using Gson

    // Optionally use kotlinx serialization instead of Gson
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.0")
    implementation("com.jakewharton.retrofit:retrofit2-kotlinx-serialization-converter:1.0.0")

    // OkHttp for logging
    implementation("com.squareup.okhttp3:logging-interceptor:4.9.3") // Compatible with 4.11.0

    // STOMP Protocol for WebSockets
    implementation("com.github.NaikSoftware:StompProtocolAndroid:1.6.6")

    // Optional: WebSocket support
    implementation("org.java-websocket:Java-WebSocket:1.5.3")
    implementation("com.squareup.okhttp3:okhttp:4.11.0")

    // ✅ Add this for SessionManager / DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // Tests
    testImplementation(libs.junit)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation(libs.androidx.ui.test.junit4)

    // Debug
    debugImplementation(libs.androidx.ui.tooling)
    debugImplementation(libs.androidx.ui.test.manifest)
}

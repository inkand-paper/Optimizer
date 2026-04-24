# NexPulse Android Integration Guide

This guide explains how to connect your **Android (Kotlin) apps** to the NexPulse engine to trigger global optimizations.

## 1. API Key Provisioning
1. **Registration**: Authenticate with the NexPulse SaaS platform.
2. **Key Generation**: Navigate to Dashboard -> API Keys and generate a unique key for your mobile application.
3. **Storage**: Secure the API key immediately. For security reasons, only the cryptographic hash is stored in our persistence layer.

## 2. Kotlin Implementation

### Dependencies
Include the OkHttp library in your `build.gradle` file:
```gradle
implementation("com.squareup.okhttp3:okhttp:4.12.0")
```

### Pulse Implementation
```kotlin
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

fun triggerNexPulse(tag: String, apiKey: String) {
    val client = OkHttpClient()
    
    // Pulse Payload
    val jsonBody = "{\"tag\": \"$tag\"}"
    val body = jsonBody.toRequestBody("application/json".toMediaType())
    
    val request = Request.Builder()
        .url("https://your-nex-pulse-deployment.vercel.app/api/revalidate")
        .addHeader("Authorization", "Bearer $apiKey")
        .post(body)
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) {
            // Handle network or connection failure
        }

        override fun onResponse(call: Call, response: Response) {
            if (response.isSuccessful) {
                // Global cache successfully refreshed
            } else {
                // Handle API error response codes
            }
        }
    })
}
```

---

## 3. Best Practices
- **Security**: Avoid hardcoding API keys in plain text. Implement secure key management or obfuscation.
- **Connectivity**: Verify network availability before initiating a Pulse request.
- **Authorization**: Implement error handling for `401 Unauthorized` responses to manage revoked or expired keys.
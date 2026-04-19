# 📱 Android Integration Guide

This guide explains how your customers can connect their **Android (Kotlin) apps** to your Next.js Optimizer Suite to refresh their website cache on the fly.

---

## 1. Getting the API Key
1. **Sign Up**: Your user registers on your SaaS platform.
2. **Generate Key**: They go to the Dashboard and create a key for their mobile app.
3. **Copy Key**: They must copy the `opt_...` key immediately.

---

## 2. Kotlin Implementation (Using OkHttp)

### Add Dependencies
Ensure you have the OkHttp library in your `build.gradle`:
```gradle
implementation("com.squareup.okhttp3:okhttp:4.12.0")
```

### The Revalidation Function
```kotlin
import okhttp3.*
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.RequestBody.Companion.toRequestBody
import java.io.IOException

fun triggerGlobalRefresh(tag: String, apiKey: String) {
    val client = OkHttpClient()
    
    // The "Lasso" (Tag) we want to refresh
    val jsonBody = """{"tag": "$tag"}"""
    val body = jsonBody.toRequestBody("application/json".toMediaType())
    
    val request = Request.Builder()
        .url("https://your-saas-url.com/api/revalidate")
        .addHeader("Authorization", "Bearer $apiKey")
        .post(body)
        .build()

    client.newCall(request).enqueue(object : Callback {
        override fun onFailure(call: Call, e: IOException) {
            // Handle network failure
            println("❌ Optimization Pulse Failed: ${e.message}")
        }

        override fun onResponse(call: Call, response: Response) {
            if (response.isSuccessful) {
                // Success! The website cache is now fresh.
                println("✅ Website Optimized Successfully!")
            } else {
                println("⚠️ Optimization Error: ${response.code}")
            }
        }
    })
}
```

---

## 🛠 Best Practices for Mobile Developers

- **🔒 Hide Your Keys**: Do not hardcode API keys in plain text inside your app. Use **ProGuard/R8** to obfuscate them or fetch them from a secure server.
- **📡 Network Check**: Always check if the device has an internet connection before calling the Optimization API.
- **🚨 401 Handling**: If your app receives a `401 Unauthorized` response, it means the API key was revoked in the dashboard. You should prompt the user or admin to update the key.
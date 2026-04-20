# 🧪 Final Integration Tests

Run these PowerShell commands to verify that your SaaS is fully operational and secure.

## 1. Health Check
Verify the server is running correctly.

```powershell
Invoke-RestMethod -Uri "https://nextjs-optimizer-suite.vercel.app/api/health" -Method Get
```

---

## 2. Security Test (Unauthorized)
Ensure that accessing the revalidate API WITHOUT a key fails.

```powershell
try {
    Invoke-RestMethod -Uri "https://nextjs-optimizer-suite.vercel.app/api/revalidate" -Method Post -Body '{"tag": "test"}' -Headers @{"Content-Type"="application/json"}
} catch {
    $_.Exception.Response.StatusCode
}
# Expected: 401 (Unauthorized)
```

---

## 3. Full Flow Test (Auth -> Key -> Revalidate)
Run this multi-step test to verify the entire "SaaS" logic.

### Step A: Login & Capture Token
```powershell
$loginBody = @{
    email = "abir_final@example.com"
    password = "StrongPassword123!"
} | ConvertTo-Json

$loginResponse = Invoke-RestMethod -Uri "https://nextjs-optimizer-suite.vercel.app/api/auth/login" -Method Post -Headers @{"Content-Type"="application/json"} -Body $loginBody
$jwtToken = $loginResponse.token
"✅ Login Successful. Token captured."
```

### Step B: Create a Machine Key via Dashboard API
```powershell
$keyBody = @{ name = "Test Android Device" } | ConvertTo-Json
$keyResponse = Invoke-RestMethod -Uri "https://nextjs-optimizer-suite.vercel.app/api/keys" -Method Post -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $jwtToken"
} -Body $keyBody

$apiKey = $keyResponse.apiKey
"✅ API Key Created: $apiKey"
```

### Step C: Trigger Revalidation using the Machine Key
```powershell
$revalidateBody = @{ tag = "products" } | ConvertTo-Json
$revalResponse = Invoke-RestMethod -Uri "https://nextjs-optimizer-suite.vercel.app/api/revalidate" -Method Post -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $apiKey"
} -Body $revalidateBody

$revalResponse
# Expected: {"success": true, ...}
```

---

## 4. Website Analyzer Test
Verify that the analyzer can scan a site.

```powershell
$analyzeBody = @{ url = "https://google.com" } | ConvertTo-Json
$analyzeResponse = Invoke-RestMethod -Uri "https://nextjs-optimizer-suite.vercel.app/api/analyze" -Method Post -Headers @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $apiKey"
} -Body $analyzeBody

$analyzeResponse.results
```
---

## 🎨 UI Verification Manual Checklist

- [ ] **Theme Toggle**: Does the icon switch (Sun/Moon) smoothly?
- [ ] **Password Eye**: Does clicking the eye reveal the password in Login/Register?
- [ ] **Responsiveness**: Open the Dashboard on your phone. Does the "Create Key" form stack vertically?
- [ ] **Shapes**: Do all Cards, Buttons, and Inputs have the same rounded corners (`rounded-xl`)?

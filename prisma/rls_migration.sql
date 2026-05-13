-- [DATABASE HARDENING] NexPulse Row Level Security (RLS) Migration
-- Run this in your Supabase SQL Editor to enforce isolation at the database level.

-- 1. Enable RLS on core tables
ALTER TABLE "CodeReview" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ApiKey" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Monitor" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Webhook" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ActivityLog" ENABLE ROW LEVEL SECURITY;

-- 2. Create Policies (Ensuring users can only see their own data)
-- Note: 'auth.uid()' is Supabase's built-in function for the authenticated user's ID.

-- [CodeReview]
CREATE POLICY "Users can only see their own code reviews" 
ON "CodeReview" FOR ALL 
USING (auth.uid()::text = "userId");

-- [ApiKey]
CREATE POLICY "Users can only see their own API keys" 
ON "ApiKey" FOR ALL 
USING (auth.uid()::text = "userId");

-- [Monitor]
CREATE POLICY "Users can only see their own monitors" 
ON "Monitor" FOR ALL 
USING (auth.uid()::text = "userId");

-- [Webhook]
CREATE POLICY "Users can only see their own webhooks" 
ON "Webhook" FOR ALL 
USING (auth.uid()::text = "userId");

-- [ActivityLog]
CREATE POLICY "Users can only see their own activity logs" 
ON "ActivityLog" FOR ALL 
USING (auth.uid()::text = "userId");

-- [ADMIN OVERRIDE] - Optional: Allow admins to see everything
-- Uncomment if you want to allow ADMIN role to bypass RLS via SQL
-- CREATE POLICY "Admins can see everything" 
-- ON "CodeReview" FOR ALL 
-- USING (EXISTS (SELECT 1 FROM "User" WHERE id = auth.uid()::text AND role = 'ADMIN'));

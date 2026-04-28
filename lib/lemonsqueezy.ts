import { lemonSqueezySetup } from "@lemonsqueezy/lemonsqueezy.js";

/**
 * [SaaS MONETIZATION] - LemonSqueezy Client
 * This client handles automated subscriptions and payments.
 * Payouts are supported in Bangladesh via Payoneer/Bank Transfer.
 */

if (!process.env.LEMONSQUEEZY_API_KEY) {
  console.warn("LEMONSQUEEZY_API_KEY is missing. Payment features will be disabled.");
}

lemonSqueezySetup({
  apiKey: process.env.LEMONSQUEEZY_API_KEY || "",
  onError: (error) => console.error("LemonSqueezy Error:", error),
});

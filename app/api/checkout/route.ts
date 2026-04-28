import { NextRequest, NextResponse } from 'next/server';
import { createCheckout } from "@lemonsqueezy/lemonsqueezy.js";
import { getTokenFromRequest } from "@/lib/auth";
import { PLAN_LIMITS, PlanType } from "@/lib/plans";
import "@/lib/lemonsqueezy"; // Ensure setup runs

export async function POST(req: NextRequest) {
  try {
    const decoded = getTokenFromRequest(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();
    const storeId = process.env.LEMONSQUEEZY_STORE_ID;
    const variantId = process.env[`LEMONSQUEEZY_VARIANT_ID_${plan}`]; // PRO or BUSINESS

    if (!storeId || !variantId) {
      return NextResponse.json({ 
        error: 'Configuration Error', 
        message: 'LemonSqueezy Store ID or Variant ID is missing in server environment.' 
      }, { status: 500 });
    }

    // Create a checkout session
    const { data, error } = await createCheckout(storeId, variantId, {
      checkoutData: {
        email: decoded.email,
        custom: {
          userId: decoded.userId,
          plan: plan
        },
      },
      productOptions: {
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?payment=success`,
        receiptButtonText: 'Go to Dashboard',
      },
    });

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      success: true, 
      url: data?.data.attributes.url 
    });

  } catch (error: any) {
    console.error('Checkout error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      message: error.message 
    }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

// GET /api/promotions — returns the current active promotion (public-ish, no auth needed)
export async function GET() {
  try {
    const now = new Date();
    const promo = await prisma.promotion.findFirst({
      where: {
        isActive: true,
        startsAt: { lte: now },
        endsAt: { gt: now },
      },
      orderBy: { endsAt: 'asc' },
    });

    return NextResponse.json({ promotion: promo });
  } catch (error) {
    console.error('GET /api/promotions error:', error);
    return NextResponse.json({ promotion: null });
  }
}

// POST /api/promotions — admin only: create a promotion
export async function POST(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, discountCode, discountPercent, targetPlan, isActive, startsAt, endsAt } = await req.json();

    if (!title || !discountCode || !discountPercent || !startsAt || !endsAt) {
      return NextResponse.json({ error: 'Missing required fields: title, discountCode, discountPercent, startsAt, endsAt' }, { status: 400 });
    }

    if (discountPercent < 1 || discountPercent > 99) {
      return NextResponse.json({ error: 'discountPercent must be between 1 and 99' }, { status: 400 });
    }

    const promo = await prisma.promotion.create({
      data: {
        title,
        description: description || null,
        discountCode,
        discountPercent: Number(discountPercent),
        targetPlan: targetPlan || 'ALL',
        isActive: Boolean(isActive),
        startsAt: new Date(startsAt),
        endsAt: new Date(endsAt),
      },
    });

    return NextResponse.json({ success: true, promotion: promo }, { status: 201 });
  } catch (error) {
    console.error('POST /api/promotions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/promotions — admin only: toggle isActive or update fields
export async function PATCH(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, ...updates } = await req.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    const promo = await prisma.promotion.update({
      where: { id },
      data: {
        ...updates,
        ...(updates.startsAt && { startsAt: new Date(updates.startsAt) }),
        ...(updates.endsAt && { endsAt: new Date(updates.endsAt) }),
      },
    });

    return NextResponse.json({ success: true, promotion: promo });
  } catch (error) {
    console.error('PATCH /api/promotions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/promotions — admin only
export async function DELETE(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 });

    await prisma.promotion.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/promotions error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

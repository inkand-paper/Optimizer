/**
 * app/api/code-review/[id]/route.ts
 * Manage individual code audit records.
 * Updated for Next.js 15+ Async Params.
 */

import { prisma } from "@/lib/prisma";
import { getTokenFromRequest } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const review = await prisma.codeReview.findUnique({
    where: { id },
  });

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.userId !== token.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(review);
}

/**
 * DELETE: Manually remove an audit record.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const token = await getTokenFromRequest(req);
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const review = await prisma.codeReview.findUnique({
    where: { id },
    select: { userId: true }
  });

  if (!review) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (review.userId !== token.userId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  await prisma.codeReview.delete({
    where: { id }
  });

  return NextResponse.json({ success: true });
}
import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { issueSignedToken, presignUrl } from '@vercel/blob';

// GET /api/admin/student-trials/signed-url?trialId=xxx
// Issues a 60-second signed URL for a private student ID card blob.
// Admin only. Browser is redirected to the signed URL — no file data
// passes through this function.
export async function GET(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token || token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const trialId = searchParams.get('trialId');

    if (!trialId) {
      return NextResponse.json({ error: 'trialId is required' }, { status: 400 });
    }

    const trial = await prisma.studentTrial.findUnique({
      where: { id: trialId },
      select: { studentIdUrl: true },
    });

    if (!trial?.studentIdUrl) {
      return NextResponse.json({ error: 'No ID card found for this application' }, { status: 404 });
    }

    // Extract the pathname from the full blob URL
    // e.g. https://abc.public.blob.vercel-storage.com/student-ids/uid/123.jpg
    // → student-ids/uid/123.jpg
    const blobUrl = new URL(trial.studentIdUrl);
    const pathname = blobUrl.pathname.slice(1); // remove leading /

    // Issue a delegation token scoped to this exact file, expires in 60 seconds
    const signedToken = await issueSignedToken({
      pathname,
      operations: ['get'],
      validUntil: Date.now() + 60 * 1000,
    });

    // Presign the URL using the delegation token
    // presignUrl returns { presignedUrl } — file served from CDN, not through this function
    const result = await presignUrl(signedToken, {
      operation: 'get',
      pathname,
      access: 'private',
    });

    // Redirect browser to the signed CDN URL (expires in 60s)
    return NextResponse.redirect(result.presignedUrl, { status: 302 });

  } catch (error) {
    console.error('GET /api/admin/student-trials/signed-url error:', error);
    return NextResponse.json({ error: 'Failed to generate signed URL' }, { status: 500 });
  }
}

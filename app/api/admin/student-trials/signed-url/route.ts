import { NextRequest, NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { head } from '@vercel/blob';

// GET /api/admin/student-trials/signed-url?trialId=xxx
// Streams the private student ID card to admin — server-side proxy, no direct blob URL exposed
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
      return NextResponse.json({ error: 'No ID card found' }, { status: 404 });
    }

    // Fetch the private blob server-side using the server token
    const blobMeta = await head(trial.studentIdUrl);
    const fileRes = await fetch(trial.studentIdUrl, {
      headers: {
        Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
      },
    });

    if (!fileRes.ok) {
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 });
    }

    const contentType = blobMeta.contentType || 'application/octet-stream';
    const disposition = contentType.startsWith('image/')
      ? 'inline'
      : `attachment; filename="student-id"`;

    return new NextResponse(fileRes.body, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': disposition,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('GET /api/admin/student-trials/signed-url error:', error);
    return NextResponse.json({ error: 'Failed to retrieve file' }, { status: 500 });
  }
}

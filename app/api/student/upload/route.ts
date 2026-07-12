import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getTokenFromRequest } from '@/lib/auth';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/pdf'];

// POST /api/student/upload — upload student ID card, returns blob URL
export async function POST(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Rate limit: 5 uploads per hour per user (covers re-uploads)
    const rl = await checkRateLimit(`student_upload_${token.userId}`, {
      maxRequests: 50,
      windowMs: 60 * 60 * 1000,
    });
    if (!rl.success) {
      return NextResponse.json({ error: 'Too many uploads. Please wait an hour.' }, { status: 429 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    // Validate type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Please upload a JPG, PNG, WebP image or PDF.',
      }, { status: 400 });
    }

    // Validate size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({
        error: 'File too large. Maximum size is 5MB.',
      }, { status: 400 });
    }

    // Upload to Vercel Blob
    // Path: student-ids/{userId}/{timestamp}.{ext}
    const ext = file.name.split('.').pop() || 'jpg';
    const filename = `student-ids/${token.userId}/${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: 'private', // ID cards contain sensitive personal data — private access only
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      url: blob.url, // stored path — actual viewing requires a signed URL (see /api/admin/student-trials/signed-url)
    });

  } catch (error) {
    console.error('POST /api/student/upload error:', error);
    return NextResponse.json({ error: 'Upload failed. Please try again.' }, { status: 500 });
  }
}

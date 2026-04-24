import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';
import { logActivity } from '@/lib/logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let currentUserId: string | undefined = undefined;
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyJwt(authHeader.split(' ')[1]);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    currentUserId = decoded.userId;
    const { id: keyId } = await params;
    
    // Check if the key exists and belongs to the user
    const key = await prisma.apiKey.findUnique({
      where: { id: keyId }
    });
    
    if (!key) {
      return NextResponse.json({ error: 'Not Found', message: 'API key not found' }, { status: 404 });
    }
    
    if (key.userId !== decoded.userId) {
      return NextResponse.json({ error: 'Forbidden', message: 'You do not have permission to delete this key' }, { status: 403 });
    }
    
    // Delete the key
    await prisma.apiKey.delete({
      where: { id: keyId }
    });

    await logActivity({
      type: 'KEY_REVOKE',
      action: `Key Revoked: ${key.name}`,
      status: 'SUCCESS',
      userId: currentUserId,
      details: { keyName: key.name, keyId }
    });
    
    return NextResponse.json({ success: true, message: 'API key revoked successfully' });
    
  } catch (error) {
    console.error('Delete key error:', error);
    
    if (currentUserId) {
      await logActivity({
        type: 'KEY_REVOKE',
        action: 'Key Revocation Failed',
        status: 'FAILURE',
        userId: currentUserId,
        details: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


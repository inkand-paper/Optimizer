import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJwt } from '@/lib/auth';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = verifyJwt(authHeader.split(' ')[1]);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
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
    
    return NextResponse.json({ success: true, message: 'API key revoked successfully' });
    
  } catch (error) {
    console.error('Delete key error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { isValidAdminKey } from '@/utils/youtube';

export async function POST(request: NextRequest) {
  try {
    const { key } = await request.json();
    
    if (!key) {
      return NextResponse.json({ error: 'キーが必要です' }, { status: 400 });
    }
    
    const valid = isValidAdminKey(key);
    
    return NextResponse.json({ valid });
  } catch (error) {
    console.error('Key validation error:', error);
    return NextResponse.json({ error: 'サーバーエラー' }, { status: 500 });
  }
}

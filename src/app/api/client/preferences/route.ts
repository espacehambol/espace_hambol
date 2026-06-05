import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const preferences = await prisma.guestPreferences.findUnique({
      where: { userId }
    });

    return NextResponse.json({ preferences });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch preferences' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { userId, pillowType, beverages, cleaningTime, dietaryNotes } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const preferences = await prisma.guestPreferences.upsert({
      where: { userId },
      update: { pillowType, beverages, cleaningTime, dietaryNotes },
      create: { userId, pillowType, beverages, cleaningTime, dietaryNotes }
    });

    return NextResponse.json({ success: true, preferences });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save preferences' }, { status: 500 });
  }
}

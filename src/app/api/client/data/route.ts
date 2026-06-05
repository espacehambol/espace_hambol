import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // In a real app, we'd get the user ID from the session
    const user = await (prisma.user as any).findUnique({
      where: { email: 'jean-luc@hambol.com' },
      include: {
        loyalty: true,
        transactions: {
          orderBy: { createdAt: 'desc' }
        },
        reservations: {
          include: {
            room: {
              include: {
                site: true
              }
            }
          },
          orderBy: { checkIn: 'asc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

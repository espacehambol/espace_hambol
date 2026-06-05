import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const agents = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'STAFF'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        staffProfile: {
          select: { position: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    return NextResponse.json({ agents });
  } catch (error) {
    console.error('Get agents error:', error);
    return NextResponse.json({ agents: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    // Get the first site to attach to
    const site = await prisma.site.findFirst();
    if (!site) return NextResponse.json({ error: 'Aucun site configuré.' }, { status: 404 });

    const user = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: 'hambol2025',
        role: 'STAFF',
        staffProfile: {
          create: {
            position: body.position || 'Agent',
            siteId: site.id,
          }
        }
      },
    });
    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('Create agent error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 });
  }
}

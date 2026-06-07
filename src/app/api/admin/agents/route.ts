import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/authorize';

export async function GET(request: Request) {
  const auth = authorize(request, ['ADMIN', 'MANAGER']);
  if (!auth.authorized) return auth.response;

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
          select: { 
            position: true,
            site: { select: { name: true } }
          }
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
  const auth = authorize(request, ['ADMIN', 'MANAGER']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const { name, email, position, siteId } = body;

    // Use selected siteId or find first
    let selectedSiteId = siteId;
    if (!selectedSiteId) {
      const site = await prisma.site.findFirst();
      if (!site) return NextResponse.json({ error: 'Aucun site configuré.' }, { status: 404 });
      selectedSiteId = site.id;
    }

    const userRole = position === 'ADMIN' ? 'ADMIN' : 'STAFF';

    const user = await prisma.user.create({
      data: {
        name: name,
        email: email,
        password: 'hambol2025',
        role: userRole,
        staffProfile: {
          create: {
            position: position || 'STAFF',
            siteId: selectedSiteId,
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

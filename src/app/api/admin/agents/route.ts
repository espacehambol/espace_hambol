import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/authorize';

export async function GET(request: Request) {
  const auth = authorize(request, ['ADMIN', 'MANAGER']);
  if (!auth.authorized) return auth.response;

  try {
    const agents = await prisma.user.findMany({
      where: {
        role: { in: ['ADMIN', 'STAFF', 'SUPER_ADMIN'] }
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        staffProfile: {
          select: { 
            position: true,
            siteId: true,
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

    const userRole = position === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : (position === 'ADMIN' ? 'ADMIN' : 'STAFF');

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

export async function PUT(request: Request) {
  const role = request.headers.get('x-user-role');
  const position = request.headers.get('x-user-position');
  
  if (role !== 'SUPER_ADMIN' && position !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Accès non autorisé. Seul le Super Admin peut modifier les agents.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { id, name, email, position: newPosition, siteId } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID de l\'agent requis.' }, { status: 400 });
    }

    const userRole = newPosition === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : (newPosition === 'ADMIN' ? 'ADMIN' : 'STAFF');

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        role: userRole,
        staffProfile: {
          upsert: {
            create: {
              position: newPosition || 'STAFF',
              siteId: siteId,
            },
            update: {
              position: newPosition || 'STAFF',
              siteId: siteId,
            }
          }
        }
      },
      include: {
        staffProfile: {
          include: {
            site: true
          }
        }
      }
    });

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error('Update agent error:', error);
    return NextResponse.json({ error: 'Erreur lors de la modification de l\'agent.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const role = request.headers.get('x-user-role');
  const position = request.headers.get('x-user-position');
  
  if (role !== 'SUPER_ADMIN' && position !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Accès non autorisé. Seul le Super Admin peut supprimer les agents.' },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID de l\'agent requis.' }, { status: 400 });
    }

    // Clean up dependent records first
    await prisma.staff.deleteMany({ where: { userId: id } });
    await prisma.guestPreferences.deleteMany({ where: { userId: id } });
    await prisma.loyaltyProgram.deleteMany({ where: { userId: id } });

    // Delete the User record
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Agent supprimé avec succès.' });
  } catch (error) {
    console.error('Delete agent error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression de l\'agent.' }, { status: 500 });
  }
}

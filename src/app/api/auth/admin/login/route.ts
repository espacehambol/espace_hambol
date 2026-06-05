import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email et mot de passe requis' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
      include: { staffProfile: true },
    });

    if (!user || user.password !== password) {
      return NextResponse.json({ error: 'Identifiants incorrects' }, { status: 401 });
    }

    if (user.role !== 'ADMIN' && user.role !== 'STAFF' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Accès non autorisé' }, { status: 403 });
    }

    // Derive position from role or staff profile
    const position = user.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 
                    user.role === 'ADMIN' ? 'ADMIN' : 
                    (user.staffProfile?.position || 'STAFF');

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name || email.split('@')[0],
        email: user.email,
        role: user.role,
        position,
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

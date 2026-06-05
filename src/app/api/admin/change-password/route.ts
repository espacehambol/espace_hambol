import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { targetUserId, newPassword } = await req.json();

    if (!targetUserId || !newPassword || newPassword.length < 6) {
      return NextResponse.json({ error: 'Données invalides. Mot de passe min. 6 caractères.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: targetUserId },
      data: { password: newPassword },
    });

    return NextResponse.json({ success: true, message: 'Mot de passe mis à jour avec succès.' });
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

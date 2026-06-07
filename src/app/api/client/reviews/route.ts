import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rating, comment, site } = body;

    if (!rating || !comment || !site) {
      return NextResponse.json({ error: 'Champs obligatoires manquants' }, { status: 400 });
    }

    // In a real app, user ID comes from the session. Here we mock it as jean-luc's user id.
    const user = await prisma.user.findUnique({
      where: { email: 'jean-luc@hambol.com' }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // Explicit type casting or using any since Prisma generated types might take a moment to refresh
    const review = await (prisma as any).review.create({
      data: {
        rating: parseInt(rating, 10),
        comment,
        site,
        status: 'PENDING',
        category: 'General',
        userId: user.id
      }
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error('Erreur soumission avis:', error);
    return NextResponse.json({ error: 'Erreur Serveur' }, { status: 500 });
  }
}

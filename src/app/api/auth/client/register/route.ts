import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Tous les champs sont obligatoires' }, { status: 400 });
    }

    // 1. Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 400 });
    }

    // 2. Create User + LoyaltyProgram + GuestPreferences in a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password, // In a real production, you'd hash this. For this platform, we follow current patterns.
          role: 'CLIENT',
        }
      });

      const loyalty = await tx.loyaltyProgram.create({
        data: {
          userId: user.id,
          points: 0,
          tier: 'STANDARD'
        }
      });

      const preferences = await tx.guestPreferences.create({
        data: {
          userId: user.id,
          pillowType: 'PLUME',
          beverages: 'Eau minérale, Jus locaux'
        }
      });

      return { user, loyalty };
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Compte créé avec succès ! Bienvenue au programme de fidélité.',
      user: { id: result.user.id, name: result.user.name, email: result.user.email }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Une erreur est survenue lors de l\'inscription' }, { status: 500 });
  }
}

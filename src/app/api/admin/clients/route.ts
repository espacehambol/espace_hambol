import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET all clients from the database
export async function GET() {
  try {
    const clients = await prisma.user.findMany({
      where: { role: 'CLIENT' },
      include: {
        loyalty: true,
        reservations: { select: { id: true } },
        transactions: { select: { amount: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = clients.map(c => ({
      id: c.id,
      name: c.name || 'Inconnu',
      email: c.email,
      tier: c.loyalty?.tier || 'STANDARD',
      visits: c.reservations.length,
      spent: c.transactions.reduce((sum, t) => sum + t.amount, 0),
    }));

    return NextResponse.json({ clients: formatted });
  } catch (error) {
    console.error('Get clients error:', error);
    return NextResponse.json({ clients: [] });
  }
}

// POST create a new client
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const client = await prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        password: 'changeme2025',
        role: 'CLIENT',
        loyalty: { create: { tier: 'STANDARD', points: 0 } },
      },
    });
    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du client.' }, { status: 500 });
  }
}

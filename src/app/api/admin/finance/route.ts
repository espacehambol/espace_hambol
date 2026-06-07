import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/authorize';

// GET financial summary + recent transactions
export async function GET(request: Request) {
  const auth = authorize(request, ['ADMIN']);
  if (!auth.authorized) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const siteId = searchParams.get('siteId');

    const filter: any = {};
    if (siteId && siteId !== 'global') {
      filter.siteId = siteId;
    } else if (siteId === 'global') {
      filter.siteId = null;
    }

    const transactions = await prisma.transaction.findMany({
      where: filter,
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const totalRevenue = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { 
        type: 'INVOICE', 
        status: 'PAID',
        ...filter
      },
    });

    const totalExpenses = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { 
        type: 'PAYMENT', 
        status: 'PAID',
        ...filter
      },
    });

    const pendingAmount = await prisma.transaction.aggregate({
      _sum: { amount: true },
      where: { 
        status: 'PENDING',
        ...filter
      },
    });

    return NextResponse.json({
      metrics: {
        revenue: totalRevenue._sum.amount || 0,
        expenses: totalExpenses._sum.amount || 0,
        netProfit: (totalRevenue._sum.amount || 0) - (totalExpenses._sum.amount || 0),
        pending: pendingAmount._sum.amount || 0,
      },
      transactions: transactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type,
        status: t.status,
        category: (t as any).category || 'AUTRE',
        description: t.description || 'Transaction',
        clientName: t.user?.name || 'Anonyme',
        date: t.createdAt,
      })),
    });
  } catch (error) {
    console.error('Finance fetch error:', error);
    return NextResponse.json({ metrics: {}, transactions: [] });
  }
}

// POST create a new transaction
export async function POST(request: Request) {
  const auth = authorize(request, ['ADMIN']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    // Use the admin user ID as a placeholder
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) return NextResponse.json({ error: 'Aucun admin trouvé.' }, { status: 404 });

    const transaction = await prisma.transaction.create({
      data: {
        amount: parseFloat(body.amount),
        type: body.type === 'Entrée (Revenu)' ? 'INVOICE' : 'PAYMENT',
        status: 'PAID',
        description: body.description,
        userId: admin.id,
        siteId: body.siteId === 'global' ? null : (body.siteId || null),
        category: body.category || 'AUTRE',
      },
    });
    return NextResponse.json({ transaction }, { status: 201 });
  } catch (error) {
    console.error('Create transaction error:', error);
    return NextResponse.json({ error: 'Erreur lors de la saisie.' }, { status: 500 });
  }
}

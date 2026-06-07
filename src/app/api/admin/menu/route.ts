import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { authorize } from '@/lib/authorize';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  try {
    const dishes = await prisma.dish.findMany({
      where: siteId ? { siteId } : {},
      include: { components: true },
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ dishes });
  } catch (error) {
    console.error('Get dishes error:', error);
    return NextResponse.json({ dishes: [] });
  }
}

export async function POST(request: Request) {
  const auth = authorize(request, ['ADMIN', 'MANAGER', 'CHEF_CUISINIER']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    const dish = await prisma.dish.create({
      data: {
        name: body.name,
        category: body.category,
        description: body.description || null,
        price: body.price ? parseFloat(body.price) : null,
        image: body.image || '/images/food/dish_default.png',
        siteId: body.siteId,
        isActive: body.isActive !== false,
      },
      include: { components: true }
    });
    return NextResponse.json({ dish }, { status: 201 });
  } catch (error) {
    console.error('Create dish error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const auth = authorize(request, ['ADMIN', 'MANAGER', 'CHEF_CUISINIER']);
  if (!auth.authorized) return auth.response;

  try {
    const body = await request.json();
    if (!body.id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const dish = await prisma.dish.update({
      where: { id: body.id },
      data: {
        name: body.name,
        category: body.category,
        description: body.description || null,
        price: body.price ? parseFloat(body.price) : null,
        image: body.image || '/images/food/dish_default.png',
        isActive: body.isActive !== false,
      },
      include: { components: true }
    });
    return NextResponse.json({ dish });
  } catch (error) {
    console.error('Update dish error:', error);
    return NextResponse.json({ error: 'Erreur lors de la mise à jour.' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const auth = authorize(request, ['ADMIN', 'MANAGER', 'CHEF_CUISINIER']);
  if (!auth.authorized) return auth.response;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

  try {
    await prisma.dish.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur lors de la suppression' }, { status: 500 });
  }
}

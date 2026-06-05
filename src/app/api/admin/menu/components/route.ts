import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// POST /api/admin/menu/components — Ajouter un composant à un plat
export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.dishId || !body.name || !body.type) {
      return NextResponse.json({ error: 'dishId, name et type requis' }, { status: 400 });
    }
    const component = await prisma.dishComponent.create({
      data: {
        dishId: body.dishId,
        name: body.name,
        type: body.type,       // PROTEIN | GARNISH | SAUCE | OPTION
        optional: body.optional === true,
      }
    });
    return NextResponse.json({ component }, { status: 201 });
  } catch (error) {
    console.error('Create component error:', error);
    return NextResponse.json({ error: 'Erreur lors de la création du composant.' }, { status: 500 });
  }
}

// DELETE /api/admin/menu/components?id=xxx — Supprimer un composant
export async function DELETE(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

  try {
    await prisma.dishComponent.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete component error:', error);
    return NextResponse.json({ error: 'Erreur lors de la suppression.' }, { status: 500 });
  }
}

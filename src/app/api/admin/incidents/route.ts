import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const siteId = searchParams.get('siteId');

  try {
    // Fetch site name to match with ConciergeRequest.site if needed, 
    // but schema says ConciergeRequest.site is a string (e.g. 'Azaguié', 'Yopougon')
    const site = siteId ? await prisma.site.findUnique({ where: { id: siteId } }) : null;
    
    const incidents = await prisma.conciergeRequest.findMany({
      where: {
        type: { in: ['MAINTENANCE', 'INCIDENT'] },
        status: { not: 'COMPLETED' },
        ...(site ? { site: site.name } : {})
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error('Fetch incidents error:', error);
    return NextResponse.json({ incidents: [] });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and status are required' }, { status: 400 });
    }

    const updatedIncident = await prisma.conciergeRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, incident: updatedIncident });
  } catch (error) {
    console.error('Update incident status error:', error);
    return NextResponse.json({ error: 'Failed to update incident status' }, { status: 500 });
  }
}

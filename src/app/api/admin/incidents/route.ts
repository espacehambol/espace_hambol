import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

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

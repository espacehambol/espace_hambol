import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const site = searchParams.get('site');

  try {
    const requests = await (prisma as any).conciergeRequest.findMany({
      where: site ? { site } : {},
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newRequest = await (prisma as any).conciergeRequest.create({
      data: {
        type: body.type,
        description: body.description,
        roomNumber: body.roomNumber,
        site: body.site,
        status: 'PENDING'
      }
    });
    return NextResponse.json(newRequest);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

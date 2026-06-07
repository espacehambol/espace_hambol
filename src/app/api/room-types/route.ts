import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const siteName = searchParams.get('site'); // ex: "Azaguié", "Yopougon"

    const roomTypes = await prisma.roomType.findMany({
      orderBy: { price: 'asc' }
    });

    let multiplier = 1.0;
    let yieldReason = 'Tarif Standard';

    if (siteName) {
      const site = await prisma.site.findFirst({
        where: { name: siteName }
      });

      if (site) {
        // Fetch current occupancy rate
        const totalRooms = 11;
        const occupiedCount = await prisma.room.count({
          where: {
            siteId: site.id,
            status: 'OCCUPIED'
          }
        });

        const occupancyRate = (occupiedCount / totalRooms) * 100;

        if (occupancyRate >= 80) {
          multiplier = 1.15;
          yieldReason = 'Tarif Haute Affluence (+15%)';
        } else if (occupancyRate >= 50) {
          multiplier = 1.10;
          yieldReason = 'Tarif Moyenne Affluence (+10%)';
        } else {
          // Weekend markup (Fri, Sat, Sun)
          const day = new Date().getDay();
          if (day === 0 || day === 5 || day === 6) {
            multiplier = 1.05;
            yieldReason = 'Tarif Weekend (+5%)';
          }
        }
      }
    }

    // Apply yield multiplier
    const dynamicRoomTypes = roomTypes.map(rt => ({
      ...rt,
      originalPrice: rt.price,
      price: Math.round(rt.price * multiplier),
      yieldReason
    }));

    return NextResponse.json({ roomTypes: dynamicRoomTypes });
  } catch (error) {
    console.error('Fetch room types error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

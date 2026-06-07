import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sites = await prisma.site.findMany({
      include: {
        rooms: {
          include: {
            reservations: {
              where: {
                status: 'CONFIRMED',
                checkIn: { lte: new Date() },
                checkOut: { gte: new Date() },
              }
            }
          }
        },
        _count: {
          select: { rooms: true }
        }
      }
    });

    const stats = sites.map(site => {
      const occupiedRooms = site.rooms.filter(room => room.status === 'OCCUPIED' || room.reservations.length > 0).length;
      const totalRooms = 11; // User requirement: 11 rooms per site
      const occupancyRate = (occupiedRooms / totalRooms) * 100;
      
      const revenue = site.rooms.reduce((acc, room) => acc + (room.reservations.reduce((rAcc, r) => rAcc + r.totalPrice, 0)), 0);
      const adr = occupiedRooms > 0 ? Math.round(revenue / occupiedRooms) : 0;
      const revpar = Math.round(revenue / totalRooms);

      return {
        siteId: site.id,
        siteName: site.name,
        occupiedRooms,
        totalRooms,
        occupancyRate: Math.round(occupancyRate),
        revenue,
        adr,
        revpar,
        rooms: site.rooms.map(room => ({
          number: room.number,
          status: room.status,
        }))
      };
    });

    const totalOccupancy = Math.round(stats.reduce((acc, s) => acc + s.occupancyRate, 0) / sites.length) || 0;
    const totalRevenue = stats.reduce((acc, s) => acc + s.revenue, 0);
    const totalRoomsCount = stats.reduce((acc, s) => acc + s.totalRooms, 0);
    const totalOccupiedCount = stats.reduce((acc, s) => acc + s.occupiedRooms, 0);
    const globalAdr = totalOccupiedCount > 0 ? Math.round(totalRevenue / totalOccupiedCount) : 0;
    const globalRevpar = totalRoomsCount > 0 ? Math.round(totalRevenue / totalRoomsCount) : 0;

    const recentActivity = await prisma.reservation.findMany({
      take: 3,
      orderBy: { createdAt: 'desc' },
      include: {
        client: { select: { name: true } },
        room: { select: { number: true, site: { select: { name: true } } } }
      }
    });

    const recentFormatted = recentActivity.map(r => ({
      id: r.id,
      clientName: r.client?.name || 'Client',
      roomNumber: r.room?.number || 'N/A',
      siteName: r.room?.site?.name || 'N/A',
      status: r.status,
      createdAt: r.createdAt.toISOString()
    }));

    return NextResponse.json({ 
      overall: {
        occupancy: totalOccupancy,
        revenue: totalRevenue,
        adr: globalAdr,
        revpar: globalRevpar,
        pendingReservations: await prisma.reservation.count({ where: { status: 'PENDING' } })
      },
      sites: stats,
      recentActivity: recentFormatted
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const reviews = await (prisma as any).review.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } }
      }
    });
    
    // Format them to match the REVIEWS array structure used in ReviewsCarousel
    const formattedReviews = reviews.map((r: any) => ({
      id: r.id,
      name: r.user?.name || 'Client Hambol',
      site: r.site,
      text: r.comment,
      rating: r.rating
    }));

    return NextResponse.json(formattedReviews);
  } catch (error) {
    console.error('Error fetching public reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

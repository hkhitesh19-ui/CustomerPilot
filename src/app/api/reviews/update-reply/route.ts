import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { reviewId, reviewReply } = await req.json();

    if (!reviewId || !reviewReply) {
      return NextResponse.json({ error: "reviewId and reviewReply are required" }, { status: 400 });
    }

    const updated = await db.googleBusinessReview.update({
      where: { id: reviewId },
      data: {
        reviewReply: reviewReply,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ success: true, updated });
  } catch (error: any) {
    console.error("[Update Reply] Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

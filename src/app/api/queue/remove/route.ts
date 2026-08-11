import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const merchantId = req.headers.get('x-merchant-id');
    if (!merchantId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { waitingCustomerId } = body;

    if (!waitingCustomerId) {
      return NextResponse.json({ success: false, error: 'Missing required fields' }, { status: 400 });
    }

    const waitingCustomer = await db.waitingCustomer.findUnique({
      where: { id: waitingCustomerId }
    });

    if (!waitingCustomer || waitingCustomer.merchantId !== merchantId) {
      return NextResponse.json({ success: false, error: 'Waiting customer not found' }, { status: 404 });
    }

    // Remove the customer from the queue
    await db.waitingCustomer.delete({
      where: { id: waitingCustomerId }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Customer removed from queue successfully' 
    });

  } catch (error: any) {
    console.error("Queue Remove Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

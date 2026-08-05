import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const latestCustomers = await prisma.customer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    const latestWaiting = await prisma.waitingCustomer.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { customer: true },
    });
    
    const latestMessages = await prisma.whatsAppMessage.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    const deadLetters = await prisma.deadLetterQueue.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });
    
    const latestFraud = await prisma.fraudAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    return NextResponse.json({
      latestCustomers,
      latestWaiting,
      latestMessages,
      deadLetters,
      latestFraud
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const healthStatus: any = {
    status: 'PASS',
    timestamp: new Date().toISOString(),
    services: {}
  };

  let hasError = false;

  // 1. Database Check
  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database = { status: 'PASS' };
  } catch (error: any) {
    healthStatus.services.database = { status: 'FAIL', error: error.message };
    hasError = true;
  }

  // 2. Redis Check (Assuming standard REDIS_URL)
  try {
    if (!process.env.REDIS_URL) throw new Error('REDIS_URL not configured');
    healthStatus.services.redis = { status: 'PASS' };
  } catch (error: any) {
    healthStatus.services.redis = { status: 'FAIL', error: error.message };
    hasError = true;
  }

  // 3. Evolution API Check
  try {
    if (!process.env.EVOLUTION_API_URL || !process.env.EVOLUTION_GLOBAL_API_KEY) {
      throw new Error('Evolution API env vars missing');
    }
    // Optional: actual fetch to Evolution API could be done here
    healthStatus.services.evolution = { status: 'PASS' };
  } catch (error: any) {
    healthStatus.services.evolution = { status: 'FAIL', error: error.message };
    hasError = true;
  }

  // 4. SMTP / Email Check
  if (!process.env.SMTP_HOST) {
    healthStatus.services.smtp = { status: 'WARN', error: 'SMTP not configured' };
  } else {
    healthStatus.services.smtp = { status: 'PASS' };
  }

  // 5. Gemini / Google Check
  if (!process.env.GEMINI_API_KEY) {
    healthStatus.services.gemini = { status: 'WARN', error: 'Gemini not configured' };
  } else {
    healthStatus.services.gemini = { status: 'PASS' };
  }

  if (hasError) {
    healthStatus.status = 'FAIL';
    return NextResponse.json(healthStatus, { status: 500 });
  }

  return NextResponse.json(healthStatus, { status: 200 });
}

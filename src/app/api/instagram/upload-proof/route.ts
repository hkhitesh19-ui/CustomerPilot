import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const merchantId = formData.get("merchantId") as string | null;
    const customerId = formData.get("customerId") as string | null;
    const phone = formData.get("phone") as string | null;
    const notes = formData.get("notes") as string | null;

    if (!file || !merchantId || !customerId || !phone) {
      return NextResponse.json({ error: "file, merchantId, customerId, and phone are required" }, { status: 400 });
    }

    const merchant = await db.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
    await mkdir(uploadDir, { recursive: true });

    const ext = file.name ? path.extname(file.name) || ".jpg" : ".jpg";
    const filename = `ig_proof_${Date.now()}_${crypto.randomBytes(4).toString("hex")}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const proof = await db.instagramStoryProof.create({
      data: {
        merchantId,
        customerId,
        phone,
        screenshot: `/uploads/proofs/${filename}`,
        stamps: 2,
        notes: notes || "Story screenshot uploaded via customer wallet",
        status: "PENDING"
      }
    });

    return NextResponse.json({
      success: true,
      proofId: proof.id,
      screenshotUrl: proof.screenshot,
      status: proof.status
    });
  } catch (error: any) {
    console.error("[Upload Proof Error]:", error);
    return NextResponse.json({ error: error.message || "Failed to upload proof" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/jpg"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

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

    // 1. Authoritative Customer & Merchant Verification (Anti-Forgery)
    const customer = await db.customer.findFirst({
      where: { id: customerId, merchantId, phone }
    });
    if (!customer) {
      return NextResponse.json({ error: "Invalid customer credentials or customer does not belong to merchant" }, { status: 403 });
    }

    // 2. File Size & MIME Type Security Validation
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB size limit" }, { status: 400 });
    }

    const mimeType = file.type?.toLowerCase();
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP images are permitted" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 3. Magic Number Byte Verification (Prevent Spoofed Extensions)
    const isJpeg = buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
    const isPng = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
    const isWebp = buffer.length > 12 && buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP";

    if (!isJpeg && !isPng && !isWebp) {
      return NextResponse.json({ error: "Corrupt or spoofed image binary rejected" }, { status: 400 });
    }

    // 4. Save to secure storage path
    const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
    await mkdir(uploadDir, { recursive: true });

    const ext = isPng ? ".png" : (isWebp ? ".webp" : ".jpg");
    const filename = `ig_proof_${Date.now()}_${crypto.randomBytes(6).toString("hex")}${ext}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    const proof = await db.instagramStoryProof.create({
      data: {
        merchantId,
        customerId,
        phone,
        screenshot: `/uploads/proofs/${filename}`,
        stamps: 2,
        notes: notes ? String(notes).substring(0, 300) : "Story screenshot uploaded via customer wallet",
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

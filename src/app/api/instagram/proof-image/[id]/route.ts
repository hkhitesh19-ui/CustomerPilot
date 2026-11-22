import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return new Response("Not found", { status: 404 });
    }

    const proof = await db.instagramStoryProof.findUnique({
      where: { id }
    });

    if (!proof || !proof.screenshot) {
      return new Response("Proof image not found", { status: 404 });
    }

    // Storage directory outside public/
    const storageDir = path.join(process.cwd(), "storage", "proofs");
    const filename = path.basename(proof.screenshot);
    const filePath = path.join(storageDir, filename);

    try {
      const buffer = await readFile(filePath);
      const ext = path.extname(filename).toLowerCase();
      let contentType = "image/jpeg";
      if (ext === ".png") contentType = "image/png";
      else if (ext === ".webp") contentType = "image/webp";

      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "private, max-age=86400, no-transform",
          "X-Content-Type-Options": "nosniff"
        }
      });
    } catch {
      // Fallback if file was saved in legacy public path during transition
      const legacyPath = path.join(process.cwd(), "public", "uploads", "proofs", filename);
      const buffer = await readFile(legacyPath);
      return new Response(buffer, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "private, max-age=86400"
        }
      });
    }
  } catch (err: any) {
    return new Response("Error reading proof image", { status: 500 });
  }
}

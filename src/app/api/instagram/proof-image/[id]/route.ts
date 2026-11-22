import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";
import { jwtVerify } from "jose";
import { getJwtSecret } from "@/lib/jwt-secret";

async function getCallerAuth(req: NextRequest): Promise<{ merchantId: string; isSuperAdmin: boolean } | null> {
  const token = req.cookies.get("token")?.value || req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(getJwtSecret()));
    const role = (payload.role as string) || "";
    const tokenMerchantId = (payload.merchantId as string) || "";

    const impCookie = req.cookies.get("cp_impersonation")?.value;
    if (impCookie) {
      try {
        const imp = JSON.parse(impCookie);
        if (imp?.merchantId) {
          return { merchantId: imp.merchantId, isSuperAdmin: role === "super_admin" };
        }
      } catch {}
    }

    return {
      merchantId: tokenMerchantId,
      isSuperAdmin: role === "super_admin" || role === "admin"
    };
  } catch {
    return null;
  }
}

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

    // RBAC Guard: Require authenticated merchant session & enforce tenant boundary
    const auth = await getCallerAuth(req);
    if (!auth) {
      return new Response("Unauthorized: Merchant login session required", { status: 401 });
    }

    if (!auth.isSuperAdmin && auth.merchantId && auth.merchantId !== proof.merchantId) {
      return new Response("Forbidden: Cross-merchant access denied", { status: 403 });
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

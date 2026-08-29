import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const safeName = path.basename(filename);

    const candidateDirs = [
      path.join(process.cwd(), "public", "uploads"),
      path.join(process.cwd(), ".next", "standalone", "public", "uploads"),
      path.join(process.cwd(), "public"),
      path.join(process.cwd(), ".next", "standalone", "public"),
    ];

    let fileBuffer = null;
    let foundPath = null;

    for (const dir of candidateDirs) {
      const fullPath = path.join(dir, safeName);
      if (fs.existsSync(fullPath)) {
        fileBuffer = fs.readFileSync(fullPath);
        foundPath = fullPath;
        break;
      }
    }

    if (!fileBuffer || !foundPath) {
      return new NextResponse("File Not Found", { status: 404 });
    }

    const ext = path.extname(safeName).toLowerCase();
    const mimeMap = {
      ".png": "image/png",
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
      ".gif": "image/gif",
    };

    const contentType = mimeMap[ext] || "application/octet-stream";

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
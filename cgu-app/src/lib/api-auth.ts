import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "./auth";

export async function requireApiKey(request: NextRequest): Promise<NextResponse | null> {
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.API_SECRET_KEY;

  // L'administrateur peut appeler les API sans clé secrète via son cookie
  const token = request.cookies.get("admin_token")?.value;
  if (token && await verifyToken(token)) {
    return null;
  }

  if (!apiKey) return null;

  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== apiKey) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return null;
}

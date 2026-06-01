import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function requireApiKey(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get("authorization");
  const apiKey = process.env.API_SECRET_KEY;

  if (!apiKey) return null;

  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.slice(7) !== apiKey) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  return null;
}

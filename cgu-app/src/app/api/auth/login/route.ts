import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createToken } from "@/lib/auth";

const loginSchema = z.object({
  password: z.string().min(1, "Mot de passe requis"),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Données invalides" }, { status: 400 });
    }

    if (parsed.data.password !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
    }

    const token = await createToken();
    const response = NextResponse.json({ success: true });
    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 86400,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Requête invalide" }, { status: 400 });
  }
}

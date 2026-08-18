import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signUserSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");

  const user = email ? await prisma.user.findFirst({ where: { email, active: true } }) : null;
  const ok = user && (await bcrypt.compare(password, user.passwordHash));

  if (!ok || !user) {
    return NextResponse.redirect(new URL("/panel/login?error=1", req.url), { status: 303 });
  }

  const res = NextResponse.redirect(new URL("/panel", req.url), { status: 303 });
  res.cookies.set("panel_session", signUserSession(user.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}

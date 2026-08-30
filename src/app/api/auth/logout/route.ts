import { NextResponse } from "next/server";

function assertSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const url = new URL(origin);
    return url.host === host;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!assertSameOrigin(request)) {
    return NextResponse.json({ message: "Invalid request origin" }, { status: 403 });
  }

  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.set("bank_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  return response;
}

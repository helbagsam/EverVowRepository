import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/adminSession";
import { checkRateLimit, getClientIp } from "@/lib/rateLimit";

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  // Batas lebih ketat dari login pembeli — ini gerbang ke seluruh data
  // pembeli & alat generate lisensi, jadi lebih sensitif kalau ditebak.
  const rateLimit = await checkRateLimit(`admin_login:${ip}`, { maxAttempts: 5, windowMinutes: 15 });
  if (rateLimit.blocked) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan login. Coba lagi dalam beberapa menit." },
      { status: 429 }
    );
  }

  const { password } = await req.json();

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "ADMIN_PASSWORD belum diset di server. Hubungi developer." },
      { status: 500 }
    );
  }

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Password admin salah." }, { status: 401 });
  }

  const session = await getAdminSession();
  session.isAdmin = true;
  await session.save();

  return NextResponse.json({ ok: true });
}

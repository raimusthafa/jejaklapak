import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Cari user di Prisma by ID
  const dbUserById = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      merchants: { select: { id: true, name: true, slug: true, verificationStatus: true } },
    },
  }).catch(() => null);

  // Cari user di Prisma by email
  const dbUserByEmail = await prisma.user.findUnique({
    where: { email: user.email! },
    include: {
      merchants: { select: { id: true, name: true, slug: true, verificationStatus: true } },
    },
  }).catch(() => null);

  return NextResponse.json({
    supabase_id: user.id,
    supabase_email: user.email,
    supabase_metadata: user.user_metadata,
    db_user_by_id: dbUserById
      ? { id: dbUserById.id, email: dbUserById.email, role: dbUserById.role, merchants: dbUserById.merchants }
      : null,
    db_user_by_email: dbUserByEmail
      ? { id: dbUserByEmail.id, email: dbUserByEmail.email, role: dbUserByEmail.role, merchants: dbUserByEmail.merchants }
      : null,
  });
}


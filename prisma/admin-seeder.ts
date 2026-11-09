import crypto from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import type { PrismaClient } from "../src/generated/prisma/client.js";

export interface SeedAdminResult {
  id: string;
  email: string;
  name: string;
  role: "ADMIN";
  authSynced: boolean;
}

const DEFAULT_ADMIN_ID = "00000000-0000-4000-8000-000000000099";
const SUPABASE_DEFAULT_INSTANCE_ID = "00000000-0000-0000-0000-000000000000";

export async function seedAdminUser(prisma: PrismaClient): Promise<SeedAdminResult> {
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@jejaklapak.id").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "AdminJejakLapak2026!";
  const name = (process.env.SEED_ADMIN_NAME || "Admin JejakLapak").trim();
  const phone = (process.env.SEED_ADMIN_PHONE || "081100000001").trim();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    "";

  const hasValidUrl = Boolean(supabaseUrl && !supabaseUrl.includes("placeholder"));
  const hasSecretKey = Boolean(supabaseSecretKey && !supabaseSecretKey.includes("placeholder"));
  const hasPublishableKey = Boolean(
    supabasePublishableKey && !supabasePublishableKey.includes("placeholder")
  );

  let userId: string | null = null;
  let authSynced = false;

  // 1. Jika ada Secret Key valid, gunakan Supabase Auth Admin API resmi
  if (hasValidUrl && hasSecretKey) {
    const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let existingAuthUserId: string | null = null;
    let page = 1;
    const perPage = 200;

    while (!existingAuthUserId) {
      const { data: listData, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (listErr) {
        throw new Error(`Gagal memeriksa user Supabase Auth: ${listErr.message}`);
      }

      const found = listData.users.find((u) => u.email?.toLowerCase() === email);
      if (found) {
        existingAuthUserId = found.id;
        break;
      }

      if (listData.users.length < perPage) {
        break;
      }
      page += 1;
    }

    if (existingAuthUserId) {
      const { data: updated, error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
        existingAuthUserId,
        {
          password,
          email_confirm: true,
          user_metadata: { name, phone, role: "ADMIN" },
          app_metadata: { role: "ADMIN", provider: "email", providers: ["email"] },
        }
      );

      if (updateErr || !updated.user) {
        throw new Error(`Gagal memperbarui admin di Supabase Auth: ${updateErr?.message}`);
      }

      userId = updated.user.id;
      authSynced = true;
    } else {
      const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, phone, role: "ADMIN" },
        app_metadata: { role: "ADMIN", provider: "email", providers: ["email"] },
      });

      if (createErr || !created.user) {
        throw new Error(`Gagal membuat admin di Supabase Auth: ${createErr?.message}`);
      }

      userId = created.user.id;
      authSynced = true;
    }
  } else {
    // 2. Sinkronisasi langsung via PostgreSQL (auth.users + auth.identities) jika Secret Key belum dikonfigurasi
    const existingAuthRows = await prisma.$queryRaw<
      Array<{ id: string }>
    >`SELECT id::text AS id FROM auth.users WHERE LOWER(email) = LOWER(${email}) LIMIT 1`;

    if (existingAuthRows.length > 0) {
      userId = existingAuthRows[0].id;
    } else {
      const claimedDefaultAuth = await prisma.$queryRaw<
        Array<{ id: string }>
      >`SELECT id::text AS id FROM auth.users WHERE id = ${DEFAULT_ADMIN_ID}::uuid LIMIT 1`;
      const claimedDefaultPublic = await prisma.user.findUnique({
        where: { id: DEFAULT_ADMIN_ID },
        select: { id: true, email: true },
      });

      const defaultIdFree =
        claimedDefaultAuth.length === 0 &&
        (!claimedDefaultPublic || claimedDefaultPublic.email.toLowerCase() === email);

      userId = defaultIdFree ? DEFAULT_ADMIN_ID : crypto.randomUUID();
    }

    const userMeta = JSON.stringify({
      sub: userId,
      name,
      email,
      phone,
      role: "ADMIN",
      email_verified: true,
      phone_verified: false,
    });
    const appMeta = JSON.stringify({
      provider: "email",
      providers: ["email"],
      role: "ADMIN",
    });

    const cryptSchemaRows = await prisma.$queryRaw<Array<{ schema_name: string }>>`
      SELECT n.nspname::text AS schema_name
      FROM pg_proc p
      JOIN pg_namespace n ON n.oid = p.pronamespace
      WHERE p.proname = 'crypt' AND n.nspname IN ('extensions', 'public')
      ORDER BY CASE WHEN n.nspname = 'extensions' THEN 0 ELSE 1 END
      LIMIT 1
    `;
    const cryptSchema = cryptSchemaRows[0]?.schema_name;
    if (!cryptSchema) {
      throw new Error(
        "Ekstensi pgcrypto (crypt/gen_salt) tidak ditemukan di database Postgres."
      );
    }

    if (cryptSchema === "extensions") {
      await prisma.$executeRaw`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          confirmation_token,
          recovery_token,
          email_change_token_new,
          email_change,
          phone_change,
          phone_change_token,
          email_change_token_current,
          reauthentication_token,
          raw_app_meta_data,
          raw_user_meta_data,
          is_sso_user,
          is_anonymous,
          created_at,
          updated_at
        )
        VALUES (
          ${SUPABASE_DEFAULT_INSTANCE_ID}::uuid,
          ${userId}::uuid,
          'authenticated',
          'authenticated',
          ${email}::text,
          extensions.crypt(${password}, extensions.gen_salt('bf')),
          NOW(),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ${appMeta}::jsonb,
          ${userMeta}::jsonb,
          false,
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET
          instance_id = COALESCE(auth.users.instance_id, ${SUPABASE_DEFAULT_INSTANCE_ID}::uuid),
          aud = 'authenticated',
          role = 'authenticated',
          email = EXCLUDED.email,
          encrypted_password = EXCLUDED.encrypted_password,
          email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW()),
          confirmation_token = COALESCE(auth.users.confirmation_token, ''),
          recovery_token = COALESCE(auth.users.recovery_token, ''),
          email_change_token_new = COALESCE(auth.users.email_change_token_new, ''),
          email_change = COALESCE(auth.users.email_change, ''),
          phone_change = COALESCE(auth.users.phone_change, ''),
          phone_change_token = COALESCE(auth.users.phone_change_token, ''),
          email_change_token_current = COALESCE(auth.users.email_change_token_current, ''),
          reauthentication_token = COALESCE(auth.users.reauthentication_token, ''),
          raw_app_meta_data = COALESCE(auth.users.raw_app_meta_data, '{}'::jsonb) || EXCLUDED.raw_app_meta_data,
          raw_user_meta_data = COALESCE(auth.users.raw_user_meta_data, '{}'::jsonb) || EXCLUDED.raw_user_meta_data,
          is_sso_user = false,
          is_anonymous = false,
          updated_at = NOW()
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO auth.users (
          instance_id,
          id,
          aud,
          role,
          email,
          encrypted_password,
          email_confirmed_at,
          confirmation_token,
          recovery_token,
          email_change_token_new,
          email_change,
          phone_change,
          phone_change_token,
          email_change_token_current,
          reauthentication_token,
          raw_app_meta_data,
          raw_user_meta_data,
          is_sso_user,
          is_anonymous,
          created_at,
          updated_at
        )
        VALUES (
          ${SUPABASE_DEFAULT_INSTANCE_ID}::uuid,
          ${userId}::uuid,
          'authenticated',
          'authenticated',
          ${email}::text,
          public.crypt(${password}, public.gen_salt('bf')),
          NOW(),
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          ${appMeta}::jsonb,
          ${userMeta}::jsonb,
          false,
          false,
          NOW(),
          NOW()
        )
        ON CONFLICT (id) DO UPDATE
        SET
          instance_id = COALESCE(auth.users.instance_id, ${SUPABASE_DEFAULT_INSTANCE_ID}::uuid),
          aud = 'authenticated',
          role = 'authenticated',
          email = EXCLUDED.email,
          encrypted_password = EXCLUDED.encrypted_password,
          email_confirmed_at = COALESCE(auth.users.email_confirmed_at, NOW()),
          confirmation_token = COALESCE(auth.users.confirmation_token, ''),
          recovery_token = COALESCE(auth.users.recovery_token, ''),
          email_change_token_new = COALESCE(auth.users.email_change_token_new, ''),
          email_change = COALESCE(auth.users.email_change, ''),
          phone_change = COALESCE(auth.users.phone_change, ''),
          phone_change_token = COALESCE(auth.users.phone_change_token, ''),
          email_change_token_current = COALESCE(auth.users.email_change_token_current, ''),
          reauthentication_token = COALESCE(auth.users.reauthentication_token, ''),
          raw_app_meta_data = COALESCE(auth.users.raw_app_meta_data, '{}'::jsonb) || EXCLUDED.raw_app_meta_data,
          raw_user_meta_data = COALESCE(auth.users.raw_user_meta_data, '{}'::jsonb) || EXCLUDED.raw_user_meta_data,
          is_sso_user = false,
          is_anonymous = false,
          updated_at = NOW()
      `;
    }

    const existingIdentity = await prisma.$queryRaw<Array<{ id: string }>>`
      SELECT id::text AS id
      FROM auth.identities
      WHERE user_id = ${userId}::uuid AND provider = 'email'
      LIMIT 1
    `;

    if (existingIdentity.length > 0) {
      await prisma.$executeRaw`
        UPDATE auth.identities
        SET
          identity_data = ${userMeta}::jsonb,
          updated_at = NOW()
        WHERE id = ${existingIdentity[0].id}::uuid
      `;
    } else {
      await prisma.$executeRaw`
        INSERT INTO auth.identities (
          provider_id,
          user_id,
          identity_data,
          provider,
          last_sign_in_at,
          created_at,
          updated_at
        )
        VALUES (
          ${userId}::text,
          ${userId}::uuid,
          ${userMeta}::jsonb,
          'email',
          NOW(),
          NOW(),
          NOW()
        )
        ON CONFLICT (provider_id, provider) DO UPDATE
        SET
          user_id = EXCLUDED.user_id,
          identity_data = EXCLUDED.identity_data,
          updated_at = NOW()
      `;
    }

    if (hasValidUrl && hasPublishableKey) {
      const supabaseClient = createClient(supabaseUrl, supabasePublishableKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });

      const { data: verifyData, error: verifyErr } =
        await supabaseClient.auth.signInWithPassword({
          email,
          password,
        });

      if (verifyErr || !verifyData.user) {
        throw new Error(
          `Verifikasi login Supabase Auth untuk Admin gagal: ${verifyErr?.message ?? "Unknown error"}`
        );
      }

      await supabaseClient.auth.signOut({ scope: "local" });
      authSynced = true;
    }
  }

  if (!userId) {
    throw new Error("Gagal menentukan ID user Admin.");
  }

  // 3. Sinkronisasi record public.users dengan ID auth.users & role ADMIN
  const existingPublicByEmail = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingPublicByEmail && existingPublicByEmail.id !== userId) {
    await prisma.user.delete({ where: { id: existingPublicByEmail.id } });
  }

  await prisma.user.upsert({
    where: { id: userId },
    update: {
      name,
      email,
      phone,
      role: "ADMIN",
    },
    create: {
      id: userId,
      name,
      email,
      phone,
      role: "ADMIN",
    },
  });

  return {
    id: userId,
    email,
    name,
    role: "ADMIN",
    authSynced,
  };
}

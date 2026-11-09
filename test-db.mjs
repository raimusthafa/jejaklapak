import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

for (const key of ["DATABASE_URL", "DIRECT_URL"]) {
  const raw = process.env[key];
  if (!raw) {
    console.log(key, "-> KOSONG");
    continue;
  }

  let info;
  try {
    const u = new URL(raw);
    info = {
      user: decodeURIComponent(u.username),
      host: u.hostname,
      port: u.port,
      panjangPassword: decodeURIComponent(u.password).length,
      adaTandaKurung: raw.includes("[") || raw.includes("]"),
    };
  } catch {
    console.log(key, "-> FORMAT URL TIDAK VALID (cek karakter khusus di password)");
    continue;
  }
  console.log(key, info);

  const client = new pg.Client({
    connectionString: raw,
    ssl: { rejectUnauthorized: false },
  });
  try {
    await client.connect();
    const r = await client.query("select 1 as ok");
    console.log("   BERHASIL", r.rows[0]);
  } catch (e) {
    console.log("   GAGAL:", e.code, "|", e.message);
  } finally {
    await client.end().catch(() => {});
  }
}
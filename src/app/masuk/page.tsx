"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function continueAfterAuthentication(supabase: NonNullable<ReturnType<typeof createClient>>) {
    // The database function verifies the confirmed account against its trusted allowlist
    // and refuses bootstrap once a different platform administrator exists.
    const { data: isInitialAdmin, error: bootstrapError } = await supabase.rpc("bootstrap_platform_admin");
    router.push(!bootstrapError && isInitialAdmin === true ? "/admin" : "/katalog");
    router.refresh();
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    const supabase = createClient();
    if (!supabase) {
      setMessage("Layanan akun belum dikonfigurasi. NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY harus dipasang pada lingkungan deployment.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: name.trim() } }
        });
        if (error) throw error;
        if (data.session) {
          await continueAfterAuthentication(supabase);
        } else {
          setMessage("Pendaftaran diterima. Periksa email untuk konfirmasi akun sebelum masuk.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await continueAfterAuthentication(supabase);
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setBusy(false);
    }
  }

  return <main className="auth-page">
    <div className="auth-panel">
      <Link className="brand" href="/"><span className="brand-mark">P</span><span>pasar<span className="brand-accent">nusa</span><small>Pedagang Ecer, Pelayanan Sultan.</small></span></Link>
      <div className="auth-heading"><span className="eyebrow">SELAMAT DATANG</span><h1>{mode === "signin" ? "Senang bertemu lagi." : "Mari tumbuh bersama."}</h1><p>{mode === "signin" ? "Masuk untuk melanjutkan perjalanan dagang Anda." : "Buat akun untuk memulai di Pasar-Nusa."}</p></div>
      <div className="auth-tabs"><button type="button" className={mode === "signin" ? "active" : ""} onClick={() => {setMode("signin");setMessage("");}}>Masuk</button><button type="button" className={mode === "signup" ? "active" : ""} onClick={() => {setMode("signup");setMessage("");}}>Daftar</button></div>
      <form className="auth-form" onSubmit={submit}>
        {mode === "signup" && <label>Nama tampilan<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} required minLength={1} maxLength={120} placeholder="Nama Anda" /></label>}
        <label>Email<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required placeholder="nama@email.com" /></label>
        <label>Kata sandi<input type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={e=>setPassword(e.target.value)} required minLength={8} placeholder="Minimal 8 karakter" /></label>
        <button className="button auth-submit" type="submit" disabled={busy}>{busy ? "Memproses..." : mode === "signin" ? "Masuk ke akun" : "Buat akun"} <span>→</span></button>
      </form>
      {message && <p className="auth-message" role="status">{message}</p>}
      <p className="auth-footnote">Dengan melanjutkan, Anda setuju menggunakan layanan secara jujur dan menjaga keamanan akun.</p>
      <Link className="back-link" href="/">← Kembali ke beranda</Link>
    </div>
    <aside className="auth-aside"><span className="eyebrow">PASAR-NUSA</span><h2>Ekosistem dagang yang tumbuh dari kepercayaan.</h2><p>Informasi jelas, stok terkonfirmasi, dan transaksi dengan alur yang dapat ditelusuri.</p><div className="auth-aside-note">Pedagang Ecer,<br/><strong>Pelayanan Sultan.</strong></div></aside>
  </main>;
}

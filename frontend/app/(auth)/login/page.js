"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function LoginPage() {
 const router = useRouter();
 const [tab, setTab] = useState("admin");
 const [form, setForm] = useState({ email: "", nidn: "", password: "" });
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
   const payload =
    tab === "admin"
     ? { email: form.email, password: form.password, role: "admin" }
     : { nidn: form.nidn, password: form.password, role: "dosen" };

   const res = await axios.post(
    "http://localhost:5000/api/auth/login",
    payload,
   );

   Cookies.set("token", res.data.token, { expires: 1 });
   Cookies.set("user", JSON.stringify(res.data.user), { expires: 1 });

   if (tab === "admin") {
    router.push("/dashboard");
   } else {
    router.push("/beranda");
   }
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="min-h-screen flex">
   {/* Sisi Kiri — Ungu */}
   <div className="hidden md:flex w-1/2 bg-purple-700 flex-col justify-center px-12 text-white relative overflow-hidden">
    {/* Background decorative circles */}
    <div className="absolute top-[-80px] left-[-80px] w-64 h-64 bg-purple-600 rounded-full opacity-50" />
    <div className="absolute bottom-[-60px] right-[-60px] w-48 h-48 bg-purple-500 rounded-full opacity-40" />

    {/* Logo placeholder */}
    <div className="w-12 h-12 bg-purple-500 rounded-xl mb-8 z-10" />

    <h1 className="text-3xl font-bold mb-1 z-10">Sistem Presensi</h1>
    <h1 className="text-3xl font-bold text-purple-300 mb-4 z-10">
     Pengenalan Wajah
    </h1>
    <p className="text-purple-200 text-sm leading-relaxed mb-8 z-10">
     Kelola data kehadiran mahasiswa secara otomatis, cepat, dan akurat
     menggunakan teknologi Artificial Intelligence terdepan.
    </p>

    {/* Image placeholder */}
    {/* GANTI DIV INI DENGAN KOMPONEN IMAGE SESUAI MOCKUP */}
    <div className="w-full h-48 bg-purple-600 rounded-2xl flex items-center justify-center mb-8 z-10">
     <span className="text-purple-300 text-sm">[Ilustrasi / Gambar]</span>
    </div>

    <div className="bg-purple-600 rounded-xl p-4 flex items-center gap-3 z-10">
     <div className="w-10 h-10 bg-purple-400 rounded-lg flex items-center justify-center text-xl shrink-0">
      ⚡
     </div>
     <div>
      <p className="font-semibold text-sm">Pemrosesan Real-time</p>
      <p className="text-purple-300 text-xs">
       Ekstraksi 128-dimensi Face Descriptor dalam hitungan milidetik.
      </p>
     </div>
    </div>
   </div>

   {/* Sisi Kanan — Putih */}
   <div className="w-full md:w-1/2 flex items-center justify-center px-8 bg-white">
    <div className="w-full max-w-md">
     <h2 className="text-2xl font-bold text-gray-800 mb-1">Selamat Datang!</h2>
     <p className="text-gray-500 text-sm mb-6">Silakan Sign In.</p>

     {/* Tab */}
     <div className="flex rounded-lg border border-gray-200 mb-6 overflow-hidden">
      <button
       onClick={() => setTab("dosen")}
       className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
        tab === "dosen"
         ? "bg-white text-purple-700 font-semibold shadow-sm"
         : "bg-gray-50 text-gray-400"
       }`}
      >
       Masuk sebagai Dosen
      </button>
      <button
       onClick={() => setTab("admin")}
       className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
        tab === "admin"
         ? "bg-white text-purple-700 font-semibold shadow-sm"
         : "bg-gray-50 text-gray-400"
       }`}
      >
       Administrator
      </button>
     </div>

     {/* Form */}
     <form onSubmit={handleSubmit} className="space-y-4">
      {tab === "admin" ? (
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Email
        </label>
        <input
         type="email"
         placeholder="admin@kampus.ac.id"
         value={form.email}
         onChange={(e) => setForm({ ...form, email: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        />
       </div>
      ) : (
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         NIDN (Nomor Induk Dosen)
        </label>
        <input
         type="text"
         placeholder="Masukkan NIDN Anda..."
         value={form.nidn}
         onChange={(e) => setForm({ ...form, nidn: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        />
       </div>
      )}

      <div>
       <label className="text-sm font-medium text-gray-700">Password</label>

       <input
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
        required
       />
      </div>

      {/* <div className="flex items-center gap-2">
       <input type="checkbox" id="remember" className="accent-purple-600" />
       <label htmlFor="remember" className="text-sm text-gray-600">
        Ingat saya di perangkat ini
       </label>
      </div> */}

      {error && (
       <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
        {error}
       </p>
      )}

      <button
       type="submit"
       disabled={loading}
       className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg transition-colors disabled:opacity-50"
      >
       {loading ? "Memproses..." : "Sign In"}
      </button>
     </form>

     <p className="text-center text-xs text-gray-400 mt-8">
      © 2026 Universitas Catur Insan Cendekia. <br />
      Teknik Informatika
     </p>
    </div>
   </div>
  </div>
 );
}

"use client";

import { useState } from "react";
import Cookies from "js-cookie";
import api from "@/lib/axios";

export default function PengaturanPage() {
 const user = JSON.parse(Cookies.get("user") || "{}");
 const [form, setForm] = useState({
  nama: user.nama || "",
  email: user.email || "",
  passwordLama: "",
  passwordBaru: "",
 });
 const [status, setStatus] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus("");
  setError("");
  setLoading(true);

  try {
   await api.put(`/dosen/${user.id}`, {
    nama: form.nama,
    email: form.email,
    password: form.passwordBaru || undefined,
   });
   setStatus("Profil berhasil diperbarui!");

   // Update cookie
   Cookies.set(
    "user",
    JSON.stringify({
     ...user,
     nama: form.nama,
     email: form.email,
    }),
   );
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
  } finally {
   setLoading(false);
  }
 };

 return (
  <div className="max-w-lg">
   <h1 className="text-2xl font-bold text-gray-800 mb-1">Pengaturan</h1>
   <p className="text-gray-500 text-sm mb-6">
    Kelola informasi profil dan keamanan akun Anda.
   </p>

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    <form onSubmit={handleSubmit} className="text-gray-700 space-y-4">
     <div>
      <label className="block text-sm font-mediu mb-1">Nama</label>
      <input
       type="text"
       value={form.nama}
       onChange={(e) => setForm({ ...form, nama: e.target.value })}
       className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
     </div>

     <div>
      <label className="block text-sm font-mediu mb-1">Email</label>
      <input
       type="email"
       value={form.email}
       onChange={(e) => setForm({ ...form, email: e.target.value })}
       className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
     </div>

     <hr className="border-gray-100" />

     <p className="text-sm font-mediu">Ganti Password (opsional)</p>

     <div>
      <label className="block text-sm font-mediu mb-1">Password Baru</label>
      <input
       type="password"
       placeholder="Kosongkan jika tidak ingin ganti"
       value={form.passwordBaru}
       onChange={(e) => setForm({ ...form, passwordBaru: e.target.value })}
       className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
     </div>

     {status && (
      <p className="text-green-600 text-sm bg-green-50 px-3 py-2 rounded-lg">
       {status}
      </p>
     )}
     {error && (
      <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
       {error}
      </p>
     )}

     <button
      type="submit"
      disabled={loading}
      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-lg text-sm"
     >
      {loading ? "Menyimpan..." : "Simpan Perubahan"}
     </button>
    </form>
   </div>
  </div>
 );
}

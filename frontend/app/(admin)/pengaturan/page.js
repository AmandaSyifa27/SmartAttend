"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import PageHeader from "@/components/ui/PageHeader";
import FormInput from "@/components/ui/FormInput";
import Button from "@/components/ui/Button";

export default function PengaturanAdminPage() {
 const [user, setUser] = useState({});
 const [mounted, setMounted] = useState(false);

 const [form, setForm] = useState({
  nama: "",
  email: "",
  passwordBaru: "",
 });
 //  const user = JSON.parse(Cookies.get("user") || "{}");
 //  const [form, setForm] = useState({
 //   nama: user.nama || "",
 //   email: user.email || "",
 //   passwordBaru: "",
 //  });
 const [status, setStatus] = useState("");
 const [error, setError] = useState("");
 const [loading, setLoading] = useState(false);

 useEffect(() => {
  const userData = JSON.parse(Cookies.get("user") || "{}");
  setUser(userData);
  setForm({
   nama: userData.nama || "",
   email: userData.email || "",
   passwordBaru: "",
  });
  setMounted(true);
 }, []);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setStatus("");
  setError("");
  setLoading(true);
  try {
   await api.put(`/admin/${user.id}`, {
    nama: form.nama,
    email: form.email,
    password: form.passwordBaru || undefined,
   });
   setStatus("Profil berhasil diperbarui!");

   const updatedUser = { ...user, nama: form.nama, email: form.email };
   Cookies.set("user", JSON.stringify(updatedUser));
   setUser(updatedUser);
   setForm((prev) => ({ ...prev, passwordBaru: "" }));
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
  } finally {
   setLoading(false);
  }
 };

 if (!mounted) {
  return <div className="max-w-lg">Loading...</div>;
 }

 return (
  <div className="max-w-lg mx-auto w-full">
   <PageHeader
    title="Pengaturan"
    subtitle="Kelola informasi profil dan keamanan akun Anda."
   />

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
    {/* Avatar */}
    <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
     <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
      {user.nama?.charAt(0)}
     </div>
     <div>
      <p className="font-semibold text-gray-800">{user.nama || "Admin"}</p>
      <p className="text-sm text-gray-400">Super Admin</p>
     </div>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4">
     <FormInput
      label="Nama"
      value={form.nama}
      onChange={(e) => setForm({ ...form, nama: e.target.value })}
      required
     />
     <FormInput
      label="Email"
      type="email"
      value={form.email}
      onChange={(e) => setForm({ ...form, email: e.target.value })}
     />

     <hr className="border-gray-100" />
     <p className="text-sm font-medium text-gray-500">
      Ganti Password (opsional)
     </p>

     <FormInput
      label="Password Baru"
      type="password"
      placeholder="Kosongkan jika tidak ingin ganti"
      value={form.passwordBaru}
      onChange={(e) => setForm({ ...form, passwordBaru: e.target.value })}
     />

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

     <Button type="submit" disabled={loading} className="w-full">
      {loading ? "Menyimpan..." : "Simpan Perubahan"}
     </Button>
    </form>
   </div>
  </div>
 );
}

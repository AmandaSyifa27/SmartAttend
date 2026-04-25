"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import ModalEnrollWajah from "@/components/shared/ModalEnrollWajah";

export default function MahasiswaPage() {
 const [mahasiswa, setMahasiswa] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [showModal, setShowModal] = useState(false);
 const [editData, setEditData] = useState(null);
 const [enrollMhs, setEnrollMhs] = useState(null);
 const [form, setForm] = useState({
  nim: "",
  nama: "",
  prodi: "",
  kelas: "",
  angkatan: "",
  email: "",
 });
 const [error, setError] = useState("");

 const fetchMahasiswa = async () => {
  try {
   const res = await api.get("/mahasiswa");
   setMahasiswa(res.data);
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchMahasiswa();
 }, []);

 const handleOpenAdd = () => {
  setEditData(null);
  setForm({ nim: "", nama: "", prodi: "", kelas: "", angkatan: "", email: "" });
  setError("");
  setShowModal(true);
 };

 const handleOpenEdit = (item) => {
  setEditData(item);
  setForm({
   nim: item.nim,
   nama: item.nama,
   prodi: item.prodi,
   kelas: item.kelas,
   angkatan: item.angkatan,
   email: item.email || "",
  });
  setError("");
  setShowModal(true);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
   if (editData) {
    await api.put(`/mahasiswa/${editData.id}`, form);
   } else {
    await api.post("/mahasiswa", form);
   }
   setShowModal(false);
   fetchMahasiswa();
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
  }
 };

 const handleDelete = async (id) => {
  if (!confirm("Yakin ingin menghapus mahasiswa ini?")) return;
  try {
   await api.delete(`/mahasiswa/${id}`);
   fetchMahasiswa();
  } catch (err) {
   alert(err.response?.data?.message || "Gagal menghapus");
  }
 };

 const filtered = mahasiswa.filter(
  (m) =>
   m.nama.toLowerCase().includes(search.toLowerCase()) ||
   m.nim.includes(search),
 );

 return (
  <div>
   <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold text-gray-800">
     Kelola Mahasiswa & Wajah
    </h1>
    <button
     onClick={handleOpenAdd}
     className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
    >
     + Tambah Mahasiswa
    </button>
   </div>

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-100">
     <input
      type="text"
      placeholder="Cari NIM atau Nama..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full max-w-xs border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
     />
    </div>

    <table className="w-full text-sm">
     <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
      <tr>
       <th className="px-5 py-3 text-left">NIM</th>
       <th className="px-5 py-3 text-left">Nama Mahasiswa</th>
       <th className="px-5 py-3 text-left">Status Data Wajah</th>
       <th className="px-5 py-3 text-left">Aksi</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-gray-100">
      {loading ? (
       <tr>
        <td colSpan={4} className="text-center py-8 text-gray-400">
         Memuat data...
        </td>
       </tr>
      ) : filtered.length === 0 ? (
       <tr>
        <td colSpan={4} className="text-center py-8 text-gray-400">
         Tidak ada data mahasiswa.
        </td>
       </tr>
      ) : (
       filtered.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
         <td
          className={`px-5 py-3 font-medium ${!item.isFaceEnrolled ? "text-red-500" : "text-gray-700"}`}
         >
          {item.nim}
         </td>
         <td
          className={`px-5 py-3 ${!item.isFaceEnrolled ? "font-semibold text-red-500" : "text-gray-700"}`}
         >
          {item.nama}
         </td>
         <td className="px-5 py-3">
          {item.isFaceEnrolled ? (
           <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
            ✓ Terekam
           </span>
          ) : (
           <span className="bg-orange-100 text-orange-600 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1 w-fit">
            ⚠ Belum Direkam
           </span>
          )}
         </td>
         <td className="px-5 py-3">
          <div className="flex items-center gap-2">
           {!item.isFaceEnrolled && (
            <button
             onClick={() => setEnrollMhs(item)}
             className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
            >
             📷 Rekam Wajah Sekarang
            </button>
           )}
           {item.isFaceEnrolled && (
            <button
             onClick={() => setEnrollMhs(item)}
             className="text-gray-400 hover:text-purple-600"
             title="Rekam Ulang"
            >
             📷
            </button>
           )}
           <button
            onClick={() => handleOpenEdit(item)}
            className="text-gray-400 hover:text-purple-600"
            title="Edit"
           >
            ✏️
           </button>
           <button
            onClick={() => handleDelete(item.id)}
            className="text-gray-400 hover:text-red-500"
            title="Hapus"
           >
            🗑️
           </button>
          </div>
         </td>
        </tr>
       ))
      )}
     </tbody>
    </table>
   </div>

   {/* Modal Tambah/Edit */}
   {showModal && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
     <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-4">
       <h2 className="font-bold text-gray-800 text-lg">
        {editData ? "Edit Mahasiswa" : "Tambah Mahasiswa"}
       </h2>
       <button
        onClick={() => setShowModal(false)}
        className="text-gray-400 hover:text-gray-600 text-xl"
       >
        ✕
       </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
       <div className="grid grid-cols-2 gap-3">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          NIM
         </label>
         <input
          type="text"
          placeholder="2023001"
          value={form.nim}
          onChange={(e) => setForm({ ...form, nim: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          Angkatan
         </label>
         <input
          type="number"
          placeholder="2023"
          value={form.angkatan}
          onChange={(e) => setForm({ ...form, angkatan: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
         />
        </div>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Nama
        </label>
        <input
         type="text"
         placeholder="Nama lengkap"
         value={form.nama}
         onChange={(e) => setForm({ ...form, nama: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        />
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Program Studi
        </label>
        <input
         type="text"
         placeholder="Teknik Informatika"
         value={form.prodi}
         onChange={(e) => setForm({ ...form, prodi: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        />
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Kelas
        </label>
        <input
         type="text"
         placeholder="TI-6A"
         value={form.kelas}
         onChange={(e) => setForm({ ...form, kelas: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        />
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Email
        </label>
        <input
         type="email"
         placeholder="mahasiswa@kampus.ac.id"
         value={form.email}
         onChange={(e) => setForm({ ...form, email: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
       </div>

       {error && (
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
         {error}
        </p>
       )}

       <div className="flex gap-3 pt-2">
        <button
         type="button"
         onClick={() => setShowModal(false)}
         className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
        >
         Batal
        </button>
        <button
         type="submit"
         className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-lg"
        >
         {editData ? "Simpan Perubahan" : "Tambah Mahasiswa"}
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
   {enrollMhs && (
    <ModalEnrollWajah
     mahasiswa={enrollMhs}
     onClose={() => setEnrollMhs(null)}
     onSuccess={fetchMahasiswa}
    />
   )}
  </div>
 );
}

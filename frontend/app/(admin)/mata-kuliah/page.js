"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

export default function MataKuliahPage() {
 const [mataKuliah, setMataKuliah] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [showModal, setShowModal] = useState(false);
 const [editData, setEditData] = useState(null);
 const [form, setForm] = useState({ kode: "", nama: "", sks: "" });
 const [error, setError] = useState("");

 const fetchMataKuliah = async () => {
  try {
   const res = await api.get("/mata-kuliah");
   setMataKuliah(res.data);
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchMataKuliah();
 }, []);

 const handleOpenAdd = () => {
  setEditData(null);
  setForm({ kode: "", nama: "", sks: "" });
  setError("");
  setShowModal(true);
 };

 const handleOpenEdit = (item) => {
  setEditData(item);
  setForm({ kode: item.kode, nama: item.nama, sks: item.sks });
  setError("");
  setShowModal(true);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
   if (editData) {
    await api.put(`/mata-kuliah/${editData.id}`, form);
   } else {
    await api.post("/mata-kuliah", form);
   }
   setShowModal(false);
   fetchMataKuliah();
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
  }
 };

 const handleDelete = async (id) => {
  if (!confirm("Yakin ingin menghapus mata kuliah ini?")) return;
  try {
   await api.delete(`/mata-kuliah/${id}`);
   fetchMataKuliah();
  } catch (err) {
   alert(err.response?.data?.message || "Gagal menghapus");
  }
 };

 const filtered = mataKuliah.filter(
  (m) =>
   m.nama.toLowerCase().includes(search.toLowerCase()) ||
   m.kode.toLowerCase().includes(search.toLowerCase()),
 );

 return (
  <div>
   <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold text-gray-800">Kelola Mata Kuliah</h1>
    <button
     onClick={handleOpenAdd}
     className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
    >
     + Tambah Mata Kuliah
    </button>
   </div>

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-100">
     <input
      type="text"
      placeholder="Cari Kode atau Nama MK..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full max-w-xs border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
     />
    </div>

    <table className="w-full text-sm">
     <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
      <tr>
       <th className="px-5 py-3 text-left">Kode MK</th>
       <th className="px-5 py-3 text-left">Mata Kuliah</th>
       <th className="px-5 py-3 text-left">SKS</th>
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
         Tidak ada data mata kuliah.
        </td>
       </tr>
      ) : (
       filtered.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
         <td className="px-5 py-3 font-medium text-gray-700">{item.kode}</td>
         <td className="px-5 py-3 text-gray-700">{item.nama}</td>
         <td className="px-5 py-3 text-gray-500">{item.sks}</td>
         <td className="px-5 py-3">
          <div className="flex items-center gap-2">
           <button
            onClick={() => handleOpenEdit(item)}
            className="text-gray-400 hover:text-purple-600"
           >
            ✏️
           </button>
           <button
            onClick={() => handleDelete(item.id)}
            className="text-gray-400 hover:text-red-500"
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

   {/* Modal */}
   {showModal && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
     <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-4">
       <h2 className="font-bold text-gray-800 text-lg">
        {editData ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
       </h2>
       <button
        onClick={() => setShowModal(false)}
        className="text-gray-400 hover:text-gray-600 text-xl"
       >
        ✕
       </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Kode MK
        </label>
        <input
         type="text"
         placeholder="Contoh: TI-601"
         value={form.kode}
         onChange={(e) => setForm({ ...form, kode: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        />
       </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Nama Mata Kuliah
        </label>
        <input
         type="text"
         placeholder="Contoh: Pemrograman Web Lanjut"
         value={form.nama}
         onChange={(e) => setForm({ ...form, nama: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        />
       </div>
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         SKS
        </label>
        <input
         type="number"
         placeholder="3"
         min="1"
         max="6"
         value={form.sks}
         onChange={(e) => setForm({ ...form, sks: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
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
         {editData ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import PageHeader from "@/components/ui/PageHeader";
import { BookPlus, SquarePen, Trash } from "lucide-react";

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
   <PageHeader title="Kelola Mata Kuliah">
    <Button
     onClick={handleOpenAdd}
     className="flex items-center gap-2 bg-[#9c00ff] text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-[#8000d4]"
    >
     <BookPlus size={18} color="#fff" />
     Tambah Mata Kuliah
    </Button>
   </PageHeader>

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-100">
     <SearchInput
      placeholder="Cari Kode atau Nama MK..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full max-w-xs"
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
            <SquarePen size={18} color="#ffbb00" />
           </button>
           <button
            onClick={() => handleDelete(item.id)}
            className="text-gray-400 hover:text-red-500"
           >
            <Trash size={18} color="#f00048" />
           </button>
          </div>
         </td>
        </tr>
       ))
      )}
     </tbody>
    </table>
   </div>

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
       <FormInput
        label="Kode MK"
        placeholder="TI-601"
        value={form.kode}
        onChange={(e) => setForm({ ...form, kode: e.target.value })}
        required
       />
       <FormInput
        label="Nama Mata Kuliah"
        placeholder="Pemrograman Web Lanjut"
        value={form.nama}
        onChange={(e) => setForm({ ...form, nama: e.target.value })}
        required
       />
       <FormInput
        label="SKS"
        type="number"
        placeholder="3"
        value={form.sks}
        onChange={(e) => setForm({ ...form, sks: e.target.value })}
        required
       />
       {error && (
        <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">
         {error}
        </p>
       )}
       <div className="flex gap-3 pt-2">
        <Button
         variant="outline"
         onClick={() => setShowModal(false)}
         className="flex-1"
        >
         Batal
        </Button>
        <Button type="submit" className="flex-1">
         {editData ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
        </Button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}

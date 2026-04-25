"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

export default function TahunAjaranPage() {
 const [data, setData] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showModal, setShowModal] = useState(false);
 const [editData, setEditData] = useState(null);
 const [form, setForm] = useState({ nama: "" });
 const [error, setError] = useState("");

 const fetchData = async () => {
  try {
   const res = await api.get("/tahun-ajaran");
   setData(res.data);
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchData();
 }, []);

 const handleOpenAdd = () => {
  setEditData(null);
  setForm({ nama: "" });
  setError("");
  setShowModal(true);
 };

 const handleOpenEdit = (item) => {
  setEditData(item);
  setForm({ nama: item.nama });
  setError("");
  setShowModal(true);
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
   if (editData) {
    await api.put(`/tahun-ajaran/${editData.id}`, form);
   } else {
    await api.post("/tahun-ajaran", form);
   }
   setShowModal(false);
   fetchData();
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
  }
 };

 const handleSetAktif = async (id) => {
  if (!confirm("Set tahun ajaran ini sebagai aktif?")) return;
  try {
   await api.patch(`/tahun-ajaran/${id}/aktif`);
   fetchData();
  } catch (err) {
   alert(err.response?.data?.message || "Gagal mengaktifkan");
  }
 };

 return (
  <div>
   <div className="flex items-center justify-between mb-2">
    <div>
     <h1 className="text-2xl font-bold text-gray-800">Kelola Tahun Ajaran</h1>
     <p className="text-sm text-gray-500">
      Hanya boleh ada 1 Tahun Ajaran yang berstatus Aktif.
     </p>
    </div>
    <button
     onClick={handleOpenAdd}
     className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg"
    >
     + Tambah Tahun Ajaran
    </button>
   </div>

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden mt-4">
    <table className="w-full text-sm">
     <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
      <tr>
       <th className="px-5 py-3 text-left">No</th>
       <th className="px-5 py-3 text-left">Nama Tahun Ajaran</th>
       <th className="px-5 py-3 text-left">Status</th>
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
      ) : data.length === 0 ? (
       <tr>
        <td colSpan={4} className="text-center py-8 text-gray-400">
         Belum ada tahun ajaran.
        </td>
       </tr>
      ) : (
       data.map((item, index) => (
        <tr key={item.id} className="hover:bg-gray-50">
         <td className="px-5 py-3 text-gray-500">{index + 1}</td>
         <td className="px-5 py-3 font-medium text-gray-700">{item.nama}</td>
         <td className="px-5 py-3">
          {item.isAktif ? (
           <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
            ● Aktif
           </span>
          ) : (
           <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-3 py-1 rounded-full">
            ⊘ Tidak Aktif
           </span>
          )}
         </td>
         <td className="px-5 py-3">
          <div className="flex items-center gap-2">
           {item.isAktif ? (
            <button
             disabled
             className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-400 cursor-not-allowed"
            >
             Sedang Aktif
            </button>
           ) : (
            <button
             onClick={() => handleSetAktif(item.id)}
             className="text-xs px-3 py-1.5 rounded-lg border border-purple-300 text-purple-600 hover:bg-purple-50"
            >
             Set Aktif
            </button>
           )}
           <button
            onClick={() => handleOpenEdit(item)}
            className="text-gray-400 hover:text-purple-600"
           >
            ✏️
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
        {editData ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
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
         Nama Tahun Ajaran
        </label>
        <input
         type="text"
         placeholder="Contoh: 2025/2026 Genap"
         value={form.nama}
         onChange={(e) => setForm({ nama: e.target.value })}
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
         {editData ? "Simpan Perubahan" : "Tambah"}
        </button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}

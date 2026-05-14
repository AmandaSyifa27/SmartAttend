"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FormInput from "@/components/ui/FormInput";
import PageHeader from "@/components/ui/PageHeader";
import { CalendarPlus, SquarePen } from "lucide-react";

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
   <PageHeader
    title="Kelola Tahun Ajaran"
    subtitle="Hanya boleh ada 1 Tahun Ajaran yang berstatus Aktif."
   >
    <Button
     onClick={handleOpenAdd}
     className="flex items-center gap-2 bg-[#9c00ff] text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-[#8000d4]"
    >
     <CalendarPlus size={18} color="#fff" />
     Tambah Tahun Ajaran
    </Button>
   </PageHeader>

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
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
           <Badge variant="success">● Aktif</Badge>
          ) : (
           <Badge variant="default">⊘ Tidak Aktif</Badge>
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
            <SquarePen size={18} color="#ffbb00" />
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
       <FormInput
        label="Nama Tahun Ajaran"
        placeholder="2025/2026 Genap"
        value={form.nama}
        onChange={(e) => setForm({ nama: e.target.value })}
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
         {editData ? "Simpan Perubahan" : "Tambah"}
        </Button>
       </div>
      </form>
     </div>
    </div>
   )}
  </div>
 );
}

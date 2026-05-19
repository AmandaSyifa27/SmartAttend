"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import FormInput from "@/components/ui/FormInput";
import PageHeader from "@/components/ui/PageHeader";
import { SquarePen, Trash, UserPlus } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Confirm from "@/components/ui/Confirm";

export default function DataDosenPage() {
 const [dosen, setDosen] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [showModal, setShowModal] = useState(false);
 const [editData, setEditData] = useState(null);
 const [form, setForm] = useState({
  nidn: "",
  nama: "",
  email: "",
  password: "",
 });
 const [error, setError] = useState("");
 const [alertInfo, setAlertInfo] = useState({
  show: false,
  message: "",
  type: "info",
 });
 const [confirmInfo, setConfirmInfo] = useState({
  show: false,
  message: "",
  onConfirm: null,
 });

 const fetchDosen = async () => {
  try {
   const res = await api.get("/dosen");
   setDosen(res.data);
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchDosen();
 }, []);

 const handleOpenAdd = () => {
  setEditData(null);
  setForm({ nidn: "", nama: "", email: "", password: "" });
  setError("");
  setShowModal(true);
 };

 const handleOpenEdit = (item) => {
  setEditData(item);
  setForm({
   nidn: item.nidn,
   nama: item.nama,
   email: item.email || "",
   password: "",
  });
  setError("");
  setShowModal(true);
 };

 const showAlert = (message, type = "info") => {
  setAlertInfo({ show: true, message, type });
 };

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
   if (editData) {
    await api.put(`/dosen/${editData.id}`, form);
    showAlert("Dosen berhasil diupdate", "info");
   } else {
    await api.post("/dosen", form);
    showAlert("Dosen berhasil ditambahkan", "success");
   }
   setShowModal(false);
   fetchDosen();
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
   showAlert(err.response?.data?.message || "Terjadi kesalahan", "error");
  }
 };

 const handleDelete = async (id) => {
  try {
   await api.delete(`/dosen/${id}`);
   showAlert("Dosen berhasil dihapus", "warning");
   fetchDosen();
  } catch (err) {
   showAlert(err.response?.data?.message || "Gagal menghapus", "error");
  }
 };

 const filtered = dosen.filter(
  (d) =>
   d.nama.toLowerCase().includes(search.toLowerCase()) ||
   d.nidn.includes(search),
 );

 return (
  <div>
   <PageHeader title="Kelola Data Dosen">
    <Button
     onClick={handleOpenAdd}
     className="flex items-center gap-2 bg-[#9c00ff] text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-[#8000d4]"
    >
     <UserPlus size={18} color="#fff" className="" />
     Tambah Dosen
    </Button>
   </PageHeader>

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-100">
     <SearchInput
      placeholder="Cari NIDN atau Nama..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full max-w-xs"
     />
    </div>

    <table className="w-full text-sm">
     <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
      <tr>
       <th className="px-5 py-3 text-left">NIDN</th>
       <th className="px-5 py-3 text-left">Nama</th>
       <th className="px-5 py-3 text-left">Email</th>
       <th className="px-5 py-3 text-left">Aksi</th>
      </tr>
     </thead>
     <tbody className="divide-y divide-gray-100">
      {loading ? (
       <tr>
        <td colSpan={4} className="text-center py-8 text-gray-400">
         {/* Memuat data... */}
         <Spinner className="py-8" />
        </td>
       </tr>
      ) : filtered.length === 0 ? (
       <tr>
        <td colSpan={4} className="text-center py-8 text-gray-400">
         Tidak ada data dosen.
        </td>
       </tr>
      ) : (
       filtered.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
         <td className="px-5 py-3 font-medium text-gray-700">{item.nidn}</td>
         <td className="px-5 py-3 text-gray-700">{item.nama}</td>
         <td className="px-5 py-3 text-gray-500">{item.email || "-"}</td>
         <td className="px-5 py-3">
          <div className="flex items-center gap-2">
           <button
            onClick={() => handleOpenEdit(item)}
            className="text-gray-400 hover:text-purple-600"
           >
            <SquarePen size={18} color="#ffbb00" />
           </button>
           <button
            onClick={() =>
             setConfirmInfo({
              show: true,
              message: "Yakin ingin menghapus dosen ini?",
              onConfirm: () => {
               setConfirmInfo((prev) => ({ ...prev, show: false }));
               handleDelete(item.id);
              },
             })
            }
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
        {editData ? "Edit Dosen" : "Tambah Dosen"}
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
        label="NIDN"
        placeholder="0412038801"
        value={form.nidn}
        onChange={(e) => setForm({ ...form, nidn: e.target.value })}
        required
       />
       <FormInput
        label="Nama"
        placeholder="Jon Snow, M.Kom."
        value={form.nama}
        onChange={(e) => setForm({ ...form, nama: e.target.value })}
        required
       />
       <FormInput
        label="Email"
        type="email"
        placeholder="hatta@kampus.ac.id"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
       />
       <FormInput
        label={
         editData ? "Password Baru (kosongkan jika tidak diubah)" : "Password"
        }
        type="password"
        placeholder="••••••••"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required={!editData}
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
         {editData ? "Simpan Perubahan" : "Tambah Dosen"}
        </Button>
       </div>
      </form>
     </div>
    </div>
   )}
   <Alert
    show={alertInfo.show}
    message={alertInfo.message}
    type={alertInfo.type}
    onClose={() => setAlertInfo((prev) => ({ ...prev, show: false }))}
   />
   <Confirm
    show={confirmInfo.show}
    message={confirmInfo.message}
    onConfirm={confirmInfo.onConfirm}
    onCancel={() => setConfirmInfo((prev) => ({ ...prev, show: false }))}
   />
  </div>
 );
}

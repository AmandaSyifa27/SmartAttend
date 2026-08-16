"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import SearchInput from "@/components/ui/SearchInput";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import FormInput from "@/components/ui/FormInput";
import PageHeader from "@/components/ui/PageHeader";
import ModalEnrollWajah from "@/components/shared/ModalEnrollWajah";
import {
 Camera,
 Check,
 SwitchCamera,
 TriangleAlert,
 UserRoundPlus,
 Copy,
 RefreshCw,
 Download,
 Pencil,
 Trash2,
} from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";
import Confirm from "@/components/ui/Confirm";

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
  prodi: "Teknik Informatika",
  kelas: "",
  angkatan: "",
  email: "",
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
 const [exportLoading, setExportLoading] = useState(false);

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
  setForm({
   nim: "",
   nama: "",
   prodi: "Teknik Informatika",
   kelas: "",
   angkatan: "",
   email: "",
  });
  setError("");
  setShowModal(true);
 };

 const handleOpenEdit = (item) => {
  setEditData(item);
  setForm({
   nim: item.nim,
   nama: item.nama,
   prodi: item.prodi || "Teknik Informatika",
   kelas: item.kelas,
   angkatan: item.angkatan,
   email: item.email || "",
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
    await api.put(`/mahasiswa/${editData.id}`, form);
    showAlert("Mahasiswa berhasil diupdate", "info");
   } else {
    await api.post("/mahasiswa", form);
    showAlert("Mahasiswa berhasil ditambahkan", "success");
   }
   setShowModal(false);
   fetchMahasiswa();
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
  }
 };

 const handleDelete = async (id) => {
  try {
   await api.delete(`/mahasiswa/${id}`);
   showAlert("Mahasiswa berhasil dihapus", "warning");
   fetchMahasiswa();
  } catch (err) {
   showAlert(err.response?.data?.message || "Gagal menghapus", "error");
  }
 };

 const handleSalinLink = (token) => {
  const link = `${window.location.origin}/enroll/${token}`;
  navigator.clipboard.writeText(link);
  showAlert("Link pendaftaran berhasil disalin!", "success");
 };

 const handleResetToken = async (id, nama) => {
  setConfirmInfo({
   show: true,
   message: `Reset token enrollment ${nama}? Link lama akan tidak berlaku.`,
   onConfirm: async () => {
    setConfirmInfo((prev) => ({ ...prev, show: false }));
    try {
     await api.patch(`/mahasiswa/${id}/reset-token`);
     showAlert("Token berhasil direset", "success");
     fetchMahasiswa();
    } catch (err) {
     showAlert(err.response?.data?.message || "Gagal reset token", "error");
    }
   },
  });
 };

 const handleExportExcel = async () => {
  setExportLoading(true);
  try {
   const origin = window.location.origin;
   const rows = mahasiswa.map((m) => ({
    NIM: m.nim,
    Nama: m.nama,
    "Program Studi": m.prodi,
    "Link Enrollment": m.enrollToken
     ? `${origin}/enroll/${m.enrollToken}`
     : "Belum ada token",
    "Status Enrollment": m.enrollDone ? "Sudah Enroll" : "Belum Enroll",
    "Expired Date": m.enrollTokenExp
     ? new Date(m.enrollTokenExp).toLocaleDateString("id-ID")
     : "-",
   }));

   // Buat CSV manual — tidak butuh library tambahan
   const headers = Object.keys(rows[0]).join(",");
   const csvRows = rows.map((r) =>
    Object.values(r)
     .map((v) => `"${v}"`)
     .join(","),
   );
   const csv = [headers, ...csvRows].join("\n");

   const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
   const url = URL.createObjectURL(blob);
   const a = document.createElement("a");
   a.href = url;
   a.download = `enrollment-mahasiswa-${new Date().toISOString().slice(0, 10)}.csv`;
   a.click();
   URL.revokeObjectURL(url);

   showAlert("File berhasil diunduh", "success");
  } catch {
   showAlert("Gagal mengekspor data", "error");
  } finally {
   setExportLoading(false);
  }
 };

 const filtered = mahasiswa.filter(
  (m) =>
   m.nama.toLowerCase().includes(search.toLowerCase()) ||
   m.nim.includes(search),
 );

 return (
  <div>
   <PageHeader title="Kelola Mahasiswa & Wajah">
    <div className="flex items-center gap-3 ml-auto">
     <button
      onClick={handleExportExcel}
      disabled={exportLoading}
      className="border border-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
     >
      <Download size={16} />
      {exportLoading ? "Mengunduh..." : "Export CSV"}
     </button>
     <Button
      onClick={handleOpenAdd}
      className="flex items-center gap-2 bg-[#9c00ff] text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-[#8000d4]"
     >
      <UserRoundPlus color="#fff" size={18} />
      Tambah Mahasiswa
     </Button>
    </div>
   </PageHeader>

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    <div className="p-4 border-b border-gray-100">
     <SearchInput
      placeholder="Cari NIM atau Nama..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full max-w-xs"
     />
    </div>

    <table className="w-full text-sm">
     <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
      <tr>
       <th className="px-5 py-3 text-left">NIM</th>
       <th className="px-5 py-3 text-left">Nama Mahasiswa</th>
       <th className="px-5 py-3 text-left">Program Studi</th>
       <th className="px-5 py-3 text-left">Status Data Wajah</th>
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
         <td
          className={`px-5 py-3 ${!item.isFaceEnrolled ? "font-semibold text-red-500" : "text-gray-700"}`}
         >
          {item.prodi}
         </td>
         <td className="px-5 py-3">
          {item.isFaceEnrolled ? (
           <Badge
            variant="success"
            className="inline-flex items-center gap-1.5 whitespace-nowrap"
           >
            <Check size={16} color="#008E5D" />
            Terekam
           </Badge>
          ) : (
           <Badge
            variant="warning"
            className="inline-flex items-center gap-1.5 whitespace-nowrap"
           >
            <TriangleAlert size={16} color="#f00048" />
            Belum Direkam
           </Badge>
          )}
         </td>

         <td className="px-5 py-3">
          <div className="flex items-center gap-2">
           {!item.isFaceEnrolled ? (
            <Button
             onClick={() => setEnrollMhs(item)}
             className="flex items-center gap-2 bg-[#9c00ff] text-white px-4 rounded-lg font-semibold transition-colors hover:bg-[#8000d4] text-xs py-1.5"
            >
             <Camera size={18} color="#fff" />
             Rekam Wajah Sekarang
            </Button>
           ) : (
            <button
             onClick={() => setEnrollMhs(item)}
             className="text-gray-400 hover:text-purple-600"
             title="Rekam Ulang"
            >
             <SwitchCamera size={18} color="#5C00F1" />
            </button>
           )}

           {item.enrollToken && (
            <button
             onClick={() => handleSalinLink(item.enrollToken)}
             className="text-gray-400 hover:text-blue-500"
             title="Salin Link Enrollment"
            >
             <Copy size={18} />
            </button>
           )}

           <button
            onClick={() => handleResetToken(item.id, item.nama)}
            className="text-gray-400 hover:text-orange-500"
            title="Reset Token"
           >
            <RefreshCw size={18} />
           </button>

           <button
            onClick={() => handleOpenEdit(item)}
            className="text-gray-400 hover:text-purple-600"
           >
            <Pencil size={18} color="#ffbb00" />
           </button>
           <button
            onClick={() =>
             setConfirmInfo({
              show: true,
              message: "Yakin ingin menghapus mahasiswa ini?",
              onConfirm: () => {
               setConfirmInfo((prev) => ({ ...prev, show: false }));
               handleDelete(item.id);
              },
             })
            }
            className="text-gray-400 hover:text-red-500"
           >
            <Trash2 size={18} color="#f00048" />
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
        <FormInput
         label="NIM"
         placeholder="2023001"
         value={form.nim}
         onChange={(e) => setForm({ ...form, nim: e.target.value })}
         required
        />
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          Angkatan
         </label>
         <select
          value={form.angkatan}
          onChange={(e) => setForm({ ...form, angkatan: e.target.value })}
          className="w-full text-gray-700 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
         >
          <option value="">Pilih Angkatan</option>
          {Array.from(
           { length: 10 },
           (_, i) => new Date().getFullYear() - i,
          ).map((year) => (
           <option key={year} value={year}>
            {year}
           </option>
          ))}
         </select>
        </div>
       </div>
       <FormInput
        label="Nama"
        placeholder="Nama lengkap"
        value={form.nama}
        onChange={(e) => setForm({ ...form, nama: e.target.value })}
        required
       />
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Program Studi
        </label>
        <select
         value={form.prodi}
         onChange={(e) => setForm({ ...form, prodi: e.target.value })}
         className="text-gray-700 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        >
         <option value="Teknik Informatika">Teknik Informatika</option>
        </select>
       </div>
       <FormInput
        label="Kelas"
        placeholder="TI-6A"
        value={form.kelas}
        onChange={(e) => setForm({ ...form, kelas: e.target.value })}
        required
       />
       <FormInput
        label="Email"
        type="email"
        placeholder="mahasiswa@kampus.ac.id"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
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
         {editData ? "Simpan Perubahan" : "Tambah Mahasiswa"}
        </Button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* Modal Enroll Wajah */}
   {enrollMhs && (
    <ModalEnrollWajah
     mahasiswa={enrollMhs}
     onClose={() => setEnrollMhs(null)}
     onSuccess={fetchMahasiswa}
    />
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

"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import SearchInput from "@/components/ui/SearchInput";
import {
 CalendarPlus2,
 Clock,
 SquarePen,
 Trash,
 User,
 Users,
} from "lucide-react";

const HARI = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function JadwalPage() {
 const [jadwal, setJadwal] = useState([]);
 const [dosen, setDosen] = useState([]);
 const [mataKuliah, setMataKuliah] = useState([]);
 const [mahasiswaList, setMahasiswaList] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [filterHari, setFilterHari] = useState("Semua");

 // Modal Jadwal
 const [showModalJadwal, setShowModalJadwal] = useState(false);
 const [editData, setEditData] = useState(null);
 const [form, setForm] = useState({
  hari: "Senin",
  jamMulai: "",
  jamSelesai: "",
  kelas: "",
  ruangan: "",
  dosenId: "",
  mataKuliahId: "",
 });
 const [error, setError] = useState("");

 // Modal Peserta (KRS)
 const [showModalPeserta, setShowModalPeserta] = useState(false);
 const [selectedJadwal, setSelectedJadwal] = useState(null);
 const [selectedMhsIds, setSelectedMhsIds] = useState([]);
 const [searchMhs, setSearchMhs] = useState("");

 const fetchAll = async () => {
  try {
   const [j, d, mk, mhs] = await Promise.all([
    api.get("/jadwal"),
    api.get("/dosen"),
    api.get("/mata-kuliah"),
    api.get("/mahasiswa"),
   ]);
   setJadwal(j.data);
   setDosen(d.data);
   setMataKuliah(mk.data);
   setMahasiswaList(mhs.data);
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 useEffect(() => {
  fetchAll();
 }, []);

 const handleOpenAdd = () => {
  setEditData(null);
  setForm({
   hari: "Senin",
   jamMulai: "",
   jamSelesai: "",
   kelas: "",
   ruangan: "",
   dosenId: "",
   mataKuliahId: "",
  });
  setError("");
  setShowModalJadwal(true);
 };

 const handleOpenEdit = (item) => {
  setEditData(item);
  setForm({
   hari: item.hari,
   jamMulai: item.jamMulai,
   jamSelesai: item.jamSelesai,
   kelas: item.kelas,
   ruangan: item.ruangan || "",
   dosenId: item.dosenId,
   mataKuliahId: item.mataKuliahId,
  });
  setError("");
  setShowModalJadwal(true);
 };

 const handleSubmitJadwal = async (e) => {
  e.preventDefault();
  setError("");
  try {
   if (editData) {
    await api.put(`/jadwal/${editData.id}`, form);
   } else {
    await api.post("/jadwal", form);
   }
   setShowModalJadwal(false);
   fetchAll();
  } catch (err) {
   setError(err.response?.data?.message || "Terjadi kesalahan");
  }
 };

 const handleDelete = async (id) => {
  if (!confirm("Yakin ingin menghapus jadwal ini?")) return;
  try {
   await api.delete(`/jadwal/${id}`);
   fetchAll();
  } catch (err) {
   alert(err.response?.data?.message || "Gagal menghapus");
  }
 };

 const handleOpenPeserta = async (item) => {
  setSelectedJadwal(item);
  setSearchMhs("");
  // Ambil peserta yang sudah terdaftar
  try {
   const res = await api.get(`/jadwal/${item.id}`);
   setSelectedMhsIds(res.data.mahasiswaIds || []);
  } catch {
   setSelectedMhsIds([]);
  }
  setShowModalPeserta(true);
 };

 const handleToggleMhs = (id) => {
  setSelectedMhsIds((prev) =>
   prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
  );
 };

 const handleSimpanPeserta = async () => {
  try {
   await api.patch(`/jadwal/${selectedJadwal.id}/peserta`, {
    mahasiswaIds: selectedMhsIds,
   });
   setShowModalPeserta(false);
   fetchAll();
  } catch (err) {
   alert(err.response?.data?.message || "Gagal menyimpan peserta");
  }
 };

 const filtered = jadwal.filter((j) => {
  const matchSearch =
   j.mataKuliah?.nama.toLowerCase().includes(search.toLowerCase()) ||
   j.dosen?.nama.toLowerCase().includes(search.toLowerCase()) ||
   j.kelas.toLowerCase().includes(search.toLowerCase());
  const matchHari = filterHari === "Semua" || j.hari === filterHari;
  return matchSearch && matchHari;
 });

 const filteredMhs = mahasiswaList.filter(
  (m) =>
   m.nama.toLowerCase().includes(searchMhs.toLowerCase()) ||
   m.nim.includes(searchMhs),
 );

 return (
  <div>
   <PageHeader
    title="Jadwal & Peserta (KRS)"
    subtitle="Menampilkan jadwal untuk T.A Aktif"
   >
    <Button
     onClick={handleOpenAdd}
     className="flex items-center gap-2 bg-[#9c00ff] text-white px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-[#8000d4]"
    >
     <CalendarPlus2 size={18} color="#fff" />
     Buat Jadwal Master
    </Button>
   </PageHeader>
   {/* <div className="flex items-center justify-between mb-4">
    <div>
     <h1 className="text-2xl font-bold text-gray-800">
      Jadwal & Peserta (KRS)
     </h1>
     <p className="text-sm text-gray-500">Menampilkan jadwal untuk T.A Aktif</p>
    </div>
    <button
     onClick={handleOpenAdd}
     className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-4 py-2 rounded-lg flex items-center gap-2"
    >
     📅 Buat Jadwal Master
    </button>
   </div> */}

   <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
    {/* Filter */}
    <div className="p-4 border-b border-gray-100 flex gap-3">
     <SearchInput
      placeholder="Cari MK, Dosen, atau Kelas..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="flex-1 max-w-xs"
     />
     {/* <input
      type="text"
      placeholder="Cari MK, Dosen, atau Kelas..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 flex-1 max-w-xs"
     /> */}
     <select
      value={filterHari}
      onChange={(e) => setFilterHari(e.target.value)}
      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
     >
      <option value="Semua">Semua Hari</option>
      {HARI.map((h) => (
       <option key={h} value={h}>
        {h}
       </option>
      ))}
     </select>
    </div>

    {/* Tabel */}
    <table className="w-full text-sm">
     <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
      <tr>
       <th className="px-5 py-3 text-left">Waktu & Kelas</th>
       <th className="px-5 py-3 text-left">Mata Kuliah & Dosen</th>
       <th className="px-5 py-3 text-left">Jumlah Peserta (KRS)</th>
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
         Tidak ada jadwal.
        </td>
       </tr>
      ) : (
       filtered.map((item) => (
        <tr key={item.id} className="hover:bg-gray-50">
         <td className="px-5 py-3">
          <p className="font-medium text-gray-700">{item.hari},</p>
          <p className="text-gray-500 text-xs flex items-center gap-1.5 mt-0.5">
           <Clock size={16} color="#5C00F1" />
           <span>
            {item.jamMulai} - {item.jamSelesai}
           </span>
          </p>

          <span className="bg-purple-100 text-purple-700 text-xs px-2 py-0.5 rounded-full mt-1.5 inline-block font-medium">
           Kelas {item.kelas}
          </span>
         </td>

         <td className="px-5 py-3">
          <p className="font-semibold text-gray-700">{item.mataKuliah?.nama}</p>

          <p className="text-gray-400 text-xs flex items-center gap-1.5 mt-0.5">
           <User size={16} color="#5C00F1" />
           <span>{item.dosen?.nama}</span>
          </p>
         </td>

         <td className="px-5 py-3">
          <span
           className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
            item._count?.mahasiswa > 0
             ? "bg-green-100 text-green-700"
             : "bg-red-100 text-red-500"
           }`}
          >
           {item._count?.mahasiswa || 0}
          </span>
         </td>
         <td className="px-5 py-3">
          <div className="flex items-center gap-2">
           <button
            onClick={() => handleOpenPeserta(item)}
            className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1"
           >
            <Users size={18} color="#FFFFFF" />
            Kelola Peserta
           </button>
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

   {/* Modal Jadwal */}
   {showModalJadwal && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
     <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
      <div className="flex items-center justify-between mb-4">
       <h2 className="font-bold text-gray-800 text-lg">
        {editData ? "Edit Jadwal" : "Buat Jadwal Master"}
       </h2>
       <button
        onClick={() => setShowModalJadwal(false)}
        className="text-gray-400 hover:text-gray-600 text-xl"
       >
        ✕
       </button>
      </div>

      <form onSubmit={handleSubmitJadwal} className="space-y-3 text-gray-700">
       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Mata Kuliah
        </label>
        <select
         value={form.mataKuliahId}
         onChange={(e) => setForm({ ...form, mataKuliahId: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        >
         <option value="">Pilih Mata Kuliah</option>
         {mataKuliah.map((mk) => (
          <option key={mk.id} value={mk.id}>
           {mk.nama} ({mk.kode})
          </option>
         ))}
        </select>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Dosen Pengampu
        </label>
        <select
         value={form.dosenId}
         onChange={(e) => setForm({ ...form, dosenId: e.target.value })}
         className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         required
        >
         <option value="">Pilih Dosen</option>
         {dosen.map((d) => (
          <option key={d.id} value={d.id}>
           {d.nama}
          </option>
         ))}
        </select>
       </div>

       <div className="grid grid-cols-2 gap-3">
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
          Hari
         </label>
         <select
          value={form.hari}
          onChange={(e) => setForm({ ...form, hari: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
         >
          {HARI.map((h) => (
           <option key={h} value={h}>
            {h}
           </option>
          ))}
         </select>
        </div>
       </div>

       <div className="grid grid-cols-2 gap-3">
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          Jam Mulai
         </label>
         <input
          type="time"
          value={form.jamMulai}
          onChange={(e) => setForm({ ...form, jamMulai: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
         />
        </div>
        <div>
         <label className="block text-sm font-medium text-gray-700 mb-1">
          Jam Selesai
         </label>
         <input
          type="time"
          value={form.jamSelesai}
          onChange={(e) => setForm({ ...form, jamSelesai: e.target.value })}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
         />
        </div>
       </div>

       <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Ruangan
        </label>
        <input
         type="text"
         placeholder="Contoh: Ruang Lab Komputer 1"
         value={form.ruangan}
         onChange={(e) => setForm({ ...form, ruangan: e.target.value })}
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
         onClick={() => setShowModalJadwal(false)}
         className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
        >
         Batal
        </button>
        <button
         type="submit"
         className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-lg"
        >
         {editData ? "Simpan Perubahan" : "Buat Jadwal"}
        </button>
       </div>
      </form>
     </div>
    </div>
   )}

   {/* Modal Peserta (KRS) */}
   {showModalPeserta && selectedJadwal && (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
     <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
      <div className="flex items-center justify-between mb-4">
       <div>
        <h2 className="font-bold text-gray-800 text-lg">
         Kelola Peserta Kelas
        </h2>
        <p className="text-sm text-gray-500">
         Pilih mahasiswa yang mengambil mata kuliah ini (Input KRS)
        </p>
       </div>
       <button
        onClick={() => setShowModalPeserta(false)}
        className="text-gray-400 hover:text-gray-600 text-xl"
       >
        ✕
       </button>
      </div>

      {/* Info Jadwal */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
       <p className="font-semibold text-gray-700">
        {selectedJadwal.mataKuliah?.nama}
       </p>
       <p className="text-gray-500">
        Kelas {selectedJadwal.kelas} • {selectedJadwal.dosen?.nama}
       </p>
       <p className="text-purple-600 font-semibold mt-2">
        {selectedMhsIds.length} Mahasiswa Terpilih
       </p>
      </div>

      {/* Search */}
      <input
       type="text"
       placeholder="Cari NIM atau Nama..."
       value={searchMhs}
       onChange={(e) => setSearchMhs(e.target.value)}
       className="w-full text-gray-700 border border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-3"
      />

      {/* List Mahasiswa */}
      <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
       {filteredMhs.map((mhs) => (
        <div
         key={mhs.id}
         onClick={() => handleToggleMhs(mhs.id)}
         className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
          selectedMhsIds.includes(mhs.id)
           ? "border-purple-300 bg-purple-50"
           : "border-gray-100 hover:bg-gray-50"
         }`}
        >
         <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
          {mhs.nama.slice(0, 2).toUpperCase()}
         </div>
         <div className="flex-1">
          <p className="text-sm font-medium text-gray-700">{mhs.nama}</p>
          <p className="text-xs text-gray-400">{mhs.nim}</p>
          {!mhs.isFaceEnrolled && (
           <p className="text-xs text-orange-500">⚠ Wajah Belum Direkam</p>
          )}
         </div>
         <div
          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
           selectedMhsIds.includes(mhs.id)
            ? "bg-purple-600 border-purple-600"
            : "border-gray-300"
          }`}
         >
          {selectedMhsIds.includes(mhs.id) && (
           <span className="text-white text-xs">✓</span>
          )}
         </div>
        </div>
       ))}
      </div>

      <div className="flex gap-3">
       <button
        onClick={() => setShowModalPeserta(false)}
        className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
       >
        Batal
       </button>
       <button
        onClick={handleSimpanPeserta}
        className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-lg"
       >
        Simpan Daftar Peserta
       </button>
      </div>
     </div>
    </div>
   )}
  </div>
 );
}

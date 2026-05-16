"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import PageHeader from "@/components/ui/PageHeader";
import { Trash } from "lucide-react";
import Spinner from "@/components/ui/Spinner";

export default function RiwayatAdminPage() {
 const [jadwalList, setJadwalList] = useState([]);
 const [selectedJadwal, setSelectedJadwal] = useState("");
 const [rekap, setRekap] = useState([]);
 const [loadingJadwal, setLoadingJadwal] = useState(true);
 const [loadingRekap, setLoadingRekap] = useState(false);
 const [editingId, setEditingId] = useState(null);

 useEffect(() => {
  api
   .get("/jadwal")
   .then((res) => setJadwalList(res.data))
   .catch((err) => console.error(err))
   .finally(() => setLoadingJadwal(false));
 }, []);

 useEffect(() => {
  if (!selectedJadwal) return;
  const fetchRekap = async () => {
   setLoadingRekap(true);
   try {
    const res = await api.get(`/presensi/admin/rekap/${selectedJadwal}`);
    setRekap(res.data);
   } catch (err) {
    console.error(err);
   } finally {
    setLoadingRekap(false);
   }
  };
  fetchRekap();
 }, [selectedJadwal]);

 // Ambil semua mahasiswa unik
 const mahasiswaMap = {};
 rekap.forEach((sesi) => {
  sesi.catatanHadir.forEach((c) => {
   if (!mahasiswaMap[c.mahasiswaId]) {
    mahasiswaMap[c.mahasiswaId] = c.mahasiswa;
   }
  });
 });
 const mahasiswaList = Object.values(mahasiswaMap);

 const getCatatan = (mahasiswaId, sesiId) => {
  const sesi = rekap.find((s) => s.id === sesiId);
  if (!sesi) return null;
  return sesi.catatanHadir.find((c) => c.mahasiswaId === mahasiswaId);
 };

 const getPersentase = (mahasiswaId) => {
  if (rekap.length === 0) return 0;
  const hadir = rekap.filter((sesi) =>
   sesi.catatanHadir.find(
    (c) => c.mahasiswaId === mahasiswaId && c.status === "HADIR",
   ),
  ).length;
  return Math.round((hadir / rekap.length) * 100);
 };

 const handleUpdateKehadiran = async (catatanId, statusBaru) => {
  try {
   await api.patch(`/presensi/catatan/${catatanId}`, { status: statusBaru });
   // Refresh rekap
   const res = await api.get(`/presensi/admin/rekap/${selectedJadwal}`);
   setRekap(res.data);
   setEditingId(null);
  } catch (err) {
   alert(err.response?.data?.message || "Gagal mengubah kehadiran");
  }
 };

 //  hapus sesi
 const handleHapusSesi = async (sesiId) => {
  if (
   !confirm(
    "Yakin ingin menghapus pertemuan ini? Semua data kehadiran di pertemuan ini akan hilang.",
   )
  )
   return;
  try {
   await api.delete(`/presensi/admin/sesi/${sesiId}`);
   const res = await api.get(`/presensi/admin/rekap/${selectedJadwal}`);
   setRekap(res.data);
  } catch (err) {
   alert(err.response?.data?.message || "Gagal menghapus");
  }
 };

 const selectedJadwalData = jadwalList.find((j) => j.id === selectedJadwal);

 return (
  <div className="min-w-0 w-full">
   <PageHeader
    title="Rekap Kehadiran"
    subtitle="Pantau dan kelola kehadiran mahasiswa seluruh kelas"
   />

   {/* Filter */}
   <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
    <div className="flex gap-4 items-end">
     <div className="flex-1 max-w-sm">
      <label className="block text-sm font-medium text-gray-700 mb-1">
       Pilih Mata Kuliah & Kelas
      </label>
      <select
       value={selectedJadwal}
       onChange={(e) => setSelectedJadwal(e.target.value)}
       className="text-gray-700 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
       <option value="">Pilih jadwal...</option>
       {jadwalList.map((j) => (
        <option key={j.id} value={j.id}>
         {j.mataKuliah?.nama} — {j.kelas} ({j.dosen?.nama})
        </option>
       ))}
      </select>
     </div>
    </div>

    {selectedJadwal && rekap.length > 0 && (
     <div className="grid grid-cols-3 gap-4 mt-4">
      <div className="bg-gray-50 rounded-xl p-3 text-center">
       <p className="text-xs text-gray-500">Total Mahasiswa</p>
       <p className="text-xl font-bold text-gray-800">{mahasiswaList.length}</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 text-center">
       <p className="text-xs text-gray-500">Total Pertemuan</p>
       <p className="text-xl font-bold text-gray-800">{rekap.length} Sesi</p>
      </div>
      <div className="bg-green-50 rounded-xl p-3 text-center">
       <p className="text-xs text-green-600">Rata-rata Kehadiran</p>
       <p className="text-xl font-bold text-green-700">
        {mahasiswaList.length > 0
         ? Math.round(
            mahasiswaList.reduce((acc, m) => acc + getPersentase(m.id), 0) /
             mahasiswaList.length,
           )
         : 0}
        %
       </p>
      </div>
     </div>
    )}
   </div>

   {/* Tabel */}
   {selectedJadwal && (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
     <div className="p-4 border-b border-gray-100 flex items-center justify-between">
      <h2 className="font-semibold text-gray-800 text-sm">
       Matriks Kehadiran — {selectedJadwalData?.mataKuliah?.nama} (
       {selectedJadwalData?.kelas})
      </h2>
      <p className="text-xs text-gray-400 shrink-0 ml-4">
       Klik H/A untuk mengubah
      </p>
     </div>

     {loadingRekap ? (
      // <div className="py-12 text-center text-gray-400">Memuat rekap...</div>
      <div>
       <Spinner className="py-12 mx-auto" />
      </div>
     ) : rekap.length === 0 ? (
      <div className="py-12 text-center text-gray-400">
       Belum ada sesi yang selesai.
      </div>
     ) : (
      // Ini yang penting — scroll hanya di dalam tabel
      <div style={{ overflowX: "auto", width: "100%" }}>
       <table
        style={{ borderCollapse: "collapse", whiteSpace: "nowrap" }}
        className="text-sm w-full"
       >
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
         <tr>
          <th className="px-4 py-3 text-left sticky left-0 bg-gray-50 z-10">
           No
          </th>
          <th className="px-4 py-3 text-left sticky left-10 bg-gray-50 z-10 min-w-35">
           Nama
          </th>
          {/* <th className="px-4 py-3 text-left left-10 bg-gray-50 z-10 min-w-[140px]">Nama</th> */}
          <th className="px-4 py-3 text-left left-47.5 bg-gray-50 z-10 min-w-27.5">
           NIM
          </th>
          {/* <th className="px-4 py-3 text-left sticky left-[190px] bg-gray-50 z-10 min-w-[110px]">NIM</th> */}
          {rekap.map((sesi) => (
           <th key={sesi.id} className="px-3 py-3 text-center min-w-13">
            {/* <th key={sesi.id} className="px-3 py-3 text-center min-w-[52px]"> */}
            <div className="flex flex-col items-center gap-0.5">
             <span>P{sesi.pertemuanKe}</span>
             <button
              onClick={() => handleHapusSesi(sesi.id)}
              className="text-red-400 hover:text-red-600 text-xs"
              title="Hapus pertemuan"
             >
              <Trash size={16} color="#f00048" />
             </button>
            </div>
           </th>
          ))}
          <th className="px-4 py-3 text-center sticky right-0 bg-gray-50 z-10 text-purple-600 min-w-20">
           {/* <th className="px-4 py-3 text-center sticky right-0 bg-gray-50 z-10 text-purple-600 min-w-[80px]"> */}
           % Hadir
          </th>
         </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
         {mahasiswaList.map((mhs, index) => {
          const persen = getPersentase(mhs.id);
          return (
           <tr key={mhs.id} className="hover:bg-gray-50">
            <td className="px-4 py-3 text-gray-500 sticky left-0 bg-white z-10">
             {index + 1}
            </td>
            <td className="px-4 py-3 font-medium text-gray-700 sticky left-10 bg-white z-10 min-w-35">
             {mhs.nama}
            </td>
            {/* <td className="px-4 py-3 font-medium text-gray-700 sticky left-10 bg-white z-10 min-w-[140px]">{mhs.nama}</td> */}
            <td className="px-4 py-3 text-gray-500 left-47.5 bg-white z-10 min-w-27.5">
             {mhs.nim}
            </td>
            {/* <td className="px-4 py-3 text-gray-500 sticky left-[190px] bg-white z-10 min-w-[110px]">{mhs.nim}</td> */}
            {rekap.map((sesi) => {
             const catatan = getCatatan(mhs.id, sesi.id);
             const status = catatan?.status || "ALPA";
             const isEditing = editingId === catatan?.id;
             return (
              <td key={sesi.id} className="px-2 py-3 text-center">
               {isEditing ? (
                <div className="flex gap-1 justify-center">
                 <button
                  onClick={() => handleUpdateKehadiran(catatan.id, "HADIR")}
                  className="w-7 h-7 rounded bg-green-500 text-white text-xs font-bold hover:bg-green-600"
                 >
                  H
                 </button>
                 <button
                  onClick={() => handleUpdateKehadiran(catatan.id, "ALPA")}
                  className="w-7 h-7 rounded bg-red-400 text-white text-xs font-bold hover:bg-red-500"
                 >
                  A
                 </button>
                </div>
               ) : (
                <button
                 onClick={() => catatan && setEditingId(catatan.id)}
                 title={catatan ? "Klik untuk ubah" : "Tidak ada data"}
                 className={`w-7 h-7 rounded inline-flex items-center justify-center text-white text-xs font-bold ${
                  status === "HADIR"
                   ? "bg-green-500 hover:opacity-80"
                   : "bg-red-400 hover:opacity-80"
                 } ${!catatan ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}`}
                >
                 {status === "HADIR" ? "H" : "A"}
                </button>
               )}
              </td>
             );
            })}
            <td className="px-4 py-3 text-center sticky right-0 bg-white z-10">
             <span
              className={`font-bold text-sm ${persen >= 75 ? "text-green-600" : "text-red-500"}`}
             >
              {persen}%
             </span>
            </td>
           </tr>
          );
         })}
        </tbody>
       </table>
      </div>
     )}
    </div>
   )}
  </div>
 );
}

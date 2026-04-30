"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

export default function RiwayatPage() {
 const [jadwalList, setJadwalList] = useState([]);
 const [selectedJadwal, setSelectedJadwal] = useState("");
 const [rekap, setRekap] = useState([]);
 const [loadingJadwal, setLoadingJadwal] = useState(true);
 const [loadingRekap, setLoadingRekap] = useState(false);

 useEffect(() => {
  api
   .get("/jadwal/dosen/saya")
   .then((res) => setJadwalList(res.data))
   .catch((err) => console.error(err))
   .finally(() => setLoadingJadwal(false));
 }, []);
 useEffect(() => {
  if (!selectedJadwal) return;

  const fetchRekap = async () => {
   setLoadingRekap(true);
   try {
    const res = await api.get(`/presensi/rekap/${selectedJadwal}`);
    setRekap(res.data);
   } catch (err) {
    console.error(err);
   } finally {
    setLoadingRekap(false);
   }
  };

  fetchRekap();
 }, [selectedJadwal]);

 // Ambil semua mahasiswa unik dari semua sesi
 const mahasiswaMap = {};
 rekap.forEach((sesi) => {
  sesi.catatanHadir.forEach((c) => {
   if (!mahasiswaMap[c.mahasiswaId]) {
    mahasiswaMap[c.mahasiswaId] = c.mahasiswa;
   }
  });
 });
 const mahasiswaList = Object.values(mahasiswaMap);

 // Hitung % kehadiran per mahasiswa
 const getStatus = (mahasiswaId, sesiId) => {
  const sesi = rekap.find((s) => s.id === sesiId);
  if (!sesi) return "-";
  const catatan = sesi.catatanHadir.find((c) => c.mahasiswaId === mahasiswaId);
  return catatan?.status || "ALPA";
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

 const selectedJadwalData = jadwalList.find((j) => j.id === selectedJadwal);

 return (
  <div>
   <div className="flex items-center justify-between mb-6">
    <div>
     <h1 className="text-2xl font-bold text-gray-800">Riwayat Kehadiran</h1>
     <p className="text-gray-500 text-sm">
      Pantau dan unduh laporan absensi mahasiswa Anda.
     </p>
    </div>
   </div>

   {/* Filter */}
   <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 mb-4">
    <div className="flex gap-4 items-end">
     <div className="flex-1 max-w-xs">
      <label className="block text-sm font-medium text-gray-700 mb-1">
       Mata Kuliah
      </label>
      <select
       value={selectedJadwal}
       onChange={(e) => setSelectedJadwal(e.target.value)}
       className="text-gray-700 w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
       <option value="">Pilih Mata Kuliah...</option>
       {jadwalList.map((j) => (
        <option key={j.id} value={j.id}>
         {j.mataKuliah?.nama} ({j.kelas})
        </option>
       ))}
      </select>
     </div>
    </div>

    {/* Stats */}
    {selectedJadwal && rekap.length > 0 && (
     <div className="grid grid-cols-3 gap-4 mt-4">
      <div className="bg-gray-50 rounded-xl p-3 text-center">
       <p className="text-xs text-gray-500">Total Mahasiswa</p>
       <p className="text-xl font-bold text-gray-800">{mahasiswaList.length}</p>
      </div>
      <div className="bg-gray-50 rounded-xl p-3 text-center">
       <p className="text-xs text-gray-500">Total Pertemuan</p>
       <p className="text-xl font-bold text-gray-800">
        {rekap.length} Sesi Selesai
       </p>
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

   {/* Tabel Matriks */}
   {selectedJadwal && (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
     <div className="p-4 border-b border-gray-100 flex items-center justify-between">
      <h2 className="font-semibold text-gray-800">
       Matriks Kehadiran — {selectedJadwalData?.mataKuliah?.nama} (
       {selectedJadwalData?.kelas})
      </h2>
      <div className="flex items-center gap-3 text-xs">
       <span className="flex items-center gap-1">
        <span className="w-5 h-5 bg-green-500 rounded text-white flex items-center justify-center font-bold">
         H
        </span>
        Hadir
       </span>
       <span className="flex items-center gap-1">
        <span className="w-5 h-5 bg-red-400 rounded text-white flex items-center justify-center font-bold">
         A
        </span>
        Alpa
       </span>
      </div>
     </div>

     {loadingRekap ? (
      <div className="py-12 text-center text-gray-400">Memuat rekap...</div>
     ) : rekap.length === 0 ? (
      <div className="py-12 text-center text-gray-400">
       Belum ada sesi yang selesai.
      </div>
     ) : (
      <div className="overflow-x-auto">
       <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
         <tr>
          <th className="px-5 py-3 text-left sticky left-0 bg-gray-50">No</th>
          <th className="px-5 py-3 text-left sticky left-8 bg-gray-50">
           Nama Mahasiswa
          </th>
          <th className="px-4 py-3 text-left left-47.5 bg-gray-50 z-10 min-w-27.5">
           NIM
          </th>
          {rekap.map((sesi) => (
           <th key={sesi.id} className="px-3 py-3 text-center">
            P{sesi.pertemuanKe}
           </th>
          ))}
          <th className="px-5 py-3 text-center text-purple-600">% Hadir</th>
         </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
         {mahasiswaList.map((mhs, index) => {
          const persen = getPersentase(mhs.id);
          return (
           <tr key={mhs.id} className="hover:bg-gray-50">
            <td className="px-5 py-3 text-gray-500 sticky left-0 bg-white">
             {index + 1}
            </td>
            <td className="px-5 py-3 font-medium text-gray-700 sticky left-8 bg-white">
             {mhs.nama}
            </td>
            <td className="px-4 py-3 text-gray-500 left-47.5 bg-white z-10 min-w-27.5">
             {mhs.nim}
            </td>
            {rekap.map((sesi) => {
             const status = getStatus(mhs.id, sesi.id);
             return (
              <td key={sesi.id} className="px-3 py-3 text-center">
               <span
                className={`w-7 h-7 rounded inline-flex items-center justify-center text-white text-xs font-bold ${
                 status === "HADIR" ? "bg-green-500" : "bg-red-400"
                }`}
               >
                {status === "HADIR" ? "H" : "A"}
               </span>
              </td>
             );
            })}
            <td className="px-5 py-3 text-center">
             <span
              className={`font-bold text-sm ${
               persen >= 75 ? "text-green-600" : "text-red-500"
              }`}
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

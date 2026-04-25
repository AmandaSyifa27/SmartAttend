"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";

export default function DashboardPage() {
 const router = useRouter();
 const [stats, setStats] = useState({
  totalMahasiswa: 0,
  totalDosen: 0,
  totalJadwal: 0,
  belumDirekam: 0,
 });
 const [aktivitas, setAktivitas] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
  const fetchData = async () => {
   try {
    const [mahasiswa, dosen, jadwal] = await Promise.all([
     api.get("/mahasiswa"),
     api.get("/dosen"),
     api.get("/jadwal"),
    ]);

    const belumDirekam = mahasiswa.data.filter((m) => !m.isFaceEnrolled).length;

    setStats({
     totalMahasiswa: mahasiswa.data.length,
     totalDosen: dosen.data.length,
     totalJadwal: jadwal.data.length,
     belumDirekam,
    });
   } catch (err) {
    console.error(err);
   } finally {
    setLoading(false);
   }
  };

  fetchData();
 }, []);

 const quickAccess = [
  {
   no: 1,
   label: "Buat dan Aktifkan Tahun Ajaran Baru",
   href: "/tahun-ajaran",
  },
  { no: 2, label: "Buat Jadwal Master Baru", href: "/jadwal" },
  { no: 3, label: "Input KRS & Plotting Mahasiswa Baru", href: "/jadwal" },
 ];

 if (loading) {
  return (
   <div className="flex items-center justify-center h-64">
    <p className="text-gray-400">Memuat data...</p>
   </div>
  );
 }

 return (
  <div>
   <h1 className="text-2xl font-bold text-gray-800 mb-1">Ringkasan Sistem</h1>
   <p className="text-gray-500 text-sm mb-6">
    Pantau status data master dan operasional akademik Anda.
   </p>

   {/* Stats Cards */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
       👥
      </div>
      <p className="text-xs text-gray-500">Total Mahasiswa</p>
     </div>
     <p className="text-2xl font-bold text-gray-800">
      {stats.totalMahasiswa.toLocaleString()}
     </p>
    </div>

    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
       👤
      </div>
      <p className="text-xs text-gray-500">Total Dosen</p>
     </div>
     <p className="text-2xl font-bold text-gray-800">{stats.totalDosen}</p>
    </div>

    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
       📅
      </div>
      <p className="text-xs text-gray-500">Jadwal Aktif (Smt Ini)</p>
     </div>
     <p className="text-2xl font-bold text-gray-800">{stats.totalJadwal}</p>
    </div>

    <div className="bg-white rounded-xl p-4 border border-red-100 shadow-sm">
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-lg">
       📷
      </div>
      <p className="text-xs text-red-500 font-semibold">Wajah Belum Direkam</p>
     </div>
     <p className="text-2xl font-bold text-red-600">{stats.belumDirekam}</p>
     <p className="text-xs text-gray-400 mt-1">Mahasiswa</p>
    </div>
   </div>

   {/* Bottom Section */}
   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Quick Access */}
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
     <h2 className="font-semibold text-gray-800 mb-4">
      Akses Cepat (Standar Operasional)
     </h2>
     <div className="space-y-2">
      {quickAccess.map((item) => (
       <button
        key={item.no}
        onClick={() => router.push(item.href)}
        className="w-full flex items-center gap-4 px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-left"
       >
        <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
         {item.no}
        </span>
        <span className="text-sm text-gray-700">{item.label}</span>
        <span className="ml-auto text-gray-400">›</span>
       </button>
      ))}
     </div>
    </div>

    {/* Aktivitas Terkini */}
    <div className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm">
     <h2 className="font-semibold text-gray-800 mb-4">
      Aktivitas Sistem Terkini
     </h2>
     {aktivitas.length === 0 ? (
      <p className="text-sm text-gray-400 text-center py-8">
       Belum ada aktivitas terkini.
      </p>
     ) : (
      <div className="space-y-3">
       {aktivitas.map((item, i) => (
        <div key={i} className="flex items-start gap-3">
         <span className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0" />
         <div>
          <p className="text-sm text-gray-700">{item.label}</p>
          <p className="text-xs text-gray-400">{item.waktu}</p>
         </div>
        </div>
       ))}
      </div>
     )}
    </div>
   </div>
  </div>
 );
}

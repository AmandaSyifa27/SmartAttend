"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import { CalendarDays, GraduationCap, Users, VideoOff } from "lucide-react";
import Spinner from "@/components/ui/Spinner";
import Link from "next/link";

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
 const [rekapChart, setRekapChart] = useState([]);

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
    const rekapPromises = jadwal.data.map((j) =>
     api
      .get(`/presensi/rekap/${j.id}`)
      .then((r) => ({ jadwal: j, sesi: r.data }))
      .catch(() => ({ jadwal: j, sesi: [] })),
    );
    const allRekap = await Promise.all(rekapPromises);
    setRekapChart(allRekap);
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
    {/* <p className="text-gray-400">Memuat data...</p> */}
    <Spinner className="py-8" />
   </div>
  );
 }
 const chartData = rekapChart
  .map(({ jadwal: j, sesi }) => {
   if (sesi.length === 0)
    return {
     nama: j.mataKuliah?.nama,
     kelas: j.kelas,
     persen: 0,
     totalSesi: 0,
    };
   const semuaCatatan = sesi.flatMap((s) => s.catatanHadir);
   const hadir = semuaCatatan.filter((c) => c.status === "HADIR").length;
   const persen =
    semuaCatatan.length > 0
     ? Math.round((hadir / semuaCatatan.length) * 100)
     : 0;
   return {
    nama: j.mataKuliah?.nama,
    kelas: j.kelas,
    persen,
    totalSesi: sesi.length,
   };
  })
  .filter((d) => d.totalSesi > 0);

 return (
  <div>
   <h1 className="text-2xl font-bold text-gray-800 mb-1">Ringkasan Sistem</h1>
   <p className="text-gray-500 text-sm mb-6">
    Pantau status data master dan operasional akademik Anda.
   </p>

   {/* Stats Cards */}
   <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
    <Link
     href="/mahasiswa"
     className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
    >
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center">
       <GraduationCap color="#5c00f1" />
      </div>
      <p className="text-2xs text-gray-500">Total Mahasiswa</p>
     </div>
     <p className="text-2xl font-bold text-gray-800">
      {stats.totalMahasiswa.toLocaleString()}
     </p>
    </Link>

    <Link
     href="/dosen"
     className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
    >
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
       <Users color="#5c00f1" />
      </div>
      <p className="text-2xs text-gray-500">Total Dosen</p>
     </div>
     <p className="text-2xl font-bold text-gray-800">{stats.totalDosen}</p>
    </Link>

    <Link
     href="/jadwal"
     className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all"
    >
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 bg-purple-100 rounded-lg flex items-center justify-center text-lg">
       <CalendarDays color="#5c00f1" />
      </div>
      <p className="text-2xs text-gray-500">Jadwal Aktif (Smt Ini)</p>
     </div>
     <p className="text-2xl font-bold text-gray-800">{stats.totalJadwal}</p>
    </Link>

    <Link
     href="/mahasiswa"
     className="bg-white rounded-xl p-4 border border-red-100 shadow-sm hover:shadow-md hover:border-red-200 transition-all"
    >
     <div className="flex items-center gap-3 mb-2">
      <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-lg">
       <VideoOff color="#f00048" />
      </div>
      <p className="text-2xs text-red-500 font-semibold">Wajah Belum Direkam</p>
     </div>
     <p className="text-2xl font-bold text-red-600">{stats.belumDirekam}</p>
     <p className="text-xs text-gray-400 mt-1">Mahasiswa</p>
    </Link>
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
        className="w-full flex items-center gap-4 px-4 py-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-left cursor-pointer"
       >
        <span className="w-7 h-7 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-sm font-bold shrink-0">
         {item.no}
        </span>
        <span className="text-sm text-gray-700">{item.label}</span>
        <span className="ml-auto text-gray-400">›</span>
       </button>
      ))}
     </div>
    </div>

    {chartData.length > 0 && (
     <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <h2 className="font-bold text-gray-800 mb-1">
       Rata-rata Kehadiran per Mata Kuliah
      </h2>
      <p className="text-xs text-gray-400 mb-5">
       Berdasarkan semua sesi yang sudah selesai
      </p>
      <div className="space-y-4">
       {chartData.map((d, i) => (
        <div key={i}>
         <div className="flex items-center justify-between mb-1">
          <div>
           <span className="text-sm font-medium text-gray-700">{d.nama}</span>
           <span className="text-xs text-gray-400 ml-2">({d.kelas})</span>
          </div>
          <div className="flex items-center gap-2">
           <span className="text-xs text-gray-400">{d.totalSesi} sesi</span>
           <span
            className={`text-sm font-bold ${
             d.persen >= 75 ? "text-green-600" : "text-red-500"
            }`}
           >
            {d.persen}%
           </span>
          </div>
         </div>
         <div className="w-full bg-gray-100 rounded-full h-2.5">
          <div
           className={`h-2.5 rounded-full transition-all duration-500 ${
            d.persen >= 70 ? "bg-green-600" : "bg-red-400"
           }`}
           style={{ width: `${d.persen}%` }}
          />
         </div>
        </div>
       ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">
       <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <div className="w-3 h-3 bg-green-600 rounded-full" />≥ 70% (Baik)
       </div>
       <div className="flex items-center gap-1.5 text-xs text-gray-500">
        <div className="w-3 h-3 bg-red-400 rounded-full" />
        &lt; 70% (Perlu perhatian)
       </div>
      </div>
     </div>
    )}
   </div>
  </div>
 );
}

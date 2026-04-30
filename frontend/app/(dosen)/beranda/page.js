"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import api from "@/lib/axios";
import ModalBuatKelas from "@/components/shared/ModalBuatKelas";

export default function BerandaDosenPage() {
 const router = useRouter();
 const [jadwal, setJadwal] = useState([]);
 const [loading, setLoading] = useState(true);
 const [showModal, setShowModal] = useState(false);
 const [today, setToday] = useState("");

 const HARI = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

 useEffect(() => {
  const now = new Date();
  setToday(HARI[now.getDay()]);
  fetchJadwal();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const fetchJadwal = async () => {
  try {
   const res = await api.get("/jadwal/dosen/saya");
   setJadwal(res.data);
  } catch (err) {
   console.error(err);
  } finally {
   setLoading(false);
  }
 };

 const jadwalHariIni = jadwal.filter((j) => j.hari === today);
 const jadwalLainnya = jadwal.filter((j) => j.hari !== today);

 const getStatus = (item) => {
  const now = new Date();
  const [jamH, menitH] = item.jamMulai.split(":").map(Number);
  const [jamS, menitS] = item.jamSelesai.split(":").map(Number);
  const mulai = new Date();
  mulai.setHours(jamH, menitH, 0);
  const selesai = new Date();
  selesai.setHours(jamS, menitS, 0);

  if (now >= mulai && now <= selesai) return "berlangsung";
  if (now < mulai) return "akan-datang";
  return "selesai";
 };

 const handleMulaiPresensi = (item) => {
  const lastSesi = item.sesiPertemuan?.[0];
  const pertemuanKe = lastSesi ? lastSesi.pertemuanKe + 1 : 1;
  router.push(
   `/presensi?jadwalId=${item.id}&pertemuanKe=${pertemuanKe}&tipe=OFFLINE`,
  );
 };

 return (
  <div>
   {/* Banner */}
   <div className="bg-purple-600 rounded-2xl p-5 text-white flex items-center justify-between mb-6">
    <div>
     <p className="font-semibold mb-1">
      Anda memiliki{" "}
      <span className="font-bold">
       {jadwalHariIni.length} jadwal perkuliahan
      </span>{" "}
      hari ini.
     </p>
     <p className="text-purple-200 text-sm">
      Jangan lupa untuk memulai sesi presensi tepat waktu.
     </p>
    </div>
    <button
     onClick={() => setShowModal(true)}
     className="bg-white text-purple-700 font-semibold text-sm px-4 py-2.5 rounded-xl hover:bg-purple-50 flex items-center gap-2 shrink-0"
    >
     ⚡ Buat Kelas Instan
    </button>
   </div>

   {/* Jadwal Hari Ini */}
   <div className="mb-2 flex items-center justify-between">
    <h2 className="font-bold text-gray-800 flex items-center gap-2">
     📅 Jadwal Anda Hari Ini
    </h2>
    <p className="text-sm text-gray-400">
     {new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
     })}
    </p>
   </div>

   {loading ? (
    <p className="text-gray-400 text-sm py-8 text-center">Memuat jadwal...</p>
   ) : jadwalHariIni.length === 0 ? (
    <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-400 text-sm mb-6">
     Tidak ada jadwal hari ini.
    </div>
   ) : (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
     {jadwalHariIni.map((item) => {
      const status = getStatus(item);
      return (
       <div
        key={item.id}
        className="bg-white rounded-xl border border-gray-100 shadow-sm p-5"
       >
        <div className="flex items-center justify-between mb-3">
         <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
           status === "berlangsung"
            ? "bg-green-100 text-green-700"
            : status === "akan-datang"
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-400"
          }`}
         >
          {status === "berlangsung"
           ? "● Segera Mulai"
           : status === "akan-datang"
             ? "Nanti Siang"
             : "Selesai"}
         </span>
        </div>

        <h3 className="font-bold text-gray-800 mb-1">
         {item.mataKuliah?.nama}
        </h3>
        <p className="text-gray-500 text-sm mb-1">
         Kelas {item.kelas} • {item._count?.mahasiswa} Mahasiswa
        </p>
        <p className="text-gray-400 text-xs mb-1">
         🕐 {item.jamMulai} - {item.jamSelesai} WIB
        </p>

        <button
         onClick={() => handleMulaiPresensi(item)}
         className="w-full mt-3 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold py-2 rounded-lg"
        >
         ▶ Mulai Presensi
        </button>
       </div>
      );
     })}
    </div>
   )}

   {/* Modal Buat Kelas Instan */}
   {showModal && (
    <ModalBuatKelas
     jadwalList={jadwal}
     onClose={() => setShowModal(false)}
     onBuka={(jadwalId, pertemuanKe, tipe) => {
      setShowModal(false);
      router.push(
       `/presensi?jadwalId=${jadwalId}&pertemuanKe=${pertemuanKe}&tipe=${tipe}`,
      );
     }}
    />
   )}
  </div>
 );
}

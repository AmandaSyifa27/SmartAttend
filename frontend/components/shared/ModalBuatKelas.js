"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

export default function ModalBuatKelas({ jadwalList, onClose, onBuka }) {
 const [selectedJadwalId, setSelectedJadwalId] = useState("");
 const [pertemuanKe, setPertemuanKe] = useState(1);
 const [tipe, setTipe] = useState("OFFLINE");
 const [pertemuanTerpakai, setPertemuanTerpakai] = useState([]);
 const [loadingPertemuan, setLoadingPertemuan] = useState(false);
 const [jumlahSelesai, setJumlahSelesai] = useState(0);

 const selectedJadwal = jadwalList.find((j) => j.id === selectedJadwalId);
 const isDuplikat = pertemuanTerpakai.includes(Number(pertemuanKe));

 // Fetch pertemuan yang sudah ada saat jadwal dipilih
 useEffect(() => {
  if (!selectedJadwalId) {
   setPertemuanTerpakai([]);
   return;
  }
  setLoadingPertemuan(true);
  api
   .get(`/presensi/sesi/${selectedJadwalId}/pertemuan`)
   .then((res) => {
    const terpakai = res.data.map((s) => s.pertemuanKe);
    setPertemuanTerpakai(terpakai);
    // Auto set ke pertemuan berikutnya
    const next = terpakai.length > 0 ? Math.max(...terpakai) + 1 : 1;
    setPertemuanKe(next);
   })
   .catch(() => setPertemuanTerpakai([]))
   .finally(() => setLoadingPertemuan(false));
 }, [selectedJadwalId]);

 useEffect(() => {
  if (!selectedJadwalId) {
   setPertemuanTerpakai([]);
   setJumlahSelesai(0);
   return;
  }
  setLoadingPertemuan(true);
  api
   .get(`/presensi/sesi/${selectedJadwalId}/pertemuan`)
   .then((res) => {
    const selesai = res.data.filter((s) => s.statusSesi === "SELESAI");
    const terpakai = res.data.map((s) => s.pertemuanKe);
    setPertemuanTerpakai(terpakai);
    setJumlahSelesai(selesai.length);
    const next = terpakai.length > 0 ? Math.max(...terpakai) + 1 : 1;
    setPertemuanKe(next);
   })
   .catch(() => setPertemuanTerpakai([]))
   .finally(() => setLoadingPertemuan(false));
 }, [selectedJadwalId]);

 const handleSubmit = (e) => {
  e.preventDefault();
  if (!selectedJadwalId) return;
  if (isDuplikat) {
   alert(
    `Pertemuan ke-${pertemuanKe} sudah pernah diadakan. Pilih nomor lain.`,
   );
   return;
  }
  onBuka(selectedJadwalId, Number(pertemuanKe), tipe);
 };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
   <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
    <div className="flex items-center justify-between mb-4">
     <h2 className="text-lg font-bold text-gray-800">⚡ Buat Kelas Instan</h2>
     <button
      onClick={onClose}
      className="text-gray-400 hover:text-gray-600 text-xl leading-none"
     >
      ×
     </button>
    </div>

    <form onSubmit={handleSubmit} className="space-y-4 text-gray-700">
     <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
       Pilih Mata Kuliah
      </label>
      <select
       value={selectedJadwalId}
       onChange={(e) => setSelectedJadwalId(e.target.value)}
       className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
       required
      >
       <option value="">-- Pilih Mata Kuliah --</option>
       {jadwalList.map((j) => (
        <option key={j.id} value={j.id}>
         {j.mataKuliah?.nama} — Kelas {j.kelas} ({j.hari})
        </option>
       ))}
      </select>
     </div>

     <div className="grid grid-cols-2 gap-3">
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
        Pertemuan Ke-
       </label>
       <input
        type="number"
        min={1}
        value={pertemuanKe}
        onChange={(e) => setPertemuanKe(e.target.value)}
        className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${
         isDuplikat
          ? "border-red-400 focus:ring-red-400 bg-red-50"
          : "border-gray-300 focus:ring-purple-500"
        }`}
        required
       />
       {jumlahSelesai >= 14 && (
        <p className="text-red-500 text-xs mt-1 font-semibold">
         ⚠ Batas maksimal 14 pertemuan sudah tercapai!
        </p>
       )}
       {isDuplikat && (
        <p className="text-red-500 text-xs mt-1">
         ⚠ Pertemuan ke-{pertemuanKe} sudah pernah diadakan
        </p>
       )}
       {loadingPertemuan && (
        <p className="text-gray-400 text-xs mt-1">Memuat data...</p>
       )}
       {selectedJadwalId && !loadingPertemuan && (
        <p className="text-gray-400 text-xs mt-1">
         *Otomatis pertemuan ke-{pertemuanKe}
        </p>
       )}
      </div>
      <div>
       <label className="block text-sm font-medium text-gray-700 mb-1">
        Tipe Kelas
       </label>
       <select
        value={tipe}
        onChange={(e) => setTipe(e.target.value)}
        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
       >
        <option value="OFFLINE">Tatap Muka (Offline)</option>
        <option value="ONLINE">Daring (Online)</option>
       </select>
      </div>
     </div>

     {selectedJadwal && (
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-500 space-y-1">
       <p>
        <span className="font-medium">Hari:</span> {selectedJadwal.hari}
       </p>
       <p>
        <span className="font-medium">Jam:</span> {selectedJadwal.jamMulai} -{" "}
        {selectedJadwal.jamSelesai}
       </p>
       <p>
        <span className="font-medium">Ruangan:</span>{" "}
        {selectedJadwal.ruangan || "-"}
       </p>
      </div>
     )}

     <div className="flex gap-2 pt-2">
      <button
       type="button"
       onClick={onClose}
       className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50"
      >
       Batal
      </button>
      <button
       type="submit"
       disabled={isDuplikat || !selectedJadwalId || jumlahSelesai >= 14}
       className="flex-1 px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
       ▶ Buka Sesi Presensi
      </button>
     </div>
    </form>
   </div>
  </div>
 );
}

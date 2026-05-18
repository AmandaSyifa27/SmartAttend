"use client";

import { useState, useEffect } from "react";
import { Play, Trash, TriangleAlert, Zap } from "lucide-react";
import api from "@/lib/axios";
import Spinner from "../ui/Spinner";
import Alert from "../ui/Alert";

export default function ModalBuatKelas({ jadwalList, onClose, onBuka }) {
 const [selectedJadwalId, setSelectedJadwalId] = useState("");
 const [pertemuanKe, setPertemuanKe] = useState(1);
 const [tipe, setTipe] = useState("OFFLINE");
 const [pertemuanTerpakai, setPertemuanTerpakai] = useState([]);
 const [loadingPertemuan, setLoadingPertemuan] = useState(false);
 const [jumlahSelesai, setJumlahSelesai] = useState(0);
 const [pertemuanBerikutnya, setPertemuanBerikutnya] = useState(1);
 const selectedJadwal = jadwalList.find((j) => j.id === selectedJadwalId);
 const isDuplikat = pertemuanTerpakai.includes(Number(pertemuanKe));
 const [sesiBerlangsung, setSesiBerlangsung] = useState(null);
 const [loadingSesi, setLoadingSesi] = useState(false);
 const [alertInfo, setAlertInfo] = useState({
  show: false,
  message: "",
  type: "info",
 });

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
   setSesiBerlangsung(null);
   return;
  }
  setLoadingPertemuan(true);

  Promise.all([
   api.get(`/presensi/sesi/${selectedJadwalId}/pertemuan`),
   api.get(`/presensi/sesi/${selectedJadwalId}/berlangsung`),
  ])
   .then(([pertemuanRes, berlangsungRes]) => {
    const semua = pertemuanRes.data;
    const selesai = semua.filter((s) => s.statusSesi === "SELESAI");
    const terpakai = semua.map((s) => s.pertemuanKe);
    setPertemuanTerpakai(terpakai);
    setJumlahSelesai(selesai.length);

    if (berlangsungRes.data) {
     setSesiBerlangsung(berlangsungRes.data);
    } else {
     setSesiBerlangsung(null);
     let next = 1;
     while (terpakai.includes(next)) {
      next++;
     }
     setPertemuanKe(next);
    }
   })
   .catch(() => setPertemuanTerpakai([]))
   .finally(() => setLoadingPertemuan(false));
 }, [selectedJadwalId]);

 const showAlert = (message, type = "info") => {
  setAlertInfo({ show: true, message, type });
 };

 const handleHapusSesiTerlantar = async () => {
  if (!sesiBerlangsung) return;
  setLoadingSesi(true);
  try {
   await api.delete(`/presensi/sesi/${sesiBerlangsung.id}`);
   setSesiBerlangsung(null);
   // Refresh pertemuan setelah hapus
   const res = await api.get(`/presensi/sesi/${selectedJadwalId}/pertemuan`);
   const selesai = res.data.filter((s) => s.statusSesi === "SELESAI");
   setPertemuanTerpakai(res.data.map((s) => s.pertemuanKe));
   setJumlahSelesai(selesai.length);
   //  setPertemuanKe(selesai.length + 1);
   let next = 1;
   while (terpakai.includes(next)) {
    next++;
   }
   showAlert("Sesi berhasil dihapus", "warning");
   setPertemuanKe(next);
  } catch (err) {
   showAlert(err.response?.data?.message || "Gagal menghapus sesi", "error");
  } finally {
   setLoadingSesi(false);
  }
 };

 const handleLanjutkanSesi = () => {
  if (!sesiBerlangsung) return;
  onBuka(
   selectedJadwalId,
   sesiBerlangsung.pertemuanKe,
   sesiBerlangsung.tipeKelas,
   sesiBerlangsung.id,
  );
 };

 const handleSubmit = (e) => {
  e.preventDefault();
  if (!selectedJadwalId) return;
  if (isDuplikat) {
   showAlert(
    `Pertemuan ke-${pertemuanKe} sudah pernah diadakan. Pilih nomor lain.`,
    "warning",
   );
   return;
  }
  onBuka(selectedJadwalId, Number(pertemuanKe), tipe);
 };

 return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
   <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
    <div className="flex items-center justify-between mb-4">
     <div className="flex items-center gap-2">
      <Zap color="#ffbb00" />
      <h2 className="text-lg font-bold text-gray-800">Buat Kelas Instan</h2>
     </div>
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
       <div className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700 font-semibold">
        {pertemuanKe}
       </div>
       {loadingPertemuan && (
        // <p className="text-gray-400 text-xs mt-1">Memuat data...</p>
        <Spinner className="py-8" />
       )}
       {selectedJadwalId && !loadingPertemuan && jumlahSelesai < 14 && (
        <p className="text-gray-400 text-xs mt-1">
         *Pertemuan yang belum diadakan
        </p>
       )}
       {jumlahSelesai >= 14 && (
        <p className="text-red-500 text-xs mt-1 font-semibold">
         ⚠ Batas maksimal 14 pertemuan sudah tercapai!
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
     {sesiBerlangsung && (
      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
       <p className="text-orange-700 font-semibold text-sm mb-1 flex items-center gap-1">
        <TriangleAlert sixe={16} color="#C2410C" /> Ada sesi yang belum selesai!
       </p>
       <p className="text-orange-600 text-xs mb-3">
        Pertemuan ke-{sesiBerlangsung.pertemuanKe} pernah dibuka tapi belum
        dikonfirmasi. Lanjutkan atau hapus sesi ini.
       </p>
       <div className="flex gap-2">
        <button
         type="button"
         onClick={handleLanjutkanSesi}
         className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold py-2 rounded-lg"
        >
         <Play size={14} color="#fff" /> Lanjutkan Sesi P
         {sesiBerlangsung.pertemuanKe}
        </button>
        <button
         type="button"
         onClick={handleHapusSesiTerlantar}
         disabled={loadingSesi}
         className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold py-2 rounded-lg"
        >
         {loadingSesi ? (
          "Menghapus..."
         ) : (
          <>
           <Trash size={14} color="#fff" />
           Hapus Sesi Ini
          </>
         )}
        </button>
       </div>
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
       disabled={
        !selectedJadwalId ||
        jumlahSelesai >= 14 ||
        loadingPertemuan ||
        !!sesiBerlangsung
       }
       className="flex-1 flex gap-1.5 items-center justify-center px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
       <Play size={16} color="#fff" />
       Buka Sesi Presensi
      </button>
     </div>
    </form>
   </div>
   <Alert
    show={alertInfo.show}
    message={alertInfo.message}
    type={alertInfo.type}
    onClose={() => setAlertInfo((prev) => ({ ...prev, show: false }))}
   />
  </div>
 );
}

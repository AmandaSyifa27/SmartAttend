"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import * as faceapi from "face-api.js";

export default function PresensiPage() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const jadwalId = searchParams.get("jadwalId");
 const pertemuanKe = parseInt(searchParams.get("pertemuanKe"));
 const tipe = searchParams.get("tipe");

 const videoRef = useRef(null);
 const canvasRef = useRef(null);

 const [sesi, setSesi] = useState(null);
 const [mahasiswaList, setMahasiswaList] = useState([]);
 const [kehadiran, setKehadiran] = useState({});
 const [modelLoaded, setModelLoaded] = useState(false);
 const [kameraAktif, setKameraAktif] = useState(false);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [searchMhs, setSearchMhs] = useState("");

 // Buka sesi saat halaman dimuat
 useEffect(() => {
  if (!jadwalId || !pertemuanKe || !tipe) {
   router.push("/beranda");
   return;
  }
  bukaSesi();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const bukaSesi = async () => {
  try {
   const res = await api.post("/presensi/sesi", {
    jadwalId,
    pertemuanKe,
    tipeKelas: tipe,
   });
   setSesi(res.data.data);

   // Ambil daftar mahasiswa beserta faceDescriptor
   const mhsList = res.data.data.jadwal.mahasiswa;
   setMahasiswaList(mhsList);

   // Default semua ALPA dulu
   const defaultKehadiran = {};
   mhsList.forEach((m) => {
    defaultKehadiran[m.id] = tipe === "ONLINE" ? "HADIR" : "ALPA";
   });
   setKehadiran(defaultKehadiran);
  } catch (err) {
   alert(err.response?.data?.message || "Gagal membuka sesi");
   router.push("/beranda");
  } finally {
   setLoading(false);
  }
 };

 // Load model face-api.js (hanya untuk OFFLINE)
 useEffect(() => {
  if (tipe !== "OFFLINE") return;
  const loadModels = async () => {
   const MODEL_URL = "/models";
   await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
   ]);
   setModelLoaded(true);
  };
  loadModels();
 }, [tipe]);

 // Aktifkan kamera
 const startKamera = async () => {
  try {
   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
   videoRef.current.srcObject = stream;
   setKameraAktif(true);
   startDeteksi();
  } catch {
   alert("Gagal mengakses kamera");
  }
 };

 // Deteksi wajah realtime
 const startDeteksi = () => {
  const interval = setInterval(async () => {
   if (!videoRef.current || !canvasRef.current) return;

   const detections = await faceapi
    .detectAllFaces(
     videoRef.current,
     new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
    )
    .withFaceLandmarks()
    .withFaceDescriptors();

   // Match dengan descriptor mahasiswa
   detections.forEach((det) => {
    let bestMatch = null;
    let bestDistance = 0.5; // threshold

    mahasiswaList.forEach((mhs) => {
     if (!mhs.faceDescriptor || mhs.faceDescriptor.length === 0) return;
     const descriptor = new Float32Array(mhs.faceDescriptor);
     const distance = faceapi.euclideanDistance(det.descriptor, descriptor);
     if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = mhs.id;
     }
    });

    if (bestMatch) {
     setKehadiran((prev) => ({ ...prev, [bestMatch]: "HADIR" }));
    }
   });
  }, 1000);

  return () => clearInterval(interval);
 };

 const handleToggle = (id) => {
  setKehadiran((prev) => ({
   ...prev,
   [id]: prev[id] === "HADIR" ? "ALPA" : "HADIR",
  }));
 };

 const handleSubmit = async () => {
  if (!sesi) return;
  setSubmitting(true);
  try {
   const payload = Object.entries(kehadiran).map(([mahasiswaId, status]) => ({
    mahasiswaId,
    status,
   }));
   await api.post(`/presensi/sesi/${sesi.id}/submit`, { kehadiran: payload });
   alert("Kehadiran berhasil disimpan!");
   router.push("/riwayat");
  } catch (err) {
   alert(err.response?.data?.message || "Gagal menyimpan");
  } finally {
   setSubmitting(false);
  }
 };

 const totalHadir = Object.values(kehadiran).filter(
  (s) => s === "HADIR",
 ).length;
 const filteredMhs = mahasiswaList.filter((m) =>
  m.nama.toLowerCase().includes(searchMhs.toLowerCase()),
 );

 if (loading) {
  return (
   <div className="flex items-center justify-center h-64">
    <p className="text-gray-400">Membuka sesi presensi...</p>
   </div>
  );
 }

 return (
  <div className="flex gap-4 h-[calc(100vh-80px)]">
   {/* Kiri — Kamera atau Info Online */}
   <div className="flex-1 flex flex-col">
    {/* Header */}
    <div className="flex items-center gap-3 mb-3">
     <button
      onClick={() => router.push("/beranda")}
      className="text-gray-400 hover:text-gray-600"
     >
      ←
     </button>
     <div>
      <div className="flex items-center gap-2">
       <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
         tipe === "OFFLINE"
          ? "bg-purple-100 text-purple-700"
          : "bg-blue-100 text-blue-700"
        }`}
       >
        {tipe === "OFFLINE"
         ? "Mode Tatap Muka (Offline)"
         : "Mode Daring (Online)"}
       </span>
       <span className="text-xs text-gray-400">Pertemuan {pertemuanKe}</span>
      </div>
      <h1 className="font-bold text-gray-800">
       {sesi?.jadwal?.mataKuliah?.nama}
      </h1>
     </div>
    </div>

    {tipe === "OFFLINE" ? (
     /* Kamera */
     <div className="bg-black rounded-2xl flex-1 relative overflow-hidden">
      {kameraAktif ? (
       <>
        <video
         ref={videoRef}
         autoPlay
         muted
         className="w-full h-full object-cover"
        />
        <canvas ref={canvasRef} className="absolute inset-0" />
        <div className="absolute top-3 left-3 flex items-center gap-2">
         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
         <span className="text-white text-xs font-semibold">KAMERA AKTIF</span>
        </div>
        {modelLoaded && (
         <span className="absolute top-3 right-3 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full">
          face-api.js loaded
         </span>
        )}
       </>
      ) : (
       <div className="flex items-center justify-center h-full flex-col gap-4">
        <p className="text-gray-400 text-sm">
         {modelLoaded
          ? "Model siap. Aktifkan kamera."
          : "Memuat model face-api.js..."}
        </p>
        {modelLoaded && (
         <button
          onClick={startKamera}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl"
         >
          📷 Aktifkan Kamera
         </button>
        )}
       </div>
      )}
     </div>
    ) : (
     /* Mode Online */
     <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex-1">
      <div className="flex items-start gap-3">
       <span className="text-blue-500 text-lg">ℹ</span>
       <div>
        <p className="font-semibold text-blue-800 mb-1">
         Mode Kelas Daring Aktif
        </p>
        <p className="text-blue-600 text-sm">
         Kamera wajah dinonaktifkan. Secara <em>default</em>, semua mahasiswa
         diarahkan ke status <strong>Hadir</strong>. Silakan ubah saklar menjadi
         abu-abu (Alpa) untuk mahasiswa yang tidak bergabung di{" "}
         <em>room meeting</em> Anda.
        </p>
       </div>
      </div>
     </div>
    )}
   </div>

   {/* Kanan — Daftar Kehadiran */}
   <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col">
    <div className="p-4 border-b border-gray-100 flex items-center justify-between">
     <h2 className="font-bold text-gray-800">Daftar Kehadiran</h2>
     <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
      {totalHadir}/{mahasiswaList.length} Hadir
     </span>
    </div>

    <div className="p-3 border-b border-gray-100">
     <input
      type="text"
      placeholder="Cari nama mahasiswa..."
      value={searchMhs}
      onChange={(e) => setSearchMhs(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
     />
    </div>

    <div className="flex-1 overflow-y-auto p-3 space-y-2">
     {filteredMhs.map((mhs) => (
      <div
       key={mhs.id}
       className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
      >
       <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold flex-shrink-0">
        {mhs.nama.slice(0, 2).toUpperCase()}
       </div>
       <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-700 truncate">{mhs.nama}</p>
        <p className="text-xs text-gray-400">{mhs.nim}</p>
       </div>
       {/* Toggle */}
       <button
        onClick={() => handleToggle(mhs.id)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
         kehadiran[mhs.id] === "HADIR" ? "bg-purple-600" : "bg-gray-300"
        }`}
       >
        <span
         className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          kehadiran[mhs.id] === "HADIR" ? "translate-x-5" : "translate-x-0.5"
         }`}
        />
       </button>
      </div>
     ))}
    </div>

    <div className="p-4 border-t border-gray-100">
     <button
      onClick={handleSubmit}
      disabled={submitting}
      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm"
     >
      {submitting ? "Menyimpan..." : "✓ Konfirmasi Semua & Simpan"}
     </button>
    </div>
   </div>
  </div>
 );
}

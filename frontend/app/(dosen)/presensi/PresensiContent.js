// "use client";

// import { useState, useEffect, useRef, useCallback } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import api from "@/lib/axios";
// import * as faceapi from "face-api.js";
// import { Camera, Check, ChevronLeft, MonitorCheck, Play } from "lucide-react";
// import Spinner from "@/components/ui/Spinner";
// import Alert from "@/components/ui/Alert";

// export default function PresensiContent() {
//  const router = useRouter();
//  const searchParams = useSearchParams();
//  const jadwalId = searchParams.get("jadwalId");
//  const pertemuanKe = parseInt(searchParams.get("pertemuanKe"));
//  const tipe = searchParams.get("tipe");

//  const videoRef = useRef(null);
//  const canvasRef = useRef(null);
//  const streamRef = useRef(null);
//  const deteksiIntervalRef = useRef(null);

//  const [sesi, setSesi] = useState(null);
//  const [mahasiswaList, setMahasiswaList] = useState([]);
//  const [kehadiran, setKehadiran] = useState({});
//  const [modelLoaded, setModelLoaded] = useState(false);
//  const [kameraAktif, setKameraAktif] = useState(false);
//  const [loading, setLoading] = useState(true);
//  const [submitting, setSubmitting] = useState(false);
//  const [searchMhs, setSearchMhs] = useState("");
//  const [kameraError, setKameraError] = useState("");
//  const [jadwalInfo, setJadwalInfo] = useState(null);
//  const [sesiDibuka, setSesiDibuka] = useState(false);
//  const [pilihSemua, setPilihSemua] = useState(false);
//  const sesiId = searchParams.get("sesiId");
//  const [alertInfo, setAlertInfo] = useState({
//   show: false,
//   message: "",
//   type: "info",
//  });

//  // Cleanup saat unmount
//  useEffect(() => {
//   return () => {
//    if (deteksiIntervalRef.current) clearInterval(deteksiIntervalRef.current);
//    if (streamRef.current)
//     streamRef.current.getTracks().forEach((t) => t.stop());
//   };
//  }, []);

//  useEffect(() => {
//   if (!jadwalId || !pertemuanKe || !tipe) {
//    router.push("/beranda");
//    return;
//   }
//   fetchJadwalInfo();
//   // eslint-disable-next-line react-hooks/exhaustive-deps
//  }, []);

//  // FIX VIDEO: set srcObject via useEffect setelah kameraAktif true
//  useEffect(() => {
//   if (!kameraAktif || !streamRef.current || !videoRef.current) return;
//   const video = videoRef.current;
//   video.srcObject = streamRef.current;
//   video.play().catch((e) => {
//    console.error("Video play error:", e);
//    setKameraError("Browser memblokir autoplay. Klik halaman dulu.");
//   });
//  }, [kameraAktif]);

//  const showAlert = (message, type = "info") => {
//   setAlertInfo({ show: true, message, type });
//  };

//  const fetchJadwalInfo = async () => {
//   try {
//    const res = await api.get(`/jadwal/${jadwalId}`);
//    setJadwalInfo(res.data);
//   } catch (err) {
//    console.error(err);
//    showAlert("Gagal memuat data jadwal", "error");
//    router.push("/beranda");
//   } finally {
//    setLoading(false);
//   }
//  };

//  const handleBukaSesi = async () => {
//   setLoading(true);
//   try {
//    let sesiData;

//    if (sesiId) {
//     const res = await api.get(`/jadwal/${jadwalId}`);
//     const mhsList = res.data.mahasiswa || [];
//     setMahasiswaList(mhsList);
//     const defaultKehadiran = {};
//     mhsList.forEach((m) => {
//      defaultKehadiran[m.id] = tipe === "ONLINE" ? "HADIR" : "ALPA";
//     });
//     setKehadiran(defaultKehadiran);
//     setSesi({ id: sesiId, statusSesi: "BERLANGSUNG", jadwal: res.data });
//     setSesiDibuka(true);
//    } else {
//     const res = await api.post("/presensi/sesi", {
//      jadwalId,
//      pertemuanKe,
//      tipeKelas: tipe,
//     });
//     setSesi(res.data.data);
//     const mhsList = res.data.data.jadwal.mahasiswa;
//     setMahasiswaList(mhsList);
//     const defaultKehadiran = {};
//     mhsList.forEach((m) => {
//      defaultKehadiran[m.id] = tipe === "ONLINE" ? "HADIR" : "ALPA";
//     });
//     setKehadiran(defaultKehadiran);
//     setSesiDibuka(true);
//    }
//   } catch (err) {
//    //  const msg = err.response?.data?.message || "Gagal membuka sesi";
//    showAlert(err.response?.data?.message || "Gagal membuka sesi", "error");
//    router.push("/beranda");
//   } finally {
//    setLoading(false);
//   }
//  };

//  //  checkbox pilih semua
//  const handlePilihSemua = (checked) => {
//   setPilihSemua(checked);
//   const updated = {};
//   mahasiswaList.forEach((m) => {
//    updated[m.id] = checked ? "HADIR" : "ALPA";
//   });
//   setKehadiran(updated);
//  };

//  const handleKembali = async () => {
//   // hapus sesi kalau belum dikonfirmasi
//   if (sesi && sesi.statusSesi === "BERLANGSUNG") {
//    try {
//     await api.delete(`/presensi/sesi/${sesi.id}`);
//    } catch (e) {
//     console.error("Gagal hapus sesi:", e);
//    }
//   }
//   if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
//   if (deteksiIntervalRef.current) clearInterval(deteksiIntervalRef.current);
//   router.push("/beranda");
//  };

//  // Load model face-api
//  useEffect(() => {
//   if (tipe !== "OFFLINE" || !sesiDibuka) return;
//   const loadModels = async () => {
//    try {
//     const MODEL_URL = "/models";
//     await Promise.all([
//      faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
//      faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//      faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
//     ]);
//     setModelLoaded(true);
//    } catch (e) {
//     console.error("Gagal load model:", e);
//     showAlert("Gagal memuat model face-api.js.", "error");
//    }
//   };
//   loadModels();
//  }, [tipe, sesiDibuka]);

//  // Resize canvas saat video play
//  const handleVideoPlay = useCallback(() => {
//   const video = videoRef.current;
//   const canvas = canvasRef.current;
//   if (!video || !canvas) return;

//   const updateSize = () => {
//    canvas.width = video.clientWidth;
//    canvas.height = video.clientHeight;
//   };

//   updateSize();
//   const observer = new ResizeObserver(updateSize);
//   observer.observe(video);
//   return () => observer.disconnect();
//  }, []);

//  const startKamera = async () => {
//   setKameraError("");
//   try {
//    const stream = await navigator.mediaDevices.getUserMedia({
//     video: {
//      facingMode: "user",
//      width: { ideal: 640 },
//      height: { ideal: 480 },
//     },
//    });
//    streamRef.current = stream;
//    setKameraAktif(true);
//    startDeteksi();
//   } catch (err) {
//    console.error("Kamera error:", err);
//    setKameraError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
//   }
//  };

//  const startDeteksi = () => {
//   if (deteksiIntervalRef.current) clearInterval(deteksiIntervalRef.current);
//   deteksiIntervalRef.current = setInterval(async () => {
//    const video = videoRef.current;
//    const canvas = canvasRef.current;
//    if (!video || !canvas || video.paused || video.ended || video.readyState < 2)
//     return;

//    try {
//     const detections = await faceapi
//      .detectAllFaces(
//       video,
//       new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
//      )
//      .withFaceLandmarks()
//      .withFaceDescriptors();

//     const ctx = canvas.getContext("2d");
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     const scaleX = canvas.width / (video.videoWidth || canvas.width);
//     const scaleY = canvas.height / (video.videoHeight || canvas.height);

//     detections.forEach((det) => {
//      let bestMatch = null;
//      let bestDistance = 0.5;
//      let namaMatch = "Unknown";

//      mahasiswaList.forEach((mhs) => {
//       if (!mhs.faceDescriptor || mhs.faceDescriptor.length === 0) return;
//       const descriptor = new Float32Array(mhs.faceDescriptor);
//       const distance = faceapi.euclideanDistance(det.descriptor, descriptor);
//       if (distance < bestDistance) {
//        bestDistance = distance;
//        bestMatch = mhs.id;
//        namaMatch =
//         mhs.nama.length > 10 ? mhs.nama.slice(0, 10) + ".." : mhs.nama;
//       }
//      });

//      if (bestMatch) {
//       setKehadiran((prev) => ({ ...prev, [bestMatch]: "HADIR" }));
//      }

//      const box = det.detection.box;
//      const x = box.x * scaleX;
//      const y = box.y * scaleY;
//      const w = box.width * scaleX;
//      const h = box.height * scaleY;

//      const isKnown = bestMatch !== null;
//      const color = isKnown ? "#22c55e" : "#ef4444";

//      ctx.strokeStyle = color;
//      ctx.lineWidth = 2;
//      ctx.strokeRect(x, y, w, h);

//      const label = isKnown ? namaMatch : "Unknown";
//      ctx.font = "bold 12px sans-serif";
//      const textWidth = ctx.measureText(label).width;
//      ctx.fillStyle = color;
//      ctx.fillRect(x, y - 24, textWidth + 12, 24);
//      ctx.fillStyle = "#ffffff";
//      ctx.fillText(label, x + 6, y - 7);
//     });
//    } catch (e) {
//     console.error("Deteksi error:", e);
//    }
//   }, 1000);
//  };

//  const handleToggle = (id) => {
//   setKehadiran((prev) => ({
//    ...prev,
//    [id]: prev[id] === "HADIR" ? "ALPA" : "HADIR",
//   }));
//  };

//  const handleSubmit = async () => {
//   if (!sesi) return;
//   setSubmitting(true);
//   try {
//    const payload = Object.entries(kehadiran).map(([mahasiswaId, status]) => ({
//     mahasiswaId,
//     status,
//    }));
//    await api.post(`/presensi/sesi/${sesi.id}/submit`, { kehadiran: payload });
//    showAlert("Kehadiran berhasil disimpan!", "success");
//    if (streamRef.current)
//     streamRef.current.getTracks().forEach((t) => t.stop());
//    if (deteksiIntervalRef.current) clearInterval(deteksiIntervalRef.current);
//    router.push("/riwayat");
//   } catch (err) {
//    showAlert(err.response?.data?.message || "Gagal menyimpan", "error");
//   } finally {
//    setSubmitting(false);
//   }
//  };

//  const totalHadir = Object.values(kehadiran).filter(
//   (s) => s === "HADIR",
//  ).length;
//  const filteredMhs = mahasiswaList.filter((m) =>
//   m.nama.toLowerCase().includes(searchMhs.toLowerCase()),
//  );

//  if (loading) {
//   return (
//    <div className="flex items-center justify-center h-64">
//     <Spinner className="py-8" />
//    </div>
//   );
//  }

//  if (!sesiDibuka) {
//   return (
//    <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md p-8 text-center">
//      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
//       <MonitorCheck color="#5C00F1" />
//      </div>
//      <h2 className="text-xl font-bold text-gray-800 mb-2">
//       Siap Memulai Presensi?
//      </h2>
//      <p className="text-gray-500 text-sm mb-6">
//       Anda akan membuka sesi presensi untuk pertemuan berikut:
//      </p>
//      <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
//       <p>
//        <span className="font-medium text-gray-700">Mata Kuliah:</span>{" "}
//        <span className="text-gray-900">
//         {jadwalInfo?.mataKuliah?.nama || "—"}
//        </span>
//       </p>
//       <p>
//        <span className="font-medium text-gray-700">Kelas:</span>{" "}
//        <span className="text-gray-900">{jadwalInfo?.kelas || "—"}</span>
//       </p>
//       <p>
//        <span className="font-medium text-gray-700">Pertemuan ke-</span>{" "}
//        <span className="text-gray-900">{pertemuanKe}</span>
//       </p>
//       <p>
//        <span className="font-medium text-gray-700">Tipe:</span>{" "}
//        <span
//         className={
//          tipe === "OFFLINE"
//           ? "text-purple-700 font-medium"
//           : "text-blue-700 font-medium"
//         }
//        >
//         {tipe === "OFFLINE" ? "Tatap Muka (Offline)" : "Daring (Online)"}
//        </span>
//       </p>
//      </div>
//      <div className="flex gap-3">
//       <button
//        onClick={handleKembali}
//        className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50"
//       >
//        Kembali
//       </button>
//       <button
//        onClick={handleBukaSesi}
//        className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl"
//       >
//        <Play size={16} strokeWidth={3} color="#fff" />
//        Mulai Sesi Presensi
//       </button>
//      </div>
//     </div>
//    </div>
//   );
//  }

//  return (
//   <div className="flex gap-4" style={{ height: "calc(100vh - 80px)" }}>
//    {/* Kiri */}
//    <div className="flex-1 flex flex-col min-h-0">
//     <div className="flex items-center gap-3 mb-3 shrink-0">
//      <button
//       onClick={handleKembali}
//       className="text-gray-400 hover:text-gray-600 flex items-center justify-center"
//      >
//       <ChevronLeft color="#b2b2b2" />
//      </button>
//      <div>
//       <div className="flex items-center gap-2">
//        <span
//         className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
//          tipe === "OFFLINE"
//           ? "bg-purple-100 text-purple-700"
//           : "bg-blue-100 text-blue-700"
//         }`}
//        >
//         {tipe === "OFFLINE"
//          ? "Mode Tatap Muka (Offline)"
//          : "Mode Daring (Online)"}
//        </span>
//        <span className="text-xs text-gray-400">Pertemuan {pertemuanKe}</span>
//       </div>
//       <h1 className="font-bold text-gray-800">
//        {sesi?.jadwal?.mataKuliah?.nama || jadwalInfo?.mataKuliah?.nama}
//       </h1>
//      </div>
//     </div>

//     {tipe === "OFFLINE" ? (
//      <div className="bg-black rounded-2xl relative overflow-hidden flex-1 min-h-0">
//       {/* Video selalu ada di DOM supaya ref tidak null */}
//       <video
//        ref={videoRef}
//        autoPlay
//        playsInline
//        muted
//        onPlay={handleVideoPlay}
//        className={`w-full h-full object-cover block ${!kameraAktif ? "hidden" : ""}`}
//       />
//       <canvas
//        ref={canvasRef}
//        className={`absolute inset-0 w-full h-full ${!kameraAktif ? "hidden" : ""}`}
//       />

//       {kameraAktif ? (
//        <>
//         <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
//          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
//          <span className="text-white text-xs font-semibold">KAMERA AKTIF</span>
//         </div>
//         {modelLoaded && (
//          <span className="absolute top-3 right-3 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full z-10">
//           face-api.js loaded
//          </span>
//         )}
//        </>
//       ) : (
//        <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
//         {kameraError && (
//          <p className="text-red-400 text-sm px-4 text-center">{kameraError}</p>
//         )}
//         <div>
//          {modelLoaded ? (
//           <p className="text-gray-400 text-sm">Model siap. Aktifkan kamera.</p>
//          ) : (
//           <Spinner className="py-2" />
//          )}
//         </div>
//         {modelLoaded && (
//          <button
//           onClick={startKamera}
//           className="flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl"
//          >
//           <Camera size={18} color="#fff" />
//           Aktifkan Kamera
//          </button>
//         )}
//        </div>
//       )}
//      </div>
//     ) : (
//      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex-1">
//       <div className="flex items-start gap-3">
//        <span className="text-blue-500 text-lg">ℹ</span>
//        <div>
//         <p className="font-semibold text-blue-800 mb-1">
//          Mode Kelas Daring Aktif
//         </p>
//         <p className="text-blue-600 text-sm">
//          Kamera wajah dinonaktifkan. Secara <em>default</em>, semua mahasiswa
//          diarahkan ke status <strong>Hadir</strong>. Silakan ubah saklar menjadi
//          abu-abu (Alpa) untuk mahasiswa yang tidak bergabung di{" "}
//          <em>room meeting</em> Anda.
//         </p>
//        </div>
//       </div>
//      </div>
//     )}
//    </div>

//    {/* Kanan */}
//    <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0">
//     <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
//      <h2 className="font-bold text-gray-800">Daftar Kehadiran</h2>
//      <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
//       {totalHadir}/{mahasiswaList.length} Hadir
//      </span>
//     </div>

//     <div className="p-3 border-b border-gray-100 flex items-center justify-between shrink-0">
//      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
//       <input
//        type="checkbox"
//        checked={pilihSemua}
//        onChange={(e) => handlePilihSemua(e.target.checked)}
//        className="accent-purple-600 w-4 h-4"
//       />
//       Pilih Semua Hadir
//      </label>
//     </div>

//     <div className="p-3 border-b border-gray-100 shrink-0">
//      <input
//       type="text"
//       placeholder="Cari nama mahasiswa..."
//       value={searchMhs}
//       onChange={(e) => setSearchMhs(e.target.value)}
//       className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
//      />
//     </div>

//     <div className="flex-1 overflow-y-auto p-3 space-y-2">
//      {filteredMhs.length === 0 ? (
//       <p className="text-center text-gray-400 text-sm py-8">
//        Tidak ada mahasiswa.
//       </p>
//      ) : (
//       filteredMhs.map((mhs) => (
//        <div
//         key={mhs.id}
//         className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
//        >
//         <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
//          {mhs.nama.slice(0, 2).toUpperCase()}
//         </div>
//         <div className="flex-1 min-w-0">
//          <p className="text-sm font-medium text-gray-700 truncate">
//           {mhs.nama}
//          </p>
//          <p className="text-xs text-gray-400">{mhs.nim}</p>
//         </div>
//         <button
//          onClick={() => handleToggle(mhs.id)}
//          className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 ${
//           kehadiran[mhs.id] === "HADIR" ? "bg-purple-600" : "bg-gray-300"
//          }`}
//         >
//          <span
//           className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
//            kehadiran[mhs.id] === "HADIR" ? "translate-x-5" : "translate-x-0"
//           }`}
//          />
//         </button>
//        </div>
//       ))
//      )}
//     </div>

//     <div className="p-4 border-t border-gray-100 shrink-0">
//      <button
//       onClick={handleSubmit}
//       disabled={submitting || !sesi}
//       className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
//      >
//       {submitting ? (
//        "Menyimpan..."
//       ) : (
//        <>
//         <Check size={16} color="#fff" />
//         <span>Konfirmasi Semua & Simpan</span>
//        </>
//       )}
//      </button>
//     </div>
//    </div>
//    <Alert
//     show={alertInfo.show}
//     message={alertInfo.message}
//     type={alertInfo.type}
//     onClose={() => setAlertInfo((prev) => ({ ...prev, show: false }))}
//    />
//   </div>
//  );
// }

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Camera, Check, Info, Play } from "lucide-react";
import api from "@/lib/axios";
import * as faceapi from "face-api.js";
import Spinner from "@/components/ui/Spinner";
import Alert from "@/components/ui/Alert";

export default function PresensiContent() {
 const router = useRouter();
 const searchParams = useSearchParams();
 const jadwalId = searchParams.get("jadwalId");
 const pertemuanKe = parseInt(searchParams.get("pertemuanKe"));
 const tipe = searchParams.get("tipe");

 const videoRef = useRef(null);
 const canvasRef = useRef(null);
 const streamRef = useRef(null);
 const deteksiIntervalRef = useRef(null);

 const [jadwalInfo, setJadwalInfo] = useState(null);
 const [mahasiswaList, setMahasiswaList] = useState([]);
 const [kehadiran, setKehadiran] = useState({});
 const [modelLoaded, setModelLoaded] = useState(false);
 const [kameraAktif, setKameraAktif] = useState(false);
 const [loading, setLoading] = useState(true);
 const [submitting, setSubmitting] = useState(false);
 const [searchMhs, setSearchMhs] = useState("");
 const [kameraError, setKameraError] = useState("");
 const [pilihSemua, setPilihSemua] = useState(false);
 const [siapMulai, setSiapMulai] = useState(false);
 const [alertInfo, setAlertInfo] = useState({
  show: false,
  message: "",
  type: "info",
 });

 const showAlert = (message, type = "info") =>
  setAlertInfo({ show: true, message, type });

 // Cleanup
 useEffect(() => {
  return () => {
   if (deteksiIntervalRef.current) clearInterval(deteksiIntervalRef.current);
   if (streamRef.current)
    streamRef.current.getTracks().forEach((t) => t.stop());
  };
 }, []);

 useEffect(() => {
  if (!jadwalId || !pertemuanKe || !tipe) {
   router.push("/beranda");
   return;
  }
  fetchJadwalInfo();
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 // Set srcObject saat kamera aktif
 useEffect(() => {
  if (!kameraAktif || !streamRef.current || !videoRef.current) return;
  const video = videoRef.current;
  video.srcObject = streamRef.current;
  video.play().catch(() => setKameraError("Browser memblokir autoplay."));
 }, [kameraAktif]);

 const fetchJadwalInfo = async () => {
  try {
   const res = await api.get(`/jadwal/${jadwalId}`);
   setJadwalInfo(res.data);
   const mhsList = res.data.mahasiswa || [];
   setMahasiswaList(mhsList);
   const defaultKehadiran = {};
   mhsList.forEach((m) => {
    defaultKehadiran[m.id] = tipe === "ONLINE" ? "HADIR" : "ALPA";
   });
   setKehadiran(defaultKehadiran);
  } catch (err) {
   showAlert("Gagal memuat data jadwal", "error");
   router.push("/beranda");
  } finally {
   setLoading(false);
  }
 };

 // Load model face-api
 useEffect(() => {
  if (tipe !== "OFFLINE" || !siapMulai) return;
  const loadModels = async () => {
   try {
    const MODEL_URL = "/models";
    await Promise.all([
     faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
     faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
     faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
    ]);
    setModelLoaded(true);
   } catch (e) {
    showAlert("Gagal memuat model face-api.js", "error");
   }
  };
  loadModels();
 }, [tipe, siapMulai]);

 const handleVideoPlay = useCallback(() => {
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;
  const updateSize = () => {
   canvas.width = video.clientWidth;
   canvas.height = video.clientHeight;
  };
  updateSize();
  const observer = new ResizeObserver(updateSize);
  observer.observe(video);
  return () => observer.disconnect();
 }, []);

 const startKamera = async () => {
  setKameraError("");
  try {
   const stream = await navigator.mediaDevices.getUserMedia({
    video: {
     facingMode: "user",
     width: { ideal: 640 },
     height: { ideal: 480 },
    },
   });
   streamRef.current = stream;
   setKameraAktif(true);
   startDeteksi();
  } catch {
   setKameraError("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
  }
 };

 const startDeteksi = () => {
  if (deteksiIntervalRef.current) clearInterval(deteksiIntervalRef.current);
  deteksiIntervalRef.current = setInterval(async () => {
   const video = videoRef.current;
   const canvas = canvasRef.current;
   if (!video || !canvas || video.paused || video.ended || video.readyState < 2)
    return;

   try {
    const detections = await faceapi
     .detectAllFaces(
      video,
      new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
     )
     .withFaceLandmarks()
     .withFaceDescriptors();

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = canvas.width / (video.videoWidth || canvas.width);
    const scaleY = canvas.height / (video.videoHeight || canvas.height);

    detections.forEach((det) => {
     let bestMatch = null;
     let bestDistance = 0.5;
     let namaMatch = "Unknown";

     mahasiswaList.forEach((mhs) => {
      if (!mhs.faceDescriptor || mhs.faceDescriptor.length === 0) return;
      const descriptor = new Float32Array(mhs.faceDescriptor);
      const distance = faceapi.euclideanDistance(det.descriptor, descriptor);
      if (distance < bestDistance) {
       bestDistance = distance;
       bestMatch = mhs.id;
       namaMatch =
        mhs.nama.length > 10 ? mhs.nama.slice(0, 10) + ".." : mhs.nama;
      }
     });

     if (bestMatch) setKehadiran((prev) => ({ ...prev, [bestMatch]: "HADIR" }));

     const box = det.detection.box;
     const x = box.x * scaleX,
      y = box.y * scaleY;
     const w = box.width * scaleX,
      h = box.height * scaleY;
     const isKnown = bestMatch !== null;
     const color = isKnown ? "#22c55e" : "#ef4444";

     ctx.strokeStyle = color;
     ctx.lineWidth = 2;
     ctx.strokeRect(x, y, w, h);

     const label = isKnown ? namaMatch : "Unknown";
     ctx.font = "bold 12px sans-serif";
     const textWidth = ctx.measureText(label).width;
     ctx.fillStyle = color;
     ctx.fillRect(x, y - 24, textWidth + 12, 24);
     ctx.fillStyle = "#ffffff";
     ctx.fillText(label, x + 6, y - 7);
    });
   } catch (e) {
    console.error("Deteksi error:", e);
   }
  }, 1000);
 };

 const handleToggle = (id) => {
  setKehadiran((prev) => ({
   ...prev,
   [id]: prev[id] === "HADIR" ? "ALPA" : "HADIR",
  }));
 };

 const handlePilihSemua = (checked) => {
  setPilihSemua(checked);
  const updated = {};
  mahasiswaList.forEach((m) => {
   updated[m.id] = checked ? "HADIR" : "ALPA";
  });
  setKehadiran(updated);
 };

 const handleKembali = () => {
  if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
  if (deteksiIntervalRef.current) clearInterval(deteksiIntervalRef.current);
  router.push("/beranda");
 };

 const handleSubmit = async () => {
  setSubmitting(true);
  try {
   const payload = Object.entries(kehadiran).map(([mahasiswaId, status]) => ({
    mahasiswaId,
    status,
   }));
   await api.post("/presensi/submit", {
    jadwalId,
    pertemuanKe,
    tipeKelas: tipe,
    kehadiran: payload,
   });
   showAlert("Kehadiran berhasil disimpan!", "success");
   if (streamRef.current)
    streamRef.current.getTracks().forEach((t) => t.stop());
   if (deteksiIntervalRef.current) clearInterval(deteksiIntervalRef.current);
   setTimeout(() => router.push("/riwayat"), 1500);
  } catch (err) {
   showAlert(err.response?.data?.message || "Gagal menyimpan", "error");
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

 if (loading) return <Spinner className="py-16" />;

 if (!siapMulai) {
  return (
   <div className="flex items-center justify-center min-h-[calc(100vh-80px)]">
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm w-full max-w-md p-8 text-center">
     <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-2xl">📋</span>
     </div>
     <h2 className="text-xl font-bold text-gray-800 mb-2">
      Siap Memulai Presensi?
     </h2>
     <p className="text-gray-500 text-sm mb-6">
      Anda akan membuka sesi presensi untuk pertemuan berikut:
     </p>
     <div className="bg-gray-50 rounded-xl p-4 text-left text-sm space-y-2 mb-6">
      <p>
       <span className="font-medium text-gray-700">Mata Kuliah:</span>{" "}
       <span className="text-gray-900">
        {jadwalInfo?.mataKuliah?.nama || "—"}
       </span>
      </p>
      <p>
       <span className="font-medium text-gray-700">Kelas:</span>{" "}
       <span className="text-gray-900">{jadwalInfo?.kelas || "—"}</span>
      </p>
      <p>
       <span className="font-medium text-gray-700">Pertemuan ke-</span>{" "}
       <span className="text-gray-900">{pertemuanKe}</span>
      </p>
      <p>
       <span className="font-medium text-gray-700">Tipe:</span>{" "}
       <span
        className={
         tipe === "OFFLINE"
          ? "text-purple-700 font-medium"
          : "text-blue-700 font-medium"
        }
       >
        {tipe === "OFFLINE" ? "Tatap Muka (Offline)" : "Daring (Online)"}
       </span>
      </p>
     </div>
     <div className="flex gap-3">
      <button
       onClick={handleKembali}
       className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-xl hover:bg-gray-50 flex items-center justify-center gap-2"
      >
       <ArrowLeft size={16} /> Kembali
      </button>
      <button
       onClick={() => setSiapMulai(true)}
       className="flex-1 flex items-center justify-center gap-1.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl"
      >
       <Play size={16} strokeWidth={3} color="#fff" />
       Mulai Sesi Presensi
      </button>
     </div>
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

 return (
  <div className="flex gap-4" style={{ height: "calc(100vh - 80px)" }}>
   {/* Kiri */}
   <div className="flex-1 flex flex-col min-h-0">
    <div className="flex items-center gap-3 mb-3 shrink-0">
     <button
      onClick={handleKembali}
      className="text-gray-400 hover:text-gray-600"
     >
      <ArrowLeft size={20} />
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
       {jadwalInfo?.mataKuliah?.nama}
      </h1>
     </div>
    </div>

    {tipe === "OFFLINE" ? (
     <div className="bg-black rounded-2xl relative overflow-hidden flex-1 min-h-0">
      <video
       ref={videoRef}
       autoPlay
       playsInline
       muted
       onPlay={handleVideoPlay}
       className={`w-full h-full object-cover block ${!kameraAktif ? "hidden" : ""}`}
      />
      <canvas
       ref={canvasRef}
       className={`absolute inset-0 w-full h-full ${!kameraAktif ? "hidden" : ""}`}
      />
      {kameraAktif ? (
       <>
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
         <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
         <span className="text-white text-xs font-semibold">KAMERA AKTIF</span>
        </div>
        {modelLoaded && (
         <span className="absolute top-3 right-3 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full z-10">
          face-api.js loaded
         </span>
        )}
       </>
      ) : (
       <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
        {kameraError && (
         <p className="text-red-400 text-sm px-4 text-center">{kameraError}</p>
        )}
        <p className="text-gray-400 text-sm">
         {modelLoaded
          ? "Model siap. Aktifkan kamera."
          : "Memuat model face-api.js..."}
        </p>
        {modelLoaded && (
         <button
          onClick={startKamera}
          className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl flex items-center gap-2"
         >
          <Camera size={16} /> Aktifkan Kamera
         </button>
        )}
       </div>
      )}
     </div>
    ) : (
     <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex-1">
      <div className="flex items-start gap-3">
       <Info size={20} className="text-blue-500 shrink-0 mt-0.5" />
       <div>
        <p className="font-semibold text-blue-800 mb-1">
         Mode Kelas Daring Aktif
        </p>
        <p className="text-blue-600 text-sm">
         Kamera wajah dinonaktifkan. Secara <em>default</em>, semua mahasiswa
         diarahkan ke status <strong>Hadir</strong>. Silakan ubah saklar menjadi
         abu-abu (Alpa) untuk mahasiswa yang tidak bergabung.
        </p>
       </div>
      </div>
     </div>
    )}
   </div>

   {/* Kanan */}
   <div className="w-80 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col min-h-0">
    <div className="p-4 border-b border-gray-100 flex items-center justify-between shrink-0">
     <h2 className="font-bold text-gray-800">Daftar Kehadiran</h2>
     <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">
      {totalHadir}/{mahasiswaList.length} Hadir
     </span>
    </div>

    <div className="p-3 border-b border-gray-100 shrink-0 space-y-2">
     <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
      <input
       type="checkbox"
       checked={pilihSemua}
       onChange={(e) => handlePilihSemua(e.target.checked)}
       className="accent-purple-600 w-4 h-4 cursor-pointer"
      />
      Pilih Semua Hadir
     </label>
     <input
      type="text"
      placeholder="Cari nama mahasiswa..."
      value={searchMhs}
      onChange={(e) => setSearchMhs(e.target.value)}
      className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
     />
    </div>

    <div className="flex-1 overflow-y-auto p-3 space-y-2">
     {filteredMhs.length === 0 ? (
      <p className="text-center text-gray-400 text-sm py-8">
       Tidak ada mahasiswa.
      </p>
     ) : (
      filteredMhs.map((mhs) => (
       <div
        key={mhs.id}
        className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:bg-gray-50"
       >
        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center text-purple-700 text-xs font-bold shrink-0">
         {mhs.nama.slice(0, 2).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
         <p className="text-sm font-medium text-gray-700 truncate">
          {mhs.nama}
         </p>
         <p className="text-xs text-gray-400">{mhs.nim}</p>
        </div>
        <button
         onClick={() => handleToggle(mhs.id)}
         className={`relative w-11 h-6 rounded-full transition-all duration-200 shrink-0 ${
          kehadiran[mhs.id] === "HADIR" ? "bg-purple-600" : "bg-gray-300"
         }`}
        >
         <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
           kehadiran[mhs.id] === "HADIR" ? "translate-x-5" : "translate-x-0"
          }`}
         />
        </button>
       </div>
      ))
     )}
    </div>

    <div className="p-4 border-t border-gray-100 shrink-0">
     <button
      onClick={handleSubmit}
      disabled={submitting}
      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors"
     >
      {submitting ? (
       "Menyimpan..."
      ) : (
       <>
        <Check size={16} color="#fff" />
        <span>Konfirmasi Semua & Simpan</span>
       </>
      )}
     </button>
    </div>
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

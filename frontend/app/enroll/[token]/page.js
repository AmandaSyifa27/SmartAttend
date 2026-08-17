"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import * as faceapi from "face-api.js";
import axios from "axios";
import { BadgeCheck, Camera, ScanFace, TriangleAlert, X } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function EnrollPage() {
 const { token } = useParams();

 const [step, setStep] = useState("loading");

 const [mahasiswa, setMahasiswa] = useState(null);
 const [errorMsg, setErrorMsg] = useState("");
 const [consentChecked, setConsentChecked] = useState(false);
 const [modelLoaded, setModelLoaded] = useState(false);
 const [kameraAktif, setKameraAktif] = useState(false);
 const [kameraError, setKameraError] = useState("");
 const [samples, setSamples] = useState([]);
 const [capturing, setCapturing] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [statusText, setStatusText] = useState("");

 const videoRef = useRef(null);
 const streamRef = useRef(null);
 const TOTAL_SAMPLE = 5;

 useEffect(() => {
  const verifyToken = async () => {
   try {
    const res = await axios.get(`${API_URL}/mahasiswa/enroll/${token}`);
    setMahasiswa(res.data);
    setStep("consent");
   } catch (err) {
    setErrorMsg(
     err.response?.data?.message || "Link tidak valid atau sudah kedaluwarsa",
    );
    setStep("error");
   }
  };
  verifyToken();
 }, [token]);

 useEffect(() => {
  if (!kameraAktif || !streamRef.current || !videoRef.current) return;
  const video = videoRef.current;
  video.srcObject = streamRef.current;
  video.play().catch(() => setKameraError("Browser memblokir kamera."));
 }, [kameraAktif]);

 useEffect(() => {
  return () => {
   if (streamRef.current)
    streamRef.current.getTracks().forEach((t) => t.stop());
  };
 }, []);

 const handleSetujui = async () => {
  if (!consentChecked) return;
  setStep("camera");
  setStatusText("Memuat model pengenalan wajah...");

  try {
   const MODEL_URL = "/models";
   await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
   ]);
   setModelLoaded(true);
   setStatusText("Model siap. Aktifkan kamera untuk memulai.");
  } catch {
   setStatusText("Gagal memuat model. Coba refresh halaman.");
  }
 };

 const startKamera = async () => {
  setKameraError("");
  try {
   const stream = await navigator.mediaDevices.getUserMedia({
    video: {
     facingMode: "user",
     width: { ideal: 1280 },
     height: { ideal: 720 },
    },
   });
   streamRef.current = stream;
   setKameraAktif(true);
   setStatusText("Kamera aktif. Posisikan wajah Anda di dalam frame.");
  } catch {
   setKameraError(
    "Gagal mengakses kamera. Pastikan izin kamera sudah diberikan.",
   );
  }
 };

 const ambilSampel = async () => {
  if (!videoRef.current || capturing) return;
  setCapturing(true);
  setStatusText("Mendeteksi wajah...");

  try {
   const detection = await faceapi
    .detectSingleFace(
     videoRef.current,
     new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

   if (!detection) {
    setStatusText(
     "Wajah tidak terdeteksi. Pastikan wajah Anda terlihat jelas.",
    );
    setCapturing(false);
    return;
   }

   const newSamples = [...samples, Array.from(detection.descriptor)];
   setSamples(newSamples);

   if (newSamples.length < TOTAL_SAMPLE) {
    setStatusText(
     `Sampel ${newSamples.length}/${TOTAL_SAMPLE} berhasil. Tetap posisikan wajah Anda.`,
    );
    setCapturing(false);
   } else {
    setStatusText("Semua sampel terkumpul. Menyimpan data wajah...");
    await simpanDescriptor(newSamples);
   }
  } catch {
   setStatusText("Terjadi kesalahan. Coba lagi.");
   setCapturing(false);
  }
 };

 const simpanDescriptor = async (allSamples) => {
  setSubmitting(true);
  try {
   const avg = allSamples[0].map(
    (_, i) => allSamples.reduce((sum, s) => sum + s[i], 0) / allSamples.length,
   );

   await axios.post(`${API_URL}/mahasiswa/enroll/${token}`, {
    faceDescriptor: avg,
   });

   if (streamRef.current)
    streamRef.current.getTracks().forEach((t) => t.stop());
   setStep("success");
  } catch (err) {
   setStatusText(err.response?.data?.message || "Gagal menyimpan. Coba lagi.");
   setSubmitting(false);
   setCapturing(false);
  }
 };

 if (step === "loading") {
  return (
   <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="text-center">
     <div className="w-10 h-10 border-2 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
     <p className="text-gray-500 text-sm">Memverifikasi link...</p>
    </div>
   </div>
  );
 }

 if (step === "error") {
  return (
   <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-6 text-center">
     <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-3xl">
       <X size={40} className="text-red-600" />
      </span>
     </div>
     <h2 className="font-bold text-gray-800 text-lg mb-2">Link Tidak Valid</h2>
     <p className="text-gray-500 text-sm mb-4">{errorMsg}</p>
     <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-left">
      <p className="text-orange-700 text-sm font-semibold mb-1">
       Apa yang harus dilakukan?
      </p>
      <p className="text-orange-600 text-xs">
       Jika anda tidak merasa telah melakukan pendaftaran wajah, <br />
       Hubungi admin Program Studi Teknik Informatika UCIC untuk mendapatkan
       link enrollment baru.
      </p>
     </div>
    </div>
   </div>
  );
 }

 if (step === "consent") {
  return (
   <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-6">
     <div className="text-center mb-6">
      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
       <span className="text-3xl">
        <ScanFace size={40} color="#5C00F1" strokeWidth={2.25} />
       </span>
      </div>
      <h1 className="font-bold text-gray-800 text-xl">Pendaftaran Wajah</h1>
      <p className="text-gray-500 text-sm mt-1">SmartAttend — UCIC</p>
     </div>

     <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-4">
      <p className="text-xs text-purple-600 font-semibold mb-2">DATA ANDA</p>
      <p className="font-bold text-gray-800">{mahasiswa?.nama}</p>
      <p className="text-gray-500 text-sm">
       {mahasiswa?.nim} · {mahasiswa?.prodi}
      </p>
     </div>

     <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
      <div className="flex items-center gap-2 text-orange-700 text-sm font-semibold mb-2">
       <TriangleAlert size={18} className="shrink-0" />
       <h3>Perhatian Penting</h3>
      </div>

      <p className="text-orange-600 text-xs leading-relaxed">
       Pastikan Anda adalah mahasiswa dengan nama dan NIM di atas. Link ini
       bersifat pribadi dan tidak boleh dibagikan kepada siapapun.
       Penyalahgunaan link ini dapat mempengaruhi data kehadiran Anda.
      </p>
     </div>

     <div className="bg-gray-50 rounded-xl p-4 mb-5">
      <p className="text-gray-700 text-sm font-semibold mb-2">
       Persetujuan Data Biometrik
      </p>
      <p className="text-gray-500 text-xs leading-relaxed mb-3">
       Dengan mendaftarkan wajah Anda, Anda menyetujui bahwa data biometrik
       wajah Anda akan disimpan dan digunakan oleh sistem SmartAttend
       semata-mata untuk keperluan pencatatan kehadiran perkuliahan di Program
       Studi Teknik Informatika UCIC.
      </p>
      <label className="flex items-start gap-3 cursor-pointer">
       <input
        type="checkbox"
        checked={consentChecked}
        onChange={(e) => setConsentChecked(e.target.checked)}
        className="accent-purple-600 w-4 h-4 mt-0.5 shrink-0 cursor-pointer"
       />
       <span className="text-gray-700 text-xs leading-relaxed">
        Saya menyatakan bahwa saya adalah <strong>{mahasiswa?.nama}</strong>{" "}
        dengan NIM <strong>{mahasiswa?.nim}</strong>, dan saya menyetujui
        penggunaan data biometrik wajah saya untuk keperluan presensi.
       </span>
      </label>
     </div>

     <button
      onClick={handleSetujui}
      disabled={!consentChecked}
      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl text-sm transition-colors"
     >
      Setuju & Lanjutkan
     </button>
    </div>
   </div>
  );
 }

 if (step === "camera") {
  return (
   <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
    <div className="bg-gray-900 rounded-2xl overflow-hidden w-full max-w-md shadow-xl">
     <div className="px-4 py-4 flex items-center gap-3 border-b border-gray-800">
      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
       {mahasiswa?.nama?.charAt(0)}
      </div>
      <div>
       <p className="text-white text-sm font-semibold">{mahasiswa?.nama}</p>
       <p className="text-gray-400 text-xs">{mahasiswa?.nim}</p>
      </div>
     </div>

     <div className="relative bg-black" style={{ aspectRatio: "4/3" }}>
      {/* <div className="relative bg-black" style={{ aspectRatio: "3/4" }}> */}
      <video
       ref={videoRef}
       autoPlay
       playsInline
       muted
       className={`w-full h-full object-cover ${!kameraAktif ? "hidden" : ""}`}
      />

      {kameraAktif && (
       <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 border-2 border-white/50 rounded-full" />
       </div>
      )}

      {kameraAktif && (
       <div className="absolute bottom-3 left-3 right-3">
        <div className="bg-black/60 rounded-xl px-4 py-2">
         <p className="text-white text-xs text-center">{statusText}</p>
        </div>
       </div>
      )}

      {!kameraAktif && (
       <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
        {kameraError && (
         <div className="bg-red-900/80 rounded-xl px-4 py-3 w-full">
          <p className="text-red-300 text-sm text-center">{kameraError}</p>
         </div>
        )}
        <p className="text-gray-400 text-sm text-center">{statusText}</p>
        {modelLoaded && (
         <button
          onClick={startKamera}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-xl text-sm"
         >
          Aktifkan Kamera
         </button>
        )}
        {!modelLoaded && (
         <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Memuat model...</p>
         </div>
        )}
       </div>
      )}
     </div>

     <div className="px-4 py-5">
      <div className="flex gap-2 mb-3">
       {Array.from({ length: TOTAL_SAMPLE }).map((_, i) => (
        <div
         key={i}
         className={`flex-1 h-2 rounded-full transition-colors ${
          i < samples.length ? "bg-purple-500" : "bg-gray-700"
         }`}
        />
       ))}
      </div>
      <p className="text-gray-400 text-xs text-center mb-4">
       {samples.length}/{TOTAL_SAMPLE} sampel wajah terkumpul
      </p>
      <button
       onClick={ambilSampel}
       disabled={
        !kameraAktif ||
        capturing ||
        submitting ||
        samples.length >= TOTAL_SAMPLE
       }
       className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl text-sm transition-colors"
      >
       {submitting
        ? "Menyimpan..."
        : capturing
          ? "Mendeteksi..."
          : samples.length >= TOTAL_SAMPLE
            ? "Menyimpan..."
            : `Ambil Sampel (${samples.length}/${TOTAL_SAMPLE})`}
      </button>
     </div>
    </div>
   </div>
  );
 }

 if (step === "success") {
  return (
   <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-6 text-center">
     <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <span className="text-4xl">
       <BadgeCheck size={40} color="#4ddb43" />
      </span>
     </div>
     <h2 className="font-bold text-gray-800 text-xl mb-2">
      Pendaftaran Berhasil!
     </h2>
     <p className="text-gray-500 text-sm mb-6">
      Data wajah Anda telah berhasil didaftarkan. Mulai sekarang, kehadiran Anda
      akan dicatat secara otomatis melalui sistem pengenalan wajah SmartAttend.
     </p>
     <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-left mb-4">
      <p className="font-bold text-gray-800">{mahasiswa?.nama}</p>
      <p className="text-gray-500 text-sm">
       {mahasiswa?.nim} · {mahasiswa?.prodi}
      </p>
     </div>
     <p className="text-gray-400 text-xs">
      Halaman ini dapat ditutup. Tidak diperlukan tindakan lebih lanjut.
     </p>
    </div>
   </div>
  );
 }
}

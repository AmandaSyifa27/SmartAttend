"use client";

import { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import api from "@/lib/axios";
import { Camera, Clapperboard } from "lucide-react";
import Spinner from "../ui/Spinner";

export default function ModalEnrollWajah({ mahasiswa, onClose, onSuccess }) {
 const videoRef = useRef(null);
 const streamRef = useRef(null);
 const [modelLoaded, setModelLoaded] = useState(false);
 const [kameraAktif, setKameraAktif] = useState(false);
 const [capturing, setCapturing] = useState(false);
 const [samples, setSamples] = useState([]);
 const [status, setStatus] = useState("Memuat model...");
 const TOTAL_SAMPLE = 5;

 useEffect(() => {
  const loadModels = async () => {
   const MODEL_URL = "/models";
   await Promise.all([
    faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
   ]);
   setModelLoaded(true);
   setStatus("Model siap. Aktifkan kamera.");
  };
  loadModels();
 }, []);

 // Cleanup: matikan kamera saat komponen unmount
 useEffect(() => {
  return () => {
   if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
   }
  };
 }, []);

 const stopKamera = () => {
  if (streamRef.current) {
   streamRef.current.getTracks().forEach((track) => track.stop());
   streamRef.current = null;
  }
  if (videoRef.current) {
   videoRef.current.srcObject = null;
  }
  setKameraAktif(false);
 };

 const handleClose = () => {
  stopKamera();
  onClose();
 };

 const startKamera = async () => {
  try {
   const stream = await navigator.mediaDevices.getUserMedia({ video: true });
   streamRef.current = stream;
   videoRef.current.srcObject = stream;
   setKameraAktif(true);
   setStatus('Kamera aktif. Tekan "Ambil Sampel Wajah".');
  } catch {
   setStatus("Gagal mengakses kamera.");
  }
 };

 const ambilSampel = async () => {
  if (!videoRef.current || capturing) return;
  setCapturing(true);
  setStatus("Mendeteksi wajah...");

  try {
   const detection = await faceapi
    .detectSingleFace(
     videoRef.current,
     new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }),
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

   if (!detection) {
    setStatus("Wajah tidak terdeteksi. Coba lagi.");
    setCapturing(false);
    return;
   }

   const newSamples = [...samples, Array.from(detection.descriptor)];
   setSamples(newSamples);
   setStatus(`Sampel ${newSamples.length}/${TOTAL_SAMPLE} berhasil diambil.`);

   if (newSamples.length >= TOTAL_SAMPLE) {
    setStatus("Semua sampel terkumpul. Menyimpan...");
    await simpanDescriptor(newSamples);
   }
  } catch {
   setStatus("Error saat deteksi. Coba lagi.");
  } finally {
   setCapturing(false);
  }
 };

 const simpanDescriptor = async (allSamples) => {
  // Rata-rata dari semua sampel untuk descriptor yang lebih akurat
  const avg = allSamples[0].map(
   (_, i) => allSamples.reduce((sum, s) => sum + s[i], 0) / allSamples.length,
  );

  try {
   await api.post(`/mahasiswa/${mahasiswa.id}/enroll-face`, {
    faceDescriptor: avg,
   });
   setStatus("✅ Enrollment berhasil!");
   setTimeout(() => {
    stopKamera();
    onSuccess();
    onClose();
   }, 1500);
  } catch (err) {
   setStatus(
    "Gagal menyimpan: " + (err.response?.data?.message || "Server error"),
   );
  }
 };

 return (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
   <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6">
    <div className="flex items-center justify-between mb-4">
     <div>
      <h2 className="font-bold text-gray-800 text-lg">Rekam Wajah Mahasiswa</h2>
      <p className="text-sm text-gray-500">
       {mahasiswa.nama} — {mahasiswa.nim}
      </p>
     </div>
     <button
      onClick={handleClose}
      className="text-gray-400 hover:text-gray-600 text-xl"
     >
      ✕
     </button>
    </div>

    {/* Video */}
    <div
     className="bg-black rounded-xl overflow-hidden mb-4 relative"
     style={{ height: 280 }}
    >
     <video
      ref={videoRef}
      autoPlay
      muted
      className="w-full h-full object-cover"
     />
     {!kameraAktif && (
      <div className="absolute inset-0 flex items-center justify-center">
       <p className="text-gray-400 text-sm">{status}</p>
      </div>
     )}
     {kameraAktif && (
      <div className="absolute bottom-3 left-3 right-3">
       <div className="bg-black/60 rounded-lg px-3 py-1.5">
        <p className="text-white text-xs text-center">{status}</p>
       </div>
      </div>
     )}
    </div>

    {/* Progress sampel */}
    <div className="flex gap-2 mb-4">
     {Array.from({ length: TOTAL_SAMPLE }).map((_, i) => (
      <div
       key={i}
       className={`flex-1 h-2 rounded-full ${
        i < samples.length ? "bg-purple-600" : "bg-gray-200"
       }`}
      />
     ))}
    </div>
    <p className="text-xs text-gray-500 text-center mb-4">
     {samples.length}/{TOTAL_SAMPLE} sampel terkumpul
    </p>

    {/* Tombol */}
    <div className="flex gap-3">
     <button
      onClick={handleClose}
      className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50"
     >
      Batal
     </button>
     {!kameraAktif ? (
      <button
       onClick={startKamera}
       disabled={!modelLoaded}
       className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg"
      >
       {modelLoaded ? (
        <>
         <Camera size={18} color="#fff" strokeWidth={2.5} /> Aktifkan Kamera
        </>
       ) : (
        <>
         <Spinner className="py-2" />
         "Memuat Model"
        </>
       )}
      </button>
     ) : (
      <button
       onClick={ambilSampel}
       disabled={capturing || samples.length >= TOTAL_SAMPLE}
       className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-lg"
      >
       {capturing ? (
        "Mendeteksi..."
       ) : (
        <>
         <Clapperboard size={18} strokeWidth={2.5} /> Ambil Sampel (
         {samples.length}/{TOTAL_SAMPLE})
        </>
       )}
      </button>
     )}
    </div>
   </div>
  </div>
 );
}

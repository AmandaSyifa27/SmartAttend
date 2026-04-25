"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function DosenLayout({ children }) {
 const router = useRouter();
 const pathname = usePathname();
 const [user, setUser] = useState(null);
 const [tahunAjaran, setTahunAjaran] = useState(null);

 useEffect(() => {
  const userData = Cookies.get("user");
  const token = Cookies.get("token");

  if (!userData || !token) {
   router.push("/login");
   return;
  }

  const parsed = JSON.parse(userData);

  if (parsed.role !== "dosen") {
   router.push("/login");
   return;
  }

  // Set user segera agar UI tidak menunggu fetch tahun ajaran
  setUser(parsed);

  fetch("http://localhost:5000/api/tahun-ajaran", {
   headers: { Authorization: `Bearer ${token}` },
  })
   .then((res) => res.json())
   .then((data) => {
    const aktif = data.find((ta) => ta.isAktif);
    setTahunAjaran(aktif);
   })
   .catch((err) => {
    console.error("Gagal mengambil tahun ajaran:", err);
    // Tidak redirect — user tetap bisa akses halaman meski data TA gagal di-load
   });
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleLogout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
  router.push("/login");
 };

 const menuItems = [
  { href: "/beranda", label: "Beranda", icon: "🏠" },
  { href: "/riwayat", label: "Riwayat Kehadiran", icon: "📋" },
  { href: "/pengaturan", label: "Pengaturan", icon: "⚙️" },
 ];

 return (
  <div className="flex min-h-screen bg-gray-50">
   {/* Sidebar */}
   <aside className="w-56 bg-gray-900 text-white flex flex-col fixed h-full">
    <div className="px-5 py-5 border-b border-gray-700">
     <span className="font-bold text-lg text-purple-400">FaceAttend</span>
    </div>

    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
     {menuItems.map((item) => (
      <Link
       key={item.href}
       href={item.href}
       className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
        pathname === item.href
         ? "bg-purple-600 text-white font-semibold"
         : "text-gray-400 hover:bg-gray-800 hover:text-white"
       }`}
      >
       <span>{item.icon}</span>
       {item.label}
      </Link>
     ))}
    </nav>

    <div className="px-3 py-4 border-t border-gray-700">
     <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 w-full"
     >
      <span>→</span> Keluar
     </button>
    </div>
   </aside>

   {/* Main */}
   <div className="flex-1 ml-56 flex flex-col">
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
     <div>
      {tahunAjaran && (
       <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
        Tahun Ajaran Aktif: {tahunAjaran.nama}
       </span>
      )}
     </div>
     <div className="flex items-center gap-3">
      <div className="text-right">
       <p className="text-sm font-semibold text-gray-800">{user?.nama}</p>
       <p className="text-xs text-gray-400">Dosen Pengampu</p>
      </div>
      <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
       {user?.nama?.slice(0, 2).toUpperCase()}
      </div>
     </div>
    </header>

    <main className="flex-1 p-6">{children}</main>
   </div>
  </div>
 );
}

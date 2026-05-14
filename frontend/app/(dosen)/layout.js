"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";
import {
 ClipboardList,
 HomeIcon,
 LogOut,
 Menu,
 Settings,
 X,
} from "lucide-react";

export default function DosenLayout({ children }) {
 const router = useRouter();
 const pathname = usePathname();
 const [user, setUser] = useState(null);
 const [tahunAjaran, setTahunAjaran] = useState(null);
 const [sidebarOpen, setSidebarOpen] = useState(true);
 const [mounted, setMounted] = useState(false);

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

  setUser(parsed);
  setMounted(true);

  fetch("http://localhost:5000/api/tahun-ajaran", {
   headers: { Authorization: `Bearer ${token}` },
  })
   .then((res) => res.json())
   .then((data) => {
    const aktif = data.find((ta) => ta.isAktif);
    setTahunAjaran(aktif);
   })
   .catch((err) => console.error("Gagal load TA:", err));
 }, [router]);

 const handleLogout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
  router.push("/login");
 };

 const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length > 1
   ? (parts[0][0] + parts[1][0]).toUpperCase()
   : name.substring(0, 2).toUpperCase();
 };

 const menuItems = [
  { href: "/beranda", label: "Beranda", icon: HomeIcon },
  { href: "/riwayat", label: "Riwayat Kehadiran", icon: ClipboardList },
  { href: "/pengaturan-dosen", label: "Pengaturan", icon: Settings },
 ];

 if (!mounted) return null;

 return (
  <div className="flex min-h-screen bg-gray-50">
   {/* SIDEBAR: Berdiri sendiri di kiri */}
   <aside
    className={`${sidebarOpen ? "w-56" : "w-16"} bg-gray-900 text-white flex flex-col fixed h-full transition-all duration-300 z-20`}
   >
    <div
     className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} px-4 py-4 border-b border-gray-700`}
    >
     {sidebarOpen && (
      <span className="font-bold text-purple-400 text-lg">Dosen</span>
     )}
     <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
     >
      {sidebarOpen ? (
       <X className="h-6 w-6 text-gray-300" />
      ) : (
       <Menu className="h-6 w-6 text-gray-300" />
      )}
     </button>
    </div>

    <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-4">
     {menuItems.map((item) => (
      <Link
       key={item.href}
       href={item.href}
       className={`flex items-center ${sidebarOpen ? "gap-3 px-4" : "justify-center px-0"} py-2 rounded-lg transition-colors mb-1 ${
        pathname === item.href
         ? "bg-purple-600 text-white shadow-lg shadow-purple-900/20"
         : "text-gray-400 hover:bg-gray-800 hover:text-white"
       }`}
      >
       <item.icon size={18} className="shrink-0" />
       {sidebarOpen && <span className="font-medium">{item.label}</span>}
      </Link>
     ))}
    </nav>

    <div className="px-2 py-4 border-t border-gray-700">
     <button
      onClick={handleLogout}
      className={`flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center"} py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 w-full transition-colors`}
     >
      <LogOut size={18} className="shrink-0" />
      {sidebarOpen && <span>Keluar</span>}
     </button>
    </div>
   </aside>

   {/* CONTENT AREA: Memiliki margin-left sesuai lebar sidebar */}
   <div
    className={`flex-1 min-w-0 ${sidebarOpen ? "ml-56" : "ml-16"} flex flex-col transition-all duration-300 overflow-hidden`}
   >
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-20">
     <div>
      {tahunAjaran && (
       <div className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-100 flex items-center gap-2">
        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
        TA: {tahunAjaran.nama}
       </div>
      )}
     </div>
     <div className="flex items-center gap-4">
      <div className="text-right hidden sm:block">
       <p className="text-sm font-bold text-gray-800 leading-none">
        {user?.nama}
       </p>
       <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
        Dosen Pengampu
       </p>
      </div>
      <Link href="/pengaturan-dosen">
       <div className="w-10 h-10 bg-linear-to-tr from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md hover:scale-105 transition-transform">
        {getInitials(user?.nama)}
       </div>
      </Link>
     </div>
    </header>

    <main className="p-8">{children}</main>
   </div>
  </div>
 );
}

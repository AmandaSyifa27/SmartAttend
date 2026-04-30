"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

export default function AdminLayout({ children }) {
 const router = useRouter();
 const pathname = usePathname();
 const [user, setUser] = useState(null);
 const [tahunAjaran, setTahunAjaran] = useState(null);
 const [sidebarOpen, setSidebarOpen] = useState(true);

 useEffect(() => {
  const userData = Cookies.get("user");
  const token = Cookies.get("token");
  if (!userData || !token) {
   router.push("/login");
   return;
  }
  const parsed = JSON.parse(userData);
  if (parsed.role !== "admin") {
   router.push("/login");
   return;
  }
  setUser(parsed);
  fetch("http://localhost:5000/api/tahun-ajaran", {
   headers: { Authorization: `Bearer ${token}` },
  })
   .then((res) => res.json())
   .then((data) => {
    const aktif = data.find((ta) => ta.isAktif);
    setTahunAjaran(aktif);
   })
   .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
 }, []);

 const handleLogout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
  router.push("/login");
 };

 const menuGroups = [
  {
   label: "Menu Utama",
   items: [{ href: "/dashboard", label: "Dashboard", icon: "⊞" }],
  },
  {
   label: "Data Master",
   items: [
    { href: "/dosen", label: "Data Dosen", icon: "👤" },
    { href: "/mahasiswa", label: "Mahasiswa", icon: "👥" },
    { href: "/mata-kuliah", label: "Mata Kuliah", icon: "📚" },
   ],
  },
  {
   label: "Akademik",
   items: [
    { href: "/tahun-ajaran", label: "Tahun Ajaran", icon: "📅" },
    { href: "/jadwal", label: "Jadwal dan KRS", icon: "🗓" },
   ],
  },
  {
   label: "Laporan",
   items: [{ href: "/kehadiran", label: "Rekap Kehadiran", icon: "📋" }],
  },
  {
   label: "Lainnya",
   items: [{ href: "/pengaturan", label: "Pengaturan", icon: "⚙️" }],
  },
 ];

 const getInitials = (name) => {
  if (!name) return "?";

  const parts = name.trim().split(" ");

  if (parts.length > 1) {
   // Jika ada 2 kata atau lebih: Ambil huruf pertama kata ke-1 dan kata ke-2
   return (parts[0][0] + parts[1][0]).toUpperCase();
  } else {
   // Jika cuma 1 kata: Ambil 2 huruf pertama dari kata tersebut
   return name.substring(0, 2).toUpperCase();
  }
 };

 return (
  <div className="flex min-h-screen bg-gray-50">
   {/* Sidebar */}
   <aside
    className={`${sidebarOpen ? "w-56" : "w-16"} bg-gray-900 text-white flex flex-col fixed h-full transition-all duration-300 z-20`}
   >
    {/* Logo + Toggle */}
    <div
     className={`flex items-center ${sidebarOpen ? "justify-between" : "justify-center"} px-4 py-4 border-b border-gray-700`}
    >
     {sidebarOpen && (
      <span className="font-bold text-purple-400 text-lg">Admin</span>
     )}
     <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-700 transition-colors"
     >
      {sidebarOpen ? "◀" : "▶"}
     </button>
    </div>

    {/* Menu */}
    <nav className="flex-1 px-2 py-4 overflow-y-auto space-y-4">
     {menuGroups.map((group) => (
      <div key={group.label}>
       {sidebarOpen && (
        <p className="text-xs text-gray-500 uppercase font-semibold px-2 mb-1">
         {group.label}
        </p>
       )}
       {group.items.map((item) => (
        <Link
         key={item.href}
         href={item.href}
         title={!sidebarOpen ? item.label : ""}
         className={`flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center px-0"} py-2 rounded-lg text-sm transition-colors mb-1 ${
          pathname === item.href
           ? "bg-purple-600 text-white font-semibold"
           : "text-gray-400 hover:bg-gray-800 hover:text-white"
         }`}
        >
         <span className="text-base shrink-0">{item.icon}</span>
         {sidebarOpen && <span>{item.label}</span>}
        </Link>
       ))}
      </div>
     ))}
    </nav>

    {/* Logout */}
    <div className="px-2 py-4 border-t border-gray-700">
     <button
      onClick={handleLogout}
      title={!sidebarOpen ? "Keluar" : ""}
      className={`flex items-center ${sidebarOpen ? "gap-3 px-3" : "justify-center"} py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 w-full transition-colors`}
     >
      <span className="shrink-0">🚪</span>
      {sidebarOpen && <span>Keluar</span>}
     </button>
    </div>
   </aside>

   {/* Main */}

   <div
    className={`flex-1 min-w-0 ${sidebarOpen ? "ml-56" : "ml-16"} flex flex-col transition-all duration-300 overflow-hidden`}
   >
    {/* Topbar */}
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
     <div>
      {tahunAjaran && (
       <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
        <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
        T.A Aktif: {tahunAjaran.nama}
       </span>
      )}
     </div>
     <div className="flex items-center gap-3">
      <div className="text-right">
       <p className="text-sm font-semibold text-gray-800">{user?.nama}</p>
       <p className="text-xs text-gray-400">Super Admin</p>
      </div>
      <Link href="/pengaturan">
       <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
        {/* {user?.nama?.charAt(0)} */}
        {getInitials(user?.nama)}
       </div>
      </Link>
     </div>
    </header>

    <main className="flex-1 p-6">{children}</main>
   </div>
  </div>
 );
}

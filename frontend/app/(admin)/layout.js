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

 //  useEffect(() => {
 //   const userData = Cookies.get("user");
 //   const token = Cookies.get("token");
 //   if (!userData || !token) {
 //    router.push("/login");
 //    return;
 //   }
 //   const parsed = JSON.parse(userData);
 //   if (parsed.role !== "admin") {
 //    router.push("/login");
 //    return;
 //   }
 //   setUser(parsed);

 //   // Ambil tahun ajaran aktif
 //   fetch("http://localhost:5000/api/tahun-ajaran", {
 //    headers: { Authorization: `Bearer ${token}` },
 //   })
 //    .then((res) => res.json())
 //    .then((data) => {
 //     const aktif = data.find((ta) => ta.isAktif);
 //     setTahunAjaran(aktif);
 //    });
 //  }, []);

 useEffect(
  () => {
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

   // Set user segera agar UI tidak menunggu fetch tahun ajaran
   setUser(parsed);

   // Ambil tahun ajaran aktif — jika gagal, jangan redirect ke login
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
     // Tidak redirect — user tetap bisa akses dashboard meski data TA gagal di-load
    });
  }, // eslint-disable-next-line react-hooks/exhaustive-deps
  [],
 );

 const handleLogout = () => {
  Cookies.remove("token");
  Cookies.remove("user");
  router.push("/login");
 };

 const menuItems = [
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
 ];

 return (
  <div className="flex min-h-screen bg-gray-50">
   {/* Sidebar */}
   <aside className="w-56 bg-gray-900 text-white flex flex-col fixed h-full">
    {/* Logo */}
    <div className="px-5 py-5 border-b border-gray-700">
     <span className="font-bold text-lg text-purple-400">Admin</span>
    </div>

    {/* Menu */}
    <nav className="flex-1 px-3 py-4 space-y-5 overflow-y-auto">
     {menuItems.map((group) => (
      <div key={group.label}>
       <p className="text-xs text-gray-500 uppercase font-semibold px-2 mb-2">
        {group.label}
       </p>
       {group.items.map((item) => (
        <Link
         key={item.href}
         href={item.href}
         className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors mb-1 ${
          pathname === item.href
           ? "bg-purple-600 text-white font-semibold"
           : "text-gray-400 hover:bg-gray-800 hover:text-white"
         }`}
        >
         <span>{item.icon}</span>
         {item.label}
        </Link>
       ))}
      </div>
     ))}
    </nav>

    {/* Logout */}
    <div className="px-3 py-4 border-t border-gray-700">
     <button
      onClick={handleLogout}
      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-400 hover:bg-gray-800 w-full"
     >
      <span>→</span> Keluar
     </button>
    </div>
   </aside>

   {/* Main Content */}
   <div className="flex-1 ml-56 flex flex-col">
    {/* Topbar */}
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
     <div className="flex items-center gap-2">
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
      <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
       {user?.nama?.charAt(0)}
      </div>
     </div>
    </header>

    {/* Page Content */}
    <main className="flex-1 p-6">{children}</main>
   </div>
  </div>
 );
}

import { SearchX } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
   <div className="text-center">
    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
     <span className="text-4xl">
      <SearchX size={50} color="#9333ea" strokeWidth={3} />
     </span>
    </div>
    <h1 className="text-6xl font-bold text-purple-600 mb-2">404</h1>
    <h2 className="text-xl font-semibold text-gray-800 mb-2">
     Halaman tidak ditemukan
    </h2>
    <p className="text-gray-500 text-sm mb-8">
     Halaman yang kamu cari tidak ada atau sudah dipindahkan.
    </p>
    <Link
     href="/login"
     className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm transition-colors"
    >
     Kembali ke Login
    </Link>
   </div>
  </div>
 );
}

import { Suspense } from "react";
import PresensiContent from "./PresensiContent";

export default function PresensiPage() {
 return (
  <Suspense
   fallback={
    <div className="flex items-center justify-center h-64">
     <p className="text-gray-400">Memuat...</p>
    </div>
   }
  >
   <PresensiContent />
  </Suspense>
 );
}

import { Suspense } from "react";
import PresensiContent from "./PresensiContent";
import Spinner from "@/components/ui/Spinner";

export default function PresensiPage() {
 return (
  <Suspense
   fallback={
    <div className="flex items-center justify-center h-64">
     {/* <p className="text-gray-400">Memuat...</p> */}
     <Spinner className="ml-2" />
    </div>
   }
  >
   <PresensiContent />
  </Suspense>
 );
}

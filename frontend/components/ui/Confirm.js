"use client";

import { AlertTriangle } from "lucide-react";

export default function Confirm({
 show,
 message,
 onConfirm,
 onCancel,
 confirmLabel = "Ya, Hapus",
 cancelLabel = "Batal",
 type = "danger",
}) {
 if (!show) return null;

 const config = {
  danger: {
   btn: "bg-red-500 hover:bg-red-600",
   icon: <AlertTriangle size={20} className="text-red-500" />,
  },
  warning: {
   btn: "bg-orange-500 hover:bg-orange-600",
   icon: <AlertTriangle size={20} className="text-orange-500" />,
  },
 };
 const { btn, icon } = config[type];

 return (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-9999 px-4">
   <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
    <div className="flex items-center gap-3 mb-3">
     {icon}
     <h3 className="font-bold text-gray-800">Konfirmasi</h3>
    </div>
    <p className="text-gray-600 text-sm mb-6">{message}</p>
    <div className="flex gap-3">
     <button
      onClick={onCancel}
      className="flex-1 border border-gray-300 text-gray-700 text-sm font-medium py-2 rounded-lg hover:bg-gray-50"
     >
      {cancelLabel}
     </button>
     <button
      onClick={onConfirm}
      className={`flex-1 text-white text-sm font-semibold py-2 rounded-lg ${btn}`}
     >
      {confirmLabel}
     </button>
    </div>
   </div>
  </div>
 );
}

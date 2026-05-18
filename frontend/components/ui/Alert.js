"use client";

import { useEffect } from "react";
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from "lucide-react";

export default function Alert({
 show,
 message,
 type = "info",
 onClose,
 autoClose = true,
}) {
 useEffect(() => {
  if (show && autoClose) {
   const timer = setTimeout(onClose, 3000);
   return () => clearTimeout(timer);
  }
 }, [show, autoClose, onClose]);

 if (!show) return null;

 const config = {
  info: {
   bg: "bg-blue-50 border-blue-200",
   icon: <Info size={18} className="text-blue-500 shrink-0" />,
   text: "text-blue-800",
  },
  success: {
   bg: "bg-green-50 border-green-200",
   icon: <CheckCircle size={18} className="text-green-500 shrink-0" />,
   text: "text-green-800",
  },
  error: {
   bg: "bg-red-50 border-red-200",
   icon: <AlertCircle size={18} className="text-red-500 shrink-0" />,
   text: "text-red-800",
  },
  warning: {
   bg: "bg-orange-50 border-orange-200",
   icon: <AlertTriangle size={18} className="text-orange-500 shrink-0" />,
   text: "text-orange-800",
  },
 };

 const { bg, icon, text } = config[type];

 return (
  <div className="fixed top-5 right-5 z-9999 max-w-sm w-full animate-in slide-in-from-top-2">
   <div
    className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-lg ${bg}`}
   >
    {icon}
    <p className={`text-sm flex-1 ${text}`}>{message}</p>
    <button
     onClick={onClose}
     className="text-gray-400 hover:text-gray-600 shrink-0"
    >
     <X size={16} />
    </button>
   </div>
  </div>
 );
}

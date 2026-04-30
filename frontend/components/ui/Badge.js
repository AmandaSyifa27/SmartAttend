export default function Badge({ children, variant = "default" }) {
 const variants = {
  success: "bg-green-100 text-green-700",
  warning: "bg-orange-100 text-orange-600",
  danger: "bg-red-100 text-red-500",
  default: "bg-gray-100 text-gray-500",
  purple: "bg-purple-100 text-purple-700",
 };
 return (
  <span
   className={`text-xs font-semibold px-3 py-1 rounded-full ${variants[variant]}`}
  >
   {children}
  </span>
 );
}

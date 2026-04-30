export default function Button({
 children,
 onClick,
 type = "button",
 variant = "primary",
 disabled = false,
 className = "",
}) {
 const base =
  "text-sm font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50";
 const variants = {
  primary: "bg-purple-600 hover:bg-purple-700 text-white",
  outline: "border border-gray-300 text-gray-700 hover:bg-gray-50",
  danger: "bg-red-500 hover:bg-red-600 text-white",
 };
 return (
  <button
   type={type}
   onClick={onClick}
   disabled={disabled}
   className={`${base} ${variants[variant]} ${className}`}
  >
   {children}
  </button>
 );
}

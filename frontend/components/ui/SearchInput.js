export default function SearchInput({
 placeholder,
 value,
 onChange,
 className = "",
}) {
 return (
  <input
   type="text"
   placeholder={placeholder || "Cari..."}
   value={value}
   onChange={onChange}
   className={`border text-gray-700 border-gray-200 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
  />
 );
}

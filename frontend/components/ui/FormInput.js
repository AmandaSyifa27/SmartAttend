export default function FormInput({
 label,
 type = "text",
 placeholder,
 value,
 onChange,
 required = false,
 className = "",
}) {
 return (
  <div>
   {label && (
    <label className="block text-sm font-medium text-gray-700 mb-1">
     {label}
    </label>
   )}
   <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    required={required}
    className={`w-full text-gray-700 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${className}`}
   />
  </div>
 );
}

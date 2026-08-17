export default function Pagination({ currentPage, totalPages, onPageChange }) {
 if (totalPages <= 1) return null;

 const pages = [];
 const showEllipsis = totalPages > 7;

 if (!showEllipsis) {
  for (let i = 1; i <= totalPages; i++) pages.push(i);
 } else {
  if (currentPage <= 4) {
   pages.push(1, 2, 3, 4, 5, "...", totalPages);
  } else if (currentPage >= totalPages - 3) {
   pages.push(
    1,
    "...",
    totalPages - 4,
    totalPages - 3,
    totalPages - 2,
    totalPages - 1,
    totalPages,
   );
  } else {
   pages.push(
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
   );
  }
 }

 return (
  <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
   <p className="text-xs text-gray-400">
    Halaman {currentPage} dari {totalPages}
   </p>
   <div className="flex items-center gap-1">
    <button
     onClick={() => onPageChange(currentPage - 1)}
     disabled={currentPage === 1}
     className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
    >
     ‹
    </button>

    {pages.map((page, i) =>
     page === "..." ? (
      <span
       key={`ellipsis-${i}`}
       className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm"
      >
       ...
      </span>
     ) : (
      <button
       key={page}
       onClick={() => onPageChange(page)}
       className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors ${
        currentPage === page
         ? "bg-purple-600 text-white font-semibold"
         : "text-gray-500 hover:bg-gray-100"
       }`}
      >
       {page}
      </button>
     ),
    )}

    <button
     onClick={() => onPageChange(currentPage + 1)}
     disabled={currentPage === totalPages}
     className="w-8 h-8 flex items-center justify-center rounded-lg text-sm text-gray-500 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
    >
     ›
    </button>
   </div>
  </div>
 );
}

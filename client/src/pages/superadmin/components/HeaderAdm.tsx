import React, { useState, useRef, useEffect } from "react";
import { User, ChevronDown } from "lucide-react";
import { getUser } from "../../../utils/auth";

const HeaderAdm: React.FC = () => {
  const user = getUser();

  const roleMap: Record<string, string> = {
    user_umum: "Masyarakat",
    super_admin: "Super Admin",
    pencatat: "Pencatat",
    validator: "Validator",
    teknisi: "Teknisi",
    admin_kategori: "Admin Kategori",
  };

  const username = user?.nama || "Guest";
  const roleLabel = user?.role ? roleMap[user.role] || user.role : "";

  // state untuk buka/tutup dropdown
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // tutup dropdown kalau klik di luar area
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="bg-white border-b border-gray-300">
      <div className="flex justify-between items-center px-6 py-3">
        {/* Judul Dashboard */}
        <h1 className="text-2xl font-bold"></h1>

        {/* User info */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2 cursor-pointer"
          >
            <User size={18} />
            <div className="flex flex-col leading-tight">
              <span className="font-medium truncate max-w-[120px]">{username}</span>
              <span className="text-xs text-gray-500">{roleLabel}</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {open && (
            <div className="absolute top-full right-0 mt-1 bg-white border shadow-md rounded text-xs w-40 z-10">
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="w-full px-2 py-2 text-left hover:bg-gray-100 text-red-600"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderAdm;

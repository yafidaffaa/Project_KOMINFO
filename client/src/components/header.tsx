import React from "react";
import logo from "@/assets/logo.png";
import { jwtDecode } from "jwt-decode";
import { Link } from "react-router-dom";
import { ChevronDown, User } from "lucide-react";

// Tipe payload token
type JwtPayload = {
  id_akun: number;
  username: string;
  role: string;
  nama: string;
  iat: number;
  exp: number;
};

const Header: React.FC = () => {
  const token = localStorage.getItem("token");
  let username = "Guest";
  let roleLabel = "";

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      username = decoded.nama || "Guest";
      roleLabel =
        {
          user_umum: "Masyarakat",
          admin: "Admin",
        }[decoded.role] || decoded.role;
    } catch (err) {
      console.error("Token invalid:", err);
    }
  }

  return (
    <header className="bg-white border-b border-gray-300">
      <div className="flex justify-between items-center px-4 md:px-12 py-3">
        {/* Logo dan judul kiri */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10 object-contain" />
          <div className="text-sm leading-tight">
            <span className="block font-semibold">Dinas Komunikasi</span>
            <span className="block font-semibold">Informatika dan Persandian</span>
          </div>
        </div>

        {/* Navigasi kanan */}
        <nav className="flex items-center gap-6 text-sm font-medium">
          <Link to="/warga" className="hover:underline">
            Daftar Aduan
          </Link>
          <a href="#tentang" className="hover:underline">
            Tentang Kami
          </a>

          {/* Username Dropdown */}
          <div className="relative group cursor-pointer">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span className="truncate max-w-[100px]">{username}</span>
              <ChevronDown size={16} />
            </div>
            {/* Tooltip dropdown (dummy) */}
            <div className="absolute top-full right-0 mt-1 hidden group-hover:block bg-white border shadow-md rounded text-xs w-32 z-10">
              <div className="p-2 text-gray-700 border-b">{roleLabel}</div>
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
          </div>
        </nav>
      </div>

      {/* Garis Hijau Bawah */}
      <div className="bg-green-300 h-4 w-full" />
    </header>
  );
};

export default Header;

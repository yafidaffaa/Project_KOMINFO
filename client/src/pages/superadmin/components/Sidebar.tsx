import React, { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import logo from "@/assets/logo.png";
import { ChevronDown, ChevronUp } from "lucide-react";

type JwtPayload = {
  id_akun: number;
  username: string;
  role: string;
  nama: string;
  iat: number;
  exp: number;
};

const Sidebar: React.FC = () => {
  const [openUserManagement, setOpenUserManagement] = useState(false);
  const navigate = useNavigate();

  // --- Ambil role user dari token ---
  const token = localStorage.getItem("token");
  let role = "";

  if (token) {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      role = decoded.role;
    } catch (err) {
      console.error("Token invalid:", err);
    }
  }

  // --- Menu berdasarkan role ---
  const menuByRole: Record<string, JSX.Element[]> = {
    admin_sa: [
      <button
        key="dashboard"
        onClick={() => navigate("/admin/dashboard")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Dashboard
      </button>,
      <button
        key="kategori"
        onClick={() => navigate("/kategori")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Kategori
      </button>,
      <button
        key="laporan-masuk"
        onClick={() => navigate("/laporan/masuk")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Masuk
      </button>,
      <button
        key="laporan-diterima"
        onClick={() => navigate("/laporan/diterima")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Diterima
      </button>,
      <div key="usermanage">
        <button
          onClick={() => setOpenUserManagement(!openUserManagement)}
          className="flex items-center justify-between w-full px-2 py-1 hover:bg-homegreen rounded"
        >
          <span>User Manajemen</span>
          {openUserManagement ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {openUserManagement && (
          <ul className="ml-4 mt-2 flex flex-col gap-1">
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=masyarakat")}
            >
              Masyarakat
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=pencatat")}
            >
              Pencatat
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=validator")}
            >
              Validator
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=teknisi")}
            >
              Teknisi
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=admin")}
            >
              Admin
            </li>
          </ul>
        )}
      </div>,
    ],
    admin_kategori: [
      <button
        key="kategori"
        onClick={() => navigate("/kategori")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Kategori
      </button>,
      <button
        key="laporan-masuk"
        onClick={() => navigate("/laporan/masuk")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Masuk
      </button>,
      <div key="usermanage">
        <button
          onClick={() => setOpenUserManagement(!openUserManagement)}
          className="flex items-center justify-between w-full px-2 py-1 hover:bg-homegreen rounded"
        >
          <span>User Manajemen</span>
          {openUserManagement ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>

        {openUserManagement && (
          <ul className="ml-4 mt-2 flex flex-col gap-1">
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=masyarakat")}
            >
              Masyarakat
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=pencatat")}
            >
              Pencatat
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=validator")}
            >
              Validator
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=teknisi")}
            >
              Teknisi
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => navigate("/admin/usermanage?role=admin")}
            >
              Admin
            </li>
          </ul>
        )}
      </div>,
    ],

    teknisi: [
      <button
        key="dashboard"
        onClick={() => navigate("/teknisi/dashboard")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Dashboard
      </button>,
      <button
        key="perbaikan"
        onClick={() => navigate("/teknisi/laporan/diterima")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Diterima
      </button>,
    ],

    validator: [
      <button
        key="laporan-masuk"
        onClick={() => navigate("/validator/dashboard")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Masuk
      </button>,
      <button
        key="laporan-diterima"
        onClick={() => navigate("/validator/laporan/diterima")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Diterima
      </button>,
    ],

    pencatat: [
      <button
        key="dashboard"
        onClick={() => navigate("/pencatat/dashboard")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Dashboard
      </button>,
      <button
        key="catat"
        onClick={() => navigate("/pencatat/catat")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Catat Laporan
      </button>,
    ],

    user_umum: [
      <button
        key="dashboard"
        onClick={() => navigate("/masyarakat/dashboard")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Dashboard
      </button>,
      <button
        key="laporan-saya"
        onClick={() => navigate("/masyarakat/laporan")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Saya
      </button>,
      <button
        key="tambah-laporan"
        onClick={() => navigate("/masyarakat/tambah-laporan")}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Tambah Laporan
      </button>,
    ],
  };

  return (
    <aside className="w-64 bg-primary min-h-screen flex flex-col">
      {/* Header User */}
      <div className="flex flex-col items-center justify-center p-4 border-b">
        <img src={logo} alt="Logo" className="h-20 mb-2" />
        <p className="text-sm font-medium">Selamat Datang</p>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-2 p-4">
        {menuByRole[role] || <p>Role tidak dikenali</p>}
      </nav>
    </aside>
  );
};

export default Sidebar;

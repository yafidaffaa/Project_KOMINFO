import React, { useState, type JSX } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import logo from "@/assets/logo.png";
import { ChevronDown, ChevronUp, Menu, X } from "lucide-react";

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
  const [isOpen, setIsOpen] = useState(false); // kontrol sidebar di mobile
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
        onClick={() => {
          navigate("/admin/dashboard");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Dashboard
      </button>,
      <button
        key="kategori"
        onClick={() => {
          navigate("/kategori");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Kategori
      </button>,
      <button
        key="laporan-masuk"
        onClick={() => {
          navigate("/laporan/masuk");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Masuk
      </button>,
      <button
        key="laporan-diterima"
        onClick={() => {
          navigate("/laporan/diterima");
          setIsOpen(false);
        }}
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
              onClick={() => {
                navigate("/admin/usermanage?role=masyarakat");
                setIsOpen(false);
              }}
            >
              Masyarakat
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => {
                navigate("/admin/usermanage?role=pencatat");
                setIsOpen(false);
              }}
            >
              Pencatat
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => {
                navigate("/admin/usermanage?role=validator");
                setIsOpen(false);
              }}
            >
              Validator
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => {
                navigate("/admin/usermanage?role=teknisi");
                setIsOpen(false);
              }}
            >
              Teknisi
            </li>
            <li
              className="hover:underline cursor-pointer"
              onClick={() => {
                navigate("/admin/usermanage?role=admin");
                setIsOpen(false);
              }}
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
        onClick={() => {
          navigate("/teknisi/dashboard");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Dashboard
      </button>,
      <button
        key="perbaikan"
        onClick={() => {
          navigate("/teknisi/laporan/diterima");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Diterima
      </button>,
    ],

    validator: [
      <button
        key="laporan-masuk"
        onClick={() => {
          navigate("/validator/dashboard");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Masuk
      </button>,
      <button
        key="laporan-diterima"
        onClick={() => {
          navigate("/validator/laporan/diterima");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Diterima
      </button>,
    ],

    pencatat: [
      <button
        key="dashboard"
        onClick={() => {
          navigate("/pencatat/dashboard");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Dashboard
      </button>,
      <button
        key="catat"
        onClick={() => {
          navigate("/pencatat/catat");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Catat Laporan
      </button>,
    ],

    user_umum: [
      <button
        key="dashboard"
        onClick={() => {
          navigate("/masyarakat/dashboard");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Dashboard
      </button>,
      <button
        key="laporan-saya"
        onClick={() => {
          navigate("/masyarakat/laporan");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Laporan Saya
      </button>,
      <button
        key="tambah-laporan"
        onClick={() => {
          navigate("/masyarakat/tambah-laporan");
          setIsOpen(false);
        }}
        className="text-left px-2 py-1 hover:bg-homegreen rounded"
      >
        Tambah Laporan
      </button>,
    ],
  };

  return (
    <>
      {/* Tombol toggle di HP */}
      <div className="lg:hidden flex flex-col items-center p-2 bg-primary text-black shadow-md">
        <button onClick={() => setIsOpen(!isOpen)} className="p-2">
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed lg:static top-0 left-0 z-50 w-64 bg-primary min-h-screen flex flex-col transition-transform duration-300 transform
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        {/* Header */}
        <div className="flex flex-col items-center justify-center p-4 border-b">
          <img src={logo} alt="Logo" className="h-20 mb-2" />
          <p className="text-sm font-medium">Selamat Datang</p>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-2 p-4">
          {menuByRole[role] || <p>Role tidak dikenali</p>}
        </nav>
      </aside>

      {/* Overlay gelap di HP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Sidebar;

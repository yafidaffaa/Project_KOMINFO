import React from "react";
import { Link } from "react-router-dom";
import logo from "@/assets/logo.png";
import heroImage from "@/assets/hero-illustration.png";
import catatIcon from "@/assets/catat.png";
import validasiIcon from "@/assets/validasi.png";
import teknisiIcon from "@/assets/teknisi.png";
import selesaiIcon from "@/assets/selesai.png";

const Home = () => {
  return (
    <div className="min-h-screen bg-homegreen flex flex-col overflow-x-hidden scroll-smooth">
      {/* Header */}
      <header className="flex items-center justify-between p-4 md:px-12 bg-homegreen sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 md:w-10" />
          <h1 className="text-xs md:text-sm font-semibold leading-tight text-black">
            DINAS KOMUNIKASI DAN INFORMATIKA<br />PERSANDIAN YOGYAKARTA
          </h1>
        </div>
        <nav className="space-x-4 text-black italic hidden md:block text-sm">
          <a href="#home" className="hover:underline">Home</a>
          <a href="#alur" className="hover:underline">Alur</a>
          <a href="#kontak" className="hover:underline">Kontak</a>
        </nav>
      </header>

      {/* Hero Section */}
      <section
        className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-14 md:py-20 min-h-[80vh]"
        id="home"
      >
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl md:text-5xl font-semibold italic">
            Layanan Pengaduan Kendala<br />Aplikasi / Website Pemerintah
          </h2>
          <p className="text-base md:text-lg text-gray-800">
            Sampaikan laporan jika Anda mengalami masalah saat menggunakan layanan digital pemerintah.
          </p>
          <div className="space-x-4">
            <Link to="/login">
              <button className="bg-blue-400 text-white px-6 py-2 rounded-full hover:bg-blue-500">Login</button>
            </Link>
            <Link to="/register">
              <button className="bg-green-400 text-white px-6 py-2 rounded-full hover:bg-green-500">Register</button>
            </Link>
          </div>
        </div>
        <div className="mt-10 md:mt-0 md:w-1/2">
          <img src={heroImage} alt="Ilustrasi" className="w-full max-w-md mx-auto" />
        </div>
      </section>

      {/* Alur Laporan */}
      <section id="alur" className="py-20 px-6 md:px-16 text-center bg-gradient-to-b from-homegreen to-primary">
        <h3 className="text-2xl md:text-3xl font-bold mb-16">Alur Penanganan Laporan</h3>
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {[{
            icon: catatIcon,
            title: "Catat Kendala",
            desc: "Isi formulir kendala secara lengkap dan jelas."
          }, {
            icon: validasiIcon,
            title: "Proses Validasi",
            desc: "Tim akan memeriksa dan memverifikasi laporan Anda."
          }, {
            icon: teknisiIcon,
            title: "Tindak Lanjut",
            desc: "Masalah yang valid akan segera diteruskan ke teknisi."
          }, {
            icon: selesaiIcon,
            title: "Penyelesaian",
            desc: "Anda akan diberi notifikasi setelah kendala ditangani."
          }].map((step, index) => (
            <div key={index} className="flex-1 flex flex-col items-center max-w-xs mx-auto">
              <img src={step.icon} alt={step.title} className="w-16 mb-4" />
              <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
              <p className="text-sm text-gray-700">{step.desc}</p>
            </div>
          ))}
        </div>
        <div className="h-20" />
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-footer py-6 px-4 md:px-12 text-center text-xs text-gray-800 ">
        <p>
          Dinas Komunikasi Informatika dan Persandian © 2025 Pemerintah Kota Yogyakarta<br />
          Jl. Kenari No. 56 Yogyakarta Telp. (0274) 515865, 561270 Fax. (0274) 561270 Email :
          <a href="mailto:kominfosandi@jogjakota.go.id" className="text-blue-700 hover:underline ml-1">
            kominfosandi@jogjakota.go.id
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;

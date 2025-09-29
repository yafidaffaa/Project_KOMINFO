import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import logo from "@/assets/logo.png";
import heroImage from "@/assets/hero-illustration.png";
import catatIcon from "@/assets/catat.png";
import validasiIcon from "@/assets/validasi.png";
import teknisiIcon from "@/assets/teknisi.png";
import selesaiIcon from "@/assets/selesai.png";

// Interface untuk aduan
interface Aduan {
  id: number;
  layanan: string;
  isi: string;
  status: "Proses" | "Selesai" | "Terkirim" | string;
  pelapor: string;
  tanggal: string;
}

const Home: React.FC = () => {
  const [daftarAduan, setDaftarAduan] = useState<Aduan[]>([]);
  const [statistik, setStatistik] = useState({ total: 0, proses: 0, selesai: 0 });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get<Aduan[]>("/bug-report"); // Ganti sesuai endpoint backend-mu
        const data = res.data;

        setDaftarAduan(data.slice(0, 9));

        const total = data.length;
        const proses = data.filter((d) => d.status === "Proses").length;
        const selesai = data.filter((d) => d.status === "Selesai").length;

        setStatistik({ total, proses, selesai });
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError("Gagal memuat data: " + err.message);
        } else {
          setError("Terjadi kesalahan tak terduga");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-homegreen flex flex-col overflow-x-hidden scroll-smooth">
      {/* Header */}
      <header className="flex items-center justify-between px-4 md:px-12 py-4 bg-homegreen sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 md:w-10" />
          <h1 className="text-xs md:text-sm font-semibold leading-tight text-black">
            DINAS KOMUNIKASI DAN INFORMATIKA
            <br />
            PERSANDIAN YOGYAKARTA
          </h1>
        </div>
        <nav className="space-x-6 text-black font-medium italic text-sm">
          <Link to="/daftaraduan" className="hover:underline">Daftar Aduan</Link>
          <Link to="/tentangkami" className="hover:underline">Tentang kami</Link>
          <a href="#kontak" className="hover:underline">Kontak</a>
        </nav>
      </header>

      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-12 py-12 md:py-20" id="tentang">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-3xl md:text-4xl font-semibold italic">
            Layanan Pengaduan Kendala
            <br />
            Aplikasi/Website Pemerintah
          </h2>
          <p className="text-gray-700">
            Sampaikan laporan jika anda mengalami masalah saat menggunakan layanan digital pemerintah.
          </p>
          <div className="flex gap-4">
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

      {/* Alur */}
      <section id="alur" className="py-20 px-6 md:px-16 text-center bg-gradient-to-b from-homegreen to-primary">
        <h3 className="text-2xl md:text-3xl font-bold mb-12">Alur Penanganan Laporan</h3>
        <div className="flex flex-col md:flex-row justify-between items-start gap-12">
          {[{
            icon: catatIcon,
            title: "Catat Kendala",
            desc: "Isi formulir kendala secara lengkap dan jelas."
          }, {
            icon: validasiIcon,
            title: "Proses Validasi",
            desc: "Tim akan memverifikasi informasi laporan Anda."
          }, {
            icon: teknisiIcon,
            title: "Tindak Lanjut",
            desc: "Masalah yang valid akan diteruskan ke teknisi."
          }, {
            icon: selesaiIcon,
            title: "Penyelesaian",
            desc: "Laporan ditangani dan pelapor akan mendapat notifikasi."
          }].map((step, index) => (
            <div key={index} className="flex-1 flex flex-col items-center max-w-xs mx-auto">
              <img src={step.icon} alt={step.title} className="w-16 mb-4" />
              <h4 className="font-semibold text-lg mb-2">{step.title}</h4>
              <p className="text-sm text-gray-700">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Search Aduan */}
      {/* <section className="bg-homegreen px-6 md:px-20 py-10 text-center">
        <h4 className="font-semibold text-xl mb-4">CARI ADUAN ANDA DISINI</h4>
        <div className="flex justify-center gap-4 max-w-xl mx-auto">
          <input
            type="text"
            placeholder="cari laporan"
            className="w-full border border-gray-400 rounded-full px-4 py-2 text-sm"
          />
          <button className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-full">CARI</button>
        </div>
      </section> */}

      {/* Statistik */}
      {/* <section className="bg-white py-8">
        <div className="flex justify-center items-center gap-8 text-center">
          {[
            { label: "Jumlah Aduan", value: statistik.total },
            { label: "Proses", value: statistik.proses },
            { label: "Selesai", value: statistik.selesai },
          ].map((stat, idx) => (
            <div key={idx} className="border px-6 py-4 rounded-md shadow-md">
              <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-black">{stat.value}</p>
            </div>
          ))}
        </div>
      </section> */}

      {/* Daftar Aduan */}
      {/* <section id="aduan" className="py-16 px-6 md:px-20 bg-gradient-to-b from-homegreen to-primary">
        <h3 className="text-2xl font-bold mb-6 text-center">Daftar aduan</h3>
        {loading ? (
          <p className="text-center text-sm text-gray-600">Memuat aduan...</p>
        ) : error ? (
          <p className="text-center text-sm text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {daftarAduan.map((aduan) => (
              <div key={aduan.id} className="bg-white border rounded-md p-4 shadow hover:shadow-lg transition">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{aduan.layanan}</span>
                  <span className="text-xs text-gray-500">Status: {aduan.status}</span>
                </div>
                <p className="text-sm text-gray-700 mb-4">{aduan.isi}</p>
                <div className="text-xs text-gray-600 flex justify-between">
                  <span>👤 {aduan.pelapor}</span>
                  <span>📅 {aduan.tanggal}</span>
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="text-right mt-6">
          <Link to="/daftaraduan" className="text-sm text-blue-600 hover:underline">
            Lihat lebih banyak &gt;
          </Link>
        </div>
      </section> */}

      {/* Footer */}
      <footer id="kontak" className="bg-footer py-6 px-4 md:px-12 text-center text-xs text-gray-800">
        <p>
          Dinas Komunikasi Informatika dan Persandian © 2025 Pemerintah Kota Yogyakarta
          <br />
          Jl. Kenari No. 56 Yogyakarta Telp. (0274) 515865, 561270 Fax. (0274) 561270 Email:{" "}
          <a href="mailto:kominfosandi@jogjakota.go.id" className="text-blue-700 hover:underline">
            kominfosandi@jogjakota.go.id
          </a>
        </p>
      </footer>
    </div>
  );
};

export default Home;

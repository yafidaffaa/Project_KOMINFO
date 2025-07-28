import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";


const DashboardWarga = () => {
  // Data dummy, nanti bisa di-fetch dari backend
  const statistik = {
    total: 250,
    proses: 30,
    selesai: 130,
  };

  const daftarAduan = Array.from({ length: 8 }).map((_, i) => ({
    id: i,
    layanan: "JSS",
    isi: "verifikasi struktural. gagal dg keterangan terlampir. terjadi pada permohonan tertentu saja.",
    status: ["Proses", "Selesai", "Terkirim"][i % 3],
    pelapor: ["Asep", "Rani", "Chika", "Budi"][i % 4],
    tanggal: "12/07/2025",
  }));

  const statusStyle = {
    Proses: "text-red-500 border-red-500",
    Selesai: "text-green-600 border-green-600",
    Terkirim: "text-yellow-600 border-yellow-600",
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Statistik */}
      <section className="bg-green-300 px-4 md:px-16 py-6 text-center">
        <h2 className="text-xl font-bold italic mb-6">Statistik Aduan</h2>
        <div className="flex justify-center gap-8 text-center">
          {[
            { label: "Jumlah Aduan", value: statistik.total },
            { label: "Proses", value: statistik.proses },
            { label: "Selesai", value: statistik.selesai },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white px-8 py-4 border rounded shadow-md"
            >
              <p className="font-semibold text-sm">{stat.label}</p>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filter & Tombol */}
      <section className="flex justify-between items-center px-6 md:px-16 py-4 bg-white border-b">
        <div className="text-sm">
          <label className="mr-2">Menampilkan</label>
          <select className="border border-gray-400 rounded px-2 py-1">
            <option value="8">8 data</option>
            <option value="16">16 data</option>
            <option value="all">Semua</option>
          </select>
        </div>
        <Link to="/formaduan">
          <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded">
            + Buat Aduan
          </button>
        </Link>
      </section>

      {/* Daftar Aduan */}
      <main className="flex-grow px-6 md:px-16 py-8 bg-white">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {daftarAduan.map((aduan) => (
            <div
              key={aduan.id}
              className="border rounded-md p-4 shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between mb-2">
                <span className="font-bold">{aduan.layanan}</span>
                <span
                  className={`text-xs border px-2 py-0.5 rounded-full font-semibold ${
                    statusStyle[aduan.status as keyof typeof statusStyle]
                  }`}
                >
                  Status: {aduan.status}
                </span>
              </div>
              <p className="text-sm text-gray-700 mb-4">{aduan.isi}</p>
              <div className="flex justify-between text-xs text-gray-600">
                <span>👤 {aduan.pelapor}</span>
                <span>📅 {aduan.tanggal}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8 text-sm">
          <button className="mx-1 px-3 py-1 rounded hover:bg-gray-200">Sebelumnya</button>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              className={`mx-1 px-3 py-1 rounded ${
                n === 1 ? "bg-gray-300 font-bold" : "hover:bg-gray-100"
              }`}
            >
              {n}
            </button>
          ))}
          <button className="mx-1 px-3 py-1 rounded hover:bg-gray-200">Selanjutnya</button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default DashboardWarga;

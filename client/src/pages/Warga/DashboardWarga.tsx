import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";
import {
  fetchBugReports,
  type BugReport,
} from "../../services/bugReportService";
import { getBugReportStatistic } from "../../services/statisticService";
import { getStatusColor, getStatusLabel } from "../../utils/statusUtils";

const DashboardWarga: React.FC = () => {
  const [allBugReports, setAllBugReports] = useState<BugReport[]>([]);
  const [daftarBug, setDaftarBug] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // pagination state
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(8);

  // statistik (from API)
  const [statistik, setStatistik] = useState({
    total: 0,
    diajukan: 0,
    proses: 0,
    selesai: 0,
    pendapat_selesai: 0,
  });

  const [tahun] = useState<number>(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // ambil semua laporan user
        const data = await fetchBugReports();
        setAllBugReports(data);

        // ambil statistik by user dari API
        const stat = await getBugReportStatistic(tahun);
        setStatistik({
          total: stat.total,
          diajukan: stat.diajukan,
          proses: stat.diproses,
          selesai: stat.selesai,
          pendapat_selesai: stat.pendapat_selesai,
        });
      } catch (err: unknown) {
        console.error("Gagal mengambil data bug report:", err);
        setError("Gagal mengambil data bug report");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tahun]);

  // update daftarBug sesuai pagination
  useEffect(() => {
    const start = (page - 1) * limit;
    const end = start + limit;
    setDaftarBug(allBugReports.slice(start, end));
  }, [page, limit, allBugReports]);

  // total halaman
  const totalPages = Math.ceil(allBugReports.length / limit);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Statistik */}
      <section className="bg-green-300 px-4 md:px-16 py-6 text-center">
        <h2 className="text-xl font-bold italic mb-6">Statistik Laporan</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Jumlah Laporan", value: statistik.total },
            { label: "Diajukan", value: statistik.diajukan },
            { label: "Proses", value: statistik.proses },
            { label: "Selesai", value: statistik.selesai },
            { label: "Pendapat Selesai", value: statistik.pendapat_selesai },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="bg-white px-6 py-4 border rounded shadow-md text-center"
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
          <select
            className="border border-gray-400 rounded px-2 py-1"
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // reset ke halaman pertama
            }}
          >
            <option value={8}>8 data</option>
            <option value={16}>16 data</option>
            <option value={allBugReports.length}>Semua</option>
          </select>
        </div>
        <Link to="/formaduan">
          <button className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 rounded">
            + Buat Laporan
          </button>
        </Link>
      </section>

      {/* Daftar Bug Report */}
      <main className="flex-grow px-6 md:px-16 py-8 bg-white">
        {loading ? (
          <p className="text-center text-gray-500">Memuat data...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : daftarBug.length === 0 ? (
          <p className="text-center text-gray-500">
            Tidak ada laporan ditemukan.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {daftarBug.map((bug) => (
              <Link
                key={bug.id_bug_report}
                to={`/detailaduan/${bug.id_bug_report}`}
                className="block"
              >
                <div className="border rounded-md p-4 shadow-sm hover:shadow-md transition cursor-pointer">
                  <div className="flex justify-between mb-2">
                    <span className="font-bold">
                      {bug.BugCategory?.nama_layanan || "Tanpa Kategori"}
                    </span>
                    <span
                      className={`text-xs border px-2 py-0.5 rounded-full font-semibold ${
                        getStatusColor(bug.status) ||
                        "text-gray-600 border-gray-400"
                      }`}
                    >
                      Status: {getStatusLabel(bug.status)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-4">{bug.deskripsi}</p>
                  <div className="flex justify-between text-xs text-gray-600">
                    <span>
                      📅{" "}
                      {new Date(bug.tanggal_laporan).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8 text-sm">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="mx-1 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Sebelumnya
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`mx-1 px-3 py-1 rounded ${
                  n === page
                    ? "bg-gray-300 font-bold"
                    : "hover:bg-gray-100"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="mx-1 px-3 py-1 rounded hover:bg-gray-200 disabled:opacity-50"
            >
              Selanjutnya
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default DashboardWarga;

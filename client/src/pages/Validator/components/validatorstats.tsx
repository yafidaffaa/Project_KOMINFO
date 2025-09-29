import React, { useEffect, useState } from "react";
import {
  getBugReportStatistic,
  type BugReportStatistic,

} from "../../../services/statisticService";

const ValidatorStats: React.FC = () => {
  const [stats, setStats] = useState<BugReportStatistic | null>(null);
  const [tahun, setTahun] = useState<number>(2025);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBugReportStatistic(tahun);
        setStats(data);
      } catch (err) {
        console.error("Gagal ambil statistik bug report:", err);
        setError("Gagal mengambil statistik. Cek koneksi atau server.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tahun]);

  const fmt = (v: number | undefined): string =>
    v === null || v === undefined ? "-" : v.toString();

  return (
    <div className="bg-white rounded-2xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Statistik Aduan</h3>

        <div className="flex items-center gap-2">
          <label className="text-sm">Periode</label>
          <select
            className="border rounded px-3 py-1"
            value={tahun}
            onChange={(e) => setTahun(Number(e.target.value))}
          >
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p className="text-center">Loading statistik...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Jumlah Aduan */}
          <div className="p-4 border rounded-lg text-center">
            <p className="font-semibold">Jumlah Aduan</p>
            <span className="text-2xl font-bold">{fmt(stats.total)}</span>
          </div>

          {/* Diajukan */}
          <div className="p-4 border rounded-lg text-center">
            <p className="font-semibold">Diajukan</p>
            <span className="text-2xl font-bold text-blue-500">
              {fmt(stats.diajukan)}
            </span>
          </div>

          {/* Proses */}
          <div className="p-4 border rounded-lg text-center">
            <p className="font-semibold">Proses</p>
            <span className="text-2xl font-bold text-orange-500">
              {fmt(stats.diproses)}
            </span>
          </div>

          {/* Pendapat Selesai */}
          <div className="p-4 border rounded-lg text-center">
            <p className="font-semibold">Pendapat Selesai</p>
            <span className="text-2xl font-bold text-teal-500">
              {fmt(stats.pendapat_selesai)}
            </span>
          </div>

          {/* Selesai */}
          <div className="p-4 border rounded-lg text-center col-span-2 md:col-span-4">
            <p className="font-semibold">Selesai</p>
            <span className="text-2xl font-bold text-green-600">
              {fmt(stats.selesai)}
            </span>
          </div>
        </div>
      ) : (
        <p className="text-center">Tidak ada data statistik.</p>
      )}
    </div>
  );
};

export default ValidatorStats;

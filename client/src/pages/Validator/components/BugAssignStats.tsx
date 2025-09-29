import React, { useEffect, useState } from "react";
import {
  getBugAssignStatistic,
  type BugAssignStatistic,

} from "../../../services/statisticService";

const BugAssignStats: React.FC = () => {
  const [stats, setStats] = useState<BugAssignStatistic | null>(null);
  const [tahun, setTahun] = useState<number>(2025);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getBugAssignStatistic(tahun);
        setStats(data);
      } catch (err) {
        console.error("Gagal ambil statistik bug-assign:", err);
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
    <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold">Statistik Bug Assign</h3>

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
          {/* Total */}
          <div className="p-4 border rounded-lg text-center">
            <p className="font-semibold">Total</p>
            <span className="text-2xl font-bold">{fmt(stats.total)}</span>
          </div>

          {/* Diproses */}
          <div className="p-4 border rounded-lg text-center">
            <p className="font-semibold">Diproses</p>
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
          <div className="p-4 border rounded-lg text-center">
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

export default BugAssignStats;

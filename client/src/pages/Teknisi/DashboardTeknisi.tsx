import React, { useEffect, useState } from "react";
import { ClipboardList, Clock, Loader2, CheckCircle } from "lucide-react";
import HeaderAdm from "../superadmin/components/HeaderAdm";
import Sidebar from "../superadmin/components/Sidebar";
import { getBugAssignStatistic, type BugAssignStatistic } from "../../services/statisticService";


const DashboardTeknisi: React.FC = () => {
  const [stats, setStats] = useState<BugAssignStatistic | null>(null);
  const [tahun, setTahun] = useState<number>(2025);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getBugAssignStatistic(tahun);
        setStats(data);
      } catch (err) {
        console.error("Gagal mengambil statistik teknisi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tahun]);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <HeaderAdm />

        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Dashboard Teknisi</h2>
            <select
              className="border rounded px-3 py-1"
              value={tahun}
              onChange={(e) => setTahun(Number(e.target.value))}
            >
              <option value={2025}>2025</option>
              <option value={2024}>2024</option>
            </select>
          </div>

          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Statistik Laporan
            </h3>

            {loading ? (
              <p className="text-center">Loading statistik...</p>
            ) : stats ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Total */}
                <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
                  <ClipboardList className="text-yellow-600 mb-2" size={28} />
                  <p className="font-semibold">Total Laporan</p>
                  <span className="text-3xl font-bold">{stats.total}</span>
                </div>

                {/* Belum Dikerjakan = total - diproses - selesai */}
                <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
                  <Clock className="text-red-500 mb-2" size={28} />
                  <p className="font-semibold">Belum Dikerjakan</p>
                  <span className="text-3xl font-bold">
                    {stats.total - stats.diproses - stats.selesai}
                  </span>
                </div>

                {/* Proses */}
                <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
                  <Loader2 className="text-blue-500 mb-2" size={28} />
                  <p className="font-semibold">Proses</p>
                  <span className="text-3xl font-bold">{stats.diproses}</span>
                </div>

                {/* Selesai */}
                <div className="flex flex-col items-center p-4 border rounded-lg shadow-sm">
                  <CheckCircle className="text-green-600 mb-2" size={28} />
                  <p className="font-semibold">Selesai Pengerjaan</p>
                  <span className="text-3xl font-bold">{stats.selesai}</span>
                </div>
              </div>
            ) : (
              <p className="text-center">Tidak ada data statistik.</p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardTeknisi;

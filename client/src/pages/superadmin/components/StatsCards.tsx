import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../../components/Card";
import { getAllStatistic } from "../../../services/statisticService";

interface StatItem {
  label: string;
  value: number | string;
  color?: string;
}

const StatsCards: React.FC = () => {
  const [dashboardStats, setDashboardStats] = useState<StatItem[]>([]);
  const [bugReportStats, setBugReportStats] = useState<StatItem[]>([]);
  const [bugAssignStats, setBugAssignStats] = useState<StatItem[]>([]);
  const [tahun, setTahun] = useState<number>(2025);
  const [loading, setLoading] = useState(true);

  // format key jadi label rapi
  const formatLabel = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // assign warna otomatis untuk beberapa status
  const getColor = (key: string): string => {
    if (/selesai/i.test(key)) return "text-green-500";
    if (/proses/i.test(key)) return "text-orange-500";
    if (/ajukan/i.test(key)) return "text-red-500";
    return "";
  };

  // helper buat convert object ke array StatItem[]
const mapToStats = (response: Record<string, any>): StatItem[] => {
  const source = response.data ?? response;

  return Object.entries(source)
    .filter(([_, value]) => typeof value === "string" || typeof value === "number")
    .map(([key, value]) => ({
      label: formatLabel(key),
      value: value as string | number, // ✅ aman karena sudah difilter
      color: getColor(key),
    }));
};






  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const data = await getAllStatistic(tahun);

        setDashboardStats(mapToStats(data.dashboard));
        setBugReportStats(mapToStats(data.bugReport));
        setBugAssignStats(mapToStats(data.bugAssign));
      } catch (err) {
        console.error("Gagal mengambil statistik:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [tahun]);

  return (
    <div className="mb-8 space-y-8">
      {/* Filter Tahun */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Statistik Super Admin</h2>
        <select
          className="border rounded px-3 py-1"
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
        >
          <option value={2025}>2025</option>
          <option value={2024}>2024</option>
           <option value={2023}>2023</option>
            <option value={2022}>2022</option>
             <option value={2021}>2021</option>
              <option value={2020}>2020</option>
               <option value={2019}>2019</option>
                <option value={2018}>2018</option>
        </select>
      </div>

      {loading ? (
        <p>Loading statistik...</p>
      ) : (
        <>
          {/* Dashboard */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Dashboard</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {dashboardStats.map((item, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Bug Report */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Bug Report</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {bugReportStats.map((item, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Bug Assign */}
          <section>
            <h3 className="text-lg font-semibold mb-3">Bug Assign</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {bugAssignStats.map((item, i) => (
                <Card key={i}>
                  <CardContent className="p-4 text-center">
                    <p className="text-sm">{item.label}</p>
                    <p className={`text-2xl font-bold ${item.color}`}>
                      {item.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default StatsCards;

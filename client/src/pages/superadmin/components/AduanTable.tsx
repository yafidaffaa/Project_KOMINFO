import React from "react";

const aduanData = [
  {
    id: 1,
    layanan: "Jss",
    deskripsi: "di master/production, download laporan tahunan",
    lampiran: "lampiran.jpg",
    status: "Proses",
    tanggal: "07-06-2025, 19:00 WIB",
  },
  {
    id: 2,
    layanan: "Sankem",
    deskripsi: "error saat search text Unit OPD",
    lampiran: "lampiran.jpg",
    status: "Selesai",
    tanggal: "07-06-2025, 19:00 WIB",
  },
  {
    id: 3,
    layanan: "Monitoring Pengaduan",
    deskripsi: "filter: laporan selesai dikerjakan masih tersisa dan tampil",
    lampiran: "lampiran.jpg",
    status: "Revisi by Admin",
    tanggal: "07-06-2025, 19:00 WIB",
  },
  {
    id: 4,
    layanan: "Santunan kematian",
    deskripsi: "verifikasi struktural gagal, keterangan lampiran tidak sesuai",
    lampiran: "lampiran.jpg",
    status: "Proses",
    tanggal: "07-06-2025, 19:00 WIB",
  },
  {
    id: 5,
    layanan: "Jss",
    deskripsi: "di master/production, download laporan tahunan",
    lampiran: "lampiran.jpg",
    status: "Pendapat Selesai",
    tanggal: "07-06-2025, 19:00 WIB",
  },
];

const getStatusClass = (status: string) => {
  switch (status) {
    case "Proses":
      return "text-red-500 font-semibold";
    case "Selesai":
      return "text-green-600 font-semibold";
    case "Revisi by Admin":
      return "text-orange-500 font-semibold";
    case "Pendapat Selesai":
      return "text-blue-500 font-semibold";
    default:
      return "";
  }
};

const AduanTable: React.FC = () => {
  return (
    <div className="p-6 bg-white rounded-lg shadow">
      {/* Top Controls */}
      <div className="flex justify-between items-center mb-4">
        <select className="border rounded px-3 py-1">
          <option>Show 10 data</option>
          <option>Show 25 data</option>
          <option>Show 50 data</option>
        </select>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-100 text-xl font-bold">
            +
          </button>
          <select className="border rounded px-3 py-1">
            <option>Status</option>
            <option>Proses</option>
            <option>Selesai</option>
            <option>Revisi</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-2 py-1">No</th>
            <th className="border px-2 py-1">Layanan Terkendala</th>
            <th className="border px-2 py-1">Deskripsi</th>
            <th className="border px-2 py-1">Lampiran</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Tanggal Laporan</th>
            <th className="border px-2 py-1 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {aduanData.map((aduan, i) => (
            <tr key={aduan.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{i + 1}</td>
              <td className="border px-2 py-1">{aduan.layanan}</td>
              <td className="border px-2 py-1">{aduan.deskripsi}</td>
              <td className="border px-2 py-1 text-blue-500 cursor-pointer">
                📎 {aduan.lampiran}
              </td>
              <td className={`border px-2 py-1 ${getStatusClass(aduan.status)}`}>
                {aduan.status}
              </td>
              <td className="border px-2 py-1">{aduan.tanggal}</td>
              <td className="border px-2 py-1 text-center space-x-2">
                <button className="bg-gray-600 text-white px-2 py-1 rounded">
                  Detail
                </button>
                <button className="bg-yellow-500 text-white px-2 py-1 rounded">
                  Edit
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-center mt-4 gap-2">
        <button className="px-3 py-1 border rounded">Sebelumnya</button>
        {[1, 2, 3, 4, 5].map((p) => (
          <button
            key={p}
            className={`px-3 py-1 border rounded ${
              p === 1 ? "bg-gray-800 text-white" : "hover:bg-gray-100"
            }`}
          >
            {p}
          </button>
        ))}
        <button className="px-3 py-1 border rounded">Selanjutnya</button>
      </div>
    </div>
  );
};

export default AduanTable;

import React from "react";

const laporanData = [
  {
    id: 1,
    layanan: "Jss",
    deskripsi: "Situs ini tidak dapat dijangkau",
    lampiran: "lampiran.jpg",
    tanggal: "07-06-2025 19:00",
    validator: "Samuel",
    keterangan: "Ubah layanan terkendala",
  },
  {
    id: 2,
    layanan: "ekerja",
    deskripsi: "Situs ini tidak dapat dijangkau",
    lampiran: "lampiran.jpg",
    tanggal: "07-06-2025 19:00",
    validator: "Yanto",
    keterangan: "Ubah layanan terkendala",
  },
  {
    id: 3,
    layanan: "SIM Pelayanan",
    deskripsi: "Situs ini tidak dapat dijangkau",
    lampiran: "lampiran.jpg",
    tanggal: "07-06-2025 19:00",
    validator: "Ucup",
    keterangan: "Ubah layanan terkendala",
  },
  // Tambahkan data lainnya sesuai kebutuhan
];

const LaporanTableSuperAdmin: React.FC = () => {
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
            <option>Valid</option>
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
            <th className="border px-2 py-1">Tanggal</th>
            <th className="border px-2 py-1">Validator</th>
            <th className="border px-2 py-1">Keterangan Validator</th>
            <th className="border px-2 py-1 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {laporanData.map((lap, i) => (
            <tr key={lap.id} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{i + 1}</td>
              <td className="border px-2 py-1">{lap.layanan}</td>
              <td className="border px-2 py-1">{lap.deskripsi}</td>
              <td className="border px-2 py-1 text-blue-500 cursor-pointer">
                📎 {lap.lampiran}
              </td>
              <td className="border px-2 py-1">{lap.tanggal}</td>
              <td className="border px-2 py-1">{lap.validator}</td>
              <td className="border px-2 py-1">{lap.keterangan}</td>
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

export default LaporanTableSuperAdmin;

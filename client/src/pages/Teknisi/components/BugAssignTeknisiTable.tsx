import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  fetchLaporanDiterima,
  fetchBugPhotos,
  type BugAssign,
} from "../../../services/laporanDiterimaService";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const BugAssignTeknisiTable: React.FC = () => {
  const [reports, setReports] = useState<BugAssign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // 🔥 Modal Foto
  const [modalPhotos, setModalPhotos] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  useEffect(() => {
    const loadReports = async () => {
      const data = await fetchLaporanDiterima();
      setReports(data);
      setLoading(false);
    };
    loadReports();
  }, []);

  const handleShowPhotos = async (row: BugAssign) => {
    if (row.photo_bug === "ada") {
      const photoRes = await fetchBugPhotos(row.id_bug_report);
      if (photoRes && photoRes.photos.length > 0) {
        setModalPhotos(photoRes.photos.map((p) => p.photo_url));
        setSelectedPhotoIndex(0);
        setModalOpen(true);
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Laporan Diterima</h2>

      <table className="w-full border-collapse bg-white rounded-lg">
        <thead className="bg-white">
          <tr>
            <th className="px-3 py-2 text-left">No</th>
            <th className="px-3 py-2 text-left">Layanan Terkendala</th>
            <th className="px-3 py-2 text-left">Tanggal</th>
            <th className="px-3 py-2 text-left">Deskripsi</th>
            <th className="px-3 py-2 text-left">Lampiran</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {reports.length > 0 ? (
            reports.map((row, index) => (
              <tr key={row.id_bug_assign} className="text-center">
                <td className="border px-3 py-2">{index + 1}</td>
                <td className="border px-3 py-2">
                  {row.BugCategory?.nama_layanan}
                </td>
                <td className="border px-3 py-2">
                  {new Date(row.tanggal_penugasan).toLocaleDateString("id-ID")}
                </td>
                <td className="border px-3 py-2">
                  {row.BugReport?.deskripsi?.slice(0, 20)}...
                </td>
                <td className="border px-3 py-2">
                  {row.photo_bug === "ada" ? (
                    <button
                      onClick={() => handleShowPhotos(row)}
                      className="text-blue-600 underline hover:text-blue-800"
                    >
                      Ada
                    </button>
                  ) : (
                    <span className="text-gray-500">Tidak ada</span>
                  )}
                </td>
                <td className="border px-3 py-2">
                  <span
                    className={`${
                      row.status?.toLowerCase() === "selesai"
                        ? "text-green-600 font-semibold"
                        : row.status?.toLowerCase() === "proses"
                        ? "text-red-600 font-semibold"
                        : row.status?.toLowerCase() === "pendapat selesai"
                        ? "text-green-500 font-semibold"
                        : "text-gray-800"
                    }`}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="border px-3 py-2">
                  <button
                    onClick={() =>
                      navigate(
                        `/teknisi/laporan/detailditerima/${row.id_bug_assign}`
                      )
                    }
                    className="bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-800"
                  >
                    Detail
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={7} className="text-center py-4 text-gray-500">
                Tidak ada laporan diterima
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔥 Modal Foto */}
      {modalOpen && modalPhotos.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setModalOpen(false)}
          >
            <X size={32} />
          </button>

          <div className="flex items-center justify-center w-full">
            <button
              className="text-white mx-4"
              onClick={() =>
                setSelectedPhotoIndex(
                  (prev) => (prev - 1 + modalPhotos.length) % modalPhotos.length
                )
              }
            >
              <ChevronLeft size={40} />
            </button>

            <img
              src={modalPhotos[selectedPhotoIndex]}
              alt={`lampiran-${selectedPhotoIndex}`}
              className="max-h-[80vh] max-w-[80vw] rounded-lg"
            />

            <button
              className="text-white mx-4"
              onClick={() =>
                setSelectedPhotoIndex(
                  (prev) => (prev + 1) % modalPhotos.length
                )
              }
            >
              <ChevronRight size={40} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BugAssignTeknisiTable;

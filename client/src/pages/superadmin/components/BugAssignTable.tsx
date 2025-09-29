// src/pages/admin/laporan/BugAssignTable.tsx
import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import Button from "../../../components/Button";
import {
  fetchLaporanDiterima,
  fetchBugPhotos,
  type BugAssign,
} from "../../../services/laporanDiterimaService";
import { Search, X, ChevronLeft, ChevronRight } from "lucide-react";

const BugAssignTable: React.FC = () => {
  const [reports, setReports] = useState<BugAssign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // 🔥 pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // 🔥 modal foto
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

  // 🔎 filter data berdasarkan search + status
  const filteredReports = useMemo(() => {
    return reports.filter((row) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        row.BugCategory?.nama_layanan?.toLowerCase().includes(keyword) ||
        row.deskripsi?.toLowerCase().includes(keyword) ||
        row.Validator?.nama?.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter
        ? row.ket_validator?.toLowerCase() === statusFilter.toLowerCase()
        : true;

      return matchesSearch && matchesStatus;
    });
  }, [search, reports, statusFilter]);

  // 🔥 pagination logic
  const totalPages = Math.ceil(filteredReports.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const currentData = filteredReports.slice(
    startIndex,
    startIndex + rowsPerPage
  );

  // 🔥 handle buka foto
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

      {/* 🔹 Filter + Tombol Tambah + Search */}
      <div className="flex justify-between items-center mb-2">
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1);
          }}
        >
          <option value="">Semua Status</option>
          <option value="valid">Valid</option>
          <option value="tidak valid">Tidak Valid</option>
          <option value="perlu revisi">Perlu Revisi</option>
        </select>

        <div className="flex items-center gap-2">
         
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="border rounded-lg pl-3 pr-10 py-1 text-sm"
            />
            <Search className="absolute right-2 top-1.5 h-4 w-4 text-gray-500" />
          </div>
        </div>
      </div>

      <table className="w-full border-collapse bg-white rounded-lg">
        <thead className="bg-white">
          <tr>
            <th className="px-3 py-2 text-left">No</th>
            <th className="px-3 py-2 text-left">Layanan Terkendala</th>
            <th className="px-3 py-2 text-left">Deskripsi</th>
            <th className="px-3 py-2 text-left">Lampiran</th>
            <th className="px-3 py-2 text-left">Tanggal</th>
            <th className="px-3 py-2 text-left">Validator</th>
            <th className="px-3 py-2 text-left">Keterangan Validator</th>
            <th className="px-3 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((row, index) => (
              <tr key={row.id_bug_assign} className="text-center">
                <td className="border px-3 py-2">
                  {startIndex + index + 1}
                </td>
                <td className="border px-3 py-2">
                  {row.BugCategory?.nama_layanan}
                </td>
                <td className="border px-3 py-2">{row.deskripsi}</td>
                <td className="border px-3 py-2">
                  {row.photo_bug === "ada" ? (
                    <button
                      onClick={() => handleShowPhotos(row)}
                      className="text-blue-500 underline hover:text-blue-700"
                    >
                      Ada
                    </button>
                  ) : (
                    <span className="text-gray-500">Tidak ada</span>
                  )}
                </td>
                <td className="border px-3 py-2">
                  {new Date(row.tanggal_penugasan).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="border px-3 py-2">
                  {row.Validator?.nama || "-"}
                </td>
                <td className="border px-3 py-2">{row.ket_validator || "-"}</td>
                <td className="border px-3 py-2 flex gap-2 justify-center">
                  <Link to={`/detaillaporanditerima/${row.id_bug_assign}`}>
                    <Button size="sm" variant="outline">
                      Detail
                    </Button>
                  </Link>
                  <Link to={`/editlaporanditerima/${row.id_bug_assign}`}>
                    <Button size="sm">Edit</Button>
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                Tidak ada laporan diterima
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔥 pagination */}
      <div className="flex justify-between items-center mt-4 text-sm">
        <span>
          Showing {currentData.length > 0 ? startIndex + 1 : 0} to{" "}
          {startIndex + currentData.length} of {filteredReports.length} entries
        </span>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((prev) => prev - 1)}
          >
            Previous
          </Button>

          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              variant={currentPage === i + 1 ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="sm"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((prev) => prev + 1)}
          >
            Next
          </Button>
        </div>
      </div>

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
                  (prev) =>
                    (prev - 1 + modalPhotos.length) % modalPhotos.length
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

export default BugAssignTable;

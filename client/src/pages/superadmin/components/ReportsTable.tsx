import React, { useEffect, useState, useMemo } from "react";
import Button from "../../../components/Button";
import {
  fetchBugReports,
  getBugReportPhotos,
  type BugReport,
} from "../../../services/bugReportService";
import { Plus, Search, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getStatusColor, getStatusLabel } from "../../../utils/statusUtils";
import { getUser } from "../../../utils/auth";

const ReportsTable: React.FC = () => {
  const user = getUser();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [reports, setReports] = useState<BugReport[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  // 🔥 state untuk modal foto
  const [modalPhotos, setModalPhotos] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

  useEffect(() => {
    const loadReports = async () => {
      const data = await fetchBugReports();
      setReports(data);
      setLoading(false);
    };
    loadReports();
  }, []);

  const filteredReports = useMemo(() => {
    return reports.filter((row) => {
      const keyword = search.toLowerCase();
      const matchesSearch =
        row.BugCategory?.nama_layanan?.toLowerCase().includes(keyword) ||
        row.deskripsi?.toLowerCase().includes(keyword) ||
        row.nik_user?.toLowerCase().includes(keyword) ||
        row.status?.toLowerCase().includes(keyword);

      const matchesStatus = statusFilter
        ? row.status?.toLowerCase() === statusFilter.toLowerCase()
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

  const handleShowPhotos = async (row: BugReport) => {
    if (row.photo_bug === "ada") {
      const photos = await getBugReportPhotos(row);
      if (photos && photos.length > 0) {
        setModalPhotos(photos);
        setSelectedPhotoIndex(0);
        setModalOpen(true);
      }
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Daftar Laporan</h2>
      <div className="flex justify-between items-center mb-2">
        {/* filter status */}
        <select
          className="border rounded px-2 py-1"
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setCurrentPage(1); // reset ke page 1 saat ganti filter
          }}
        >
          <option value="">Semua Status</option>
          <option value="diajukan">Diajukan</option>
          <option value="diproses">Proses</option>
          <option value="revisi_by_admin">Revisi Admin</option>
          <option value="selesai">Selesai</option>
          <option value="pendapat_selesai">Pendapat Selesai</option>
        </select>

        <div className="flex items-center gap-2">
          <Link to="/formlaporan">
            <button className="bg-black text-white p-2 rounded-full hover:bg-gray-800">
              <Plus size={18} />
            </button>
          </Link>
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1); // reset ke page 1 saat cari
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
            <th className="px-3 py-2 text-left">Tanggal Laporan</th>
            <th className="px-3 py-2 text-left">Pelapor</th>
            <th className="px-3 py-2 text-left">Status</th>
            <th className="px-3 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {currentData.length > 0 ? (
            currentData.map((row, index) => (
              <tr key={row.id_bug_report} className="text-center">
                <td className="border px-3 py-2">
                  {startIndex + index + 1}
                </td>
                <td className="border px-3 py-2">
                  {row.BugCategory.nama_layanan}
                </td>
                <td className="border px-3 py-2">{row.deskripsi}</td>
                <td className="border px-3 py-2">
                  {row.photo_bug === "ada" ? (
                    <button
                      onClick={() => handleShowPhotos(row)} // 👉 nanti untuk popup foto
                      className="text-blue-500 underline hover:text-blue-700"
                    >
                      Ada
                    </button>
                  ) : (
                    <span className="text-gray-500">Tidak ada</span>
                  )}
                </td>


                <td className="border px-3 py-2">
                  {new Date(row.tanggal_laporan).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="border px-3 py-2">{row.nama_pelapor}</td>
                <td
                  className={`border px-3 py-2 font-semibold ${getStatusColor(
                    row.status
                  )}`}
                >
                  {getStatusLabel(row.status)}
                </td>
                <td className="border px-3 py-2 flex gap-2 justify-center">
                  {/* tombol Edit hanya muncul jika bukan validator & bukan admin kategori */}
                  {user?.role !== "validator" && user?.role !== "admin_kategori" && (
                    <Link to={`/editlaporan/${row.id_bug_report}`}>
                      <Button size="sm">Edit</Button>
                    </Link>
                  )}

                  {/* tombol Detail dengan route sesuai role */}
                  <Link
                    to={
                      user?.role === "validator"
                        ? `/validator/detaillaporan/${row.id_bug_report}`
                        : user?.role === "admin_kategori"
                          ? `/adminkat/detaillaporan/${row.id_bug_report}`
                          : `/detaillaporan/${row.id_bug_report}`
                    }
                  >
                    <Button size="sm">Detail</Button>
                  </Link>
                </td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} className="text-center py-4 text-gray-500">
                Tidak ada data ditemukan
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

      {/* 🔥 Modal Foto dengan navigasi */}
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

export default ReportsTable;

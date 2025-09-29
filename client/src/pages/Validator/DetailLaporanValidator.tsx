import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";

import Button from "../../components/Button";
import {
  fetchBugReportById,
  updateBugReport,
  getBugReportPhotos,
  type BugReport,
} from "../../services/bugReportService";

const DetailLaporanValidator: React.FC = () => {
  const { id } = useParams();
  const [laporan, setLaporan] = useState<BugReport | null>(null);
  const [keterangan, setKeterangan] = useState("");
  const [status, setStatus] = useState("diproses");
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      const res = await fetchBugReportById(id);
      if (res) {
        setLaporan(res);
        setKeterangan(res.ket_validator || "");
        setStatus(res.status || "diproses");

        // ambil foto dari endpoint photo_info
        const imgs = await getBugReportPhotos(res);
        if (imgs) setPhotos(imgs);
      }
    };
    fetchDetail();
  }, [id]);

  const handleSimpan = async () => {
    if (!id) return;

    try {
      const res = await updateBugReport(
        id,
        undefined,
        undefined,
        status,
        keterangan
      );
      alert(res.message || "Laporan berhasil diperbarui");
      navigate(-1);
    } catch (error: any) {
      alert(error.message || "Gagal memperbarui laporan, coba lagi");
    }
  };

  if (!laporan) {
    return <p className="text-center mt-10">Memuat detail laporan...</p>;
  }

  return (
    <div className="min-h-screen px-6 md:px-16 py-10 relative bg-white">
      {/* Tombol kembali */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-700 hover:text-black"
      >
        <ArrowLeft size={24} />
      </button>

      <div className="max-w-6xl mx-auto w-full">
        <h1 className="text-3xl font-semibold text-center mb-10">
          Detail Laporan
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Kolom kiri */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <p className="font-semibold text-lg">Layanan Terkendala</p>
              <p className="text-lg">{laporan.BugCategory?.nama_layanan}</p>
            </div>

            <div>
              <p className="font-semibold text-lg">Deskripsi</p>
              <p className="text-lg whitespace-pre-line">{laporan.deskripsi}</p>
            </div>

            {/* Keterangan Validator */}
            {status === "revisi_by_admin" && (
              <div>
                <p className="font-semibold text-lg">Keterangan Validator</p>
                <textarea
                  className="w-full border rounded p-2"
                  rows={4}
                  placeholder="Tuliskan keterangan anda disini..."
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                />
              </div>
            )}


            {/* Status */}
            <div>
              <p className="font-semibold text-lg">Status</p>
              <select
                className="border rounded px-2 py-1"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="diajukan">Diajukan</option>
                <option value="diproses">Proses</option>
                <option value="revisi_by_admin">Revisi Admin</option>
                <option value="selesai">Selesai</option>
                <option value="pendapat_selesai">Pendapat Selesai</option>
              </select>
            </div>

            {/* Simpan */}
            <Button
              onClick={handleSimpan}
              className="bg-sky-500 text-white mt-4"
            >
              Simpan
            </Button>
          </div>

          {/* Kolom kanan */}
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-lg">Pelapor</p>
              <p className="text-lg">{laporan.nama_pelapor || "-"}</p>
            </div>

            <div>
              <p className="font-semibold text-lg">Tanggal Laporan</p>
              <p className="text-lg">
                {new Date(laporan.tanggal_laporan).toLocaleString("id-ID")}
              </p>
            </div>

            {/* Lampiran */}
            <div>
              <p className="font-semibold text-lg mb-2">Lampiran</p>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`lampiran-${idx}`}
                      className="w-full h-32 object-cover border rounded cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedIndex(idx)} // buka modal
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada lampiran</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Foto */}
      {selectedIndex !== null && photos.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          {/* Tombol Close */}
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setSelectedIndex(null)}
          >
            <X size={32} />
          </button>

          {/* Navigasi & Foto */}
          <div className="flex items-center justify-center w-full">
            <button
              className="text-white mx-4"
              onClick={() =>
                setSelectedIndex(
                  (prev) =>
                    prev !== null
                      ? (prev - 1 + photos.length) % photos.length
                      : 0
                )
              }
            >
              <ChevronLeft size={40} />
            </button>

            <img
              src={photos[selectedIndex]}
              alt={`lampiran-${selectedIndex}`}
              className="max-h-[80vh] max-w-[80vw] rounded-lg"
            />

            <button
              className="text-white mx-4"
              onClick={() =>
                setSelectedIndex(
                  (prev) =>
                    prev !== null ? (prev + 1) % photos.length : 0
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

export default DetailLaporanValidator;

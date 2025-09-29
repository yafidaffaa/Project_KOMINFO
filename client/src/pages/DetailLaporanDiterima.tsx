import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import Button from "../components/Button";
import {
  fetchLaporanDiterimaById,
  hapusLaporanDiterima,
  fetchBugPhotos,
  type BugAssign,
  type BugPhoto,
} from "../services/laporanDiterimaService";

const DetailLaporanDiterima: React.FC = () => {
  const { id } = useParams();
  const [laporan, setLaporan] = useState<BugAssign | null>(null);
  const [photos, setPhotos] = useState<BugPhoto[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return;
      const res = await fetchLaporanDiterimaById(id);
      if (res) {
        setLaporan(res);

        // ambil foto bug report kalau ada
        if (res.BugReport?.photo_bug === "ada") {
          const photoRes = await fetchBugPhotos(res.BugReport.id_bug_report);
          if (photoRes?.photos) setPhotos(photoRes.photos);
        }
      }
    };
    fetchDetail();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;
    const konfirmasi = window.confirm(
      "Apakah Anda yakin ingin menghapus laporan ini?"
    );
    if (!konfirmasi) return;

    const success = await hapusLaporanDiterima(id);
    if (success) {
      alert("Laporan berhasil dihapus.");
      navigate(-1);
    } else {
      alert("Gagal menghapus laporan. Coba lagi.");
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
          Detail Laporan Diterima
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {/* Kolom Kiri */}
          <div className="space-y-6">
            <div>
              <p className="font-semibold">Layanan Terkendala</p>
              <p className="text-lg">{laporan.BugCategory?.nama_layanan}</p>
            </div>

            <div>
              <p className="font-semibold">Pelapor</p>
              <p className="text-lg">{laporan.BugReport?.nik_user || "-"}</p>
            </div>

            <div>
              <p className="font-semibold">Tanggal Laporan</p>
              <p className="text-lg">
                {new Date(
                  laporan.BugReport?.tanggal_laporan
                ).toLocaleString("id-ID")}
              </p>
            </div>

            <div>
              <p className="font-semibold">Deskripsi</p>
              <p className="text-lg whitespace-pre-line">
                {laporan.BugReport?.deskripsi}
              </p>
            </div>

            {laporan.ket_validator && (
              <div>
                <p className="font-semibold">Keterangan Validator:</p>
                <p>{laporan.ket_validator}</p>
              </div>
            )}

            {laporan.catatan_teknisi && (
              <div>
                <p className="font-semibold">Catatan Teknisi:</p>
                <p>{laporan.catatan_teknisi}</p>
              </div>
            )}
          </div>

          {/* Kolom Kanan */}
          <div className="space-y-6">
            <div>
              <p className="font-semibold">Status Penugasan:</p>
              <p>{laporan.status}</p>
            </div>

            <div>
              <p className="font-semibold">Validator</p>
              <p>{laporan.Validator?.nama || "-"}</p>
            </div>

            <div>
              <p className="font-semibold">Teknisi</p>
              <p>{laporan.Teknisi?.nama || "-"}</p>
            </div>

            {/* Lampiran */}
            <div>
              <p className="font-semibold mb-2">Lampiran</p>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((img, idx) => (
                    <img
                      key={idx}
                      src={img.photo_url}
                      alt={img.photo_name}
                      className="w-full h-32 object-cover border rounded cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedIndex(idx)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada lampiran</p>
              )}
            </div>

            <div>
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="w-full md:w-auto"
              >
                Delete
              </Button>
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
              src={photos[selectedIndex].photo_url}
              alt={photos[selectedIndex].photo_name}
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

export default DetailLaporanDiterima;

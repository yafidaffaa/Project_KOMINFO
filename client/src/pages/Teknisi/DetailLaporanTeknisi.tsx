// src/pages/teknisi/DetailLaporanTeknisi.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchLaporanDiterimaById,
  updateLaporanDiterima,
  fetchBugPhotos,
  type BugAssign,
  type BugPhoto,
} from "../../services/laporanDiterimaService";
import Button from "../../components/Button";
import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";

const DetailLaporanTeknisi: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [report, setReport] = useState<BugAssign | null>(null);
  const [photos, setPhotos] = useState<BugPhoto[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Proses");
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      const data = await fetchLaporanDiterimaById(id);
      if (data) {
        setReport(data);
        setStatus(data.status || "Proses");
        setCatatan(data.catatan_teknisi || "");

        // ambil foto kalau ada
        if (data.BugReport?.photo_bug === "ada") {
          const photoRes = await fetchBugPhotos(data.BugReport.id_bug_report);
          if (photoRes?.photos) setPhotos(photoRes.photos);
        }
      }
      setLoading(false);
    };
    loadData();
  }, [id]);

  const handleUpdate = async () => {
    if (!id) return;
    try {
      await updateLaporanDiterima(id, {
        status,
        catatan_teknisi: catatan,
      });
      alert("Laporan berhasil diperbarui!");
      navigate(-1);
    } catch (err) {
      alert("Gagal menyimpan perubahan");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!report) return <p>Data tidak ditemukan</p>;

  return (
    <div className="p-6 bg-gradient-to-br from-green-200 to-green-400 min-h-screen flex flex-col gap-4 relative">
      {/* Tombol kembali */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-black hover:text-gray-700 w-fit"
      >
        <ArrowLeft size={20} className="mr-1" />
      </button>

      {/* Judul */}
      <h2 className="text-xl font-semibold text-center">Modul Perbaikan</h2>

      {/* Card detail */}
      <div className="bg-white rounded-3xl shadow-md p-8 flex flex-col md:flex-row gap-10 w-full max-w-5xl mx-auto">
        {/* KIRI */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="font-bold">Layanan Terkendala</p>
            <p>{report.BugCategory?.nama_layanan}</p>
          </div>
          <div>
            <p className="font-bold">Tanggal</p>
            <p>
              {new Date(report.tanggal_penugasan).toLocaleString("id-ID", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
          <div>
            <p className="font-bold">Deskripsi</p>
            <p>{report.deskripsi}</p>
          </div>

          <div>
            <p className="font-bold">Status</p>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="Proses">Proses</option>
              <option value="Selesai">Selesai</option>
              <option value="pendapat_selesai">Pendapat Selesai</option>
            </select>
          </div>

          <div>
            <p className="font-bold">Catatan Penyelesaian</p>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tuliskan catatan penyelesaian..."
              className="w-full border rounded-lg px-3 py-2"
              rows={4}
            />
          </div>

          <Button
            onClick={handleUpdate}
            className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2 rounded-full"
          >
            Simpan
          </Button>
        </div>

        {/* KANAN */}
        <div className="flex-1 space-y-6">
          <div>
            <p className="font-bold mb-2">Lampiran</p>
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
              <p>-</p>
            )}
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

export default DetailLaporanTeknisi;

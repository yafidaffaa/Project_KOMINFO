import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { ArrowLeft, ChevronLeft, ChevronRight, X } from "lucide-react";
import { fetchBugReportById, getBugReportPhotos, updateBugReport, type BugReport } from "../../services/bugReportService";
import { fetchBugCategories } from "../../services/BugCategoryServices";

const DetailLaporanAdmin: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [laporan, setLaporan] = useState<BugReport | null>(null);
  const [kategoriList, setKategoriList] = useState<
    { id_kategori: number; nama_layanan: string }[]
  >([]);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      const data = await fetchBugReportById(id);
      if (data) {
        setLaporan(data);
        setSelectedKategori(data.BugCategory?.id_kategori.toString() || "");

        const imgs = await getBugReportPhotos(data);
        if (imgs) setPhotos(imgs);
      }

      const kategoriData = await fetchBugCategories();
      setKategoriList(
        kategoriData.map((item) => ({
          id_kategori: item.id,
          nama_layanan: item.nama_layanan,
        }))
      );
    };

    loadData();
  }, [id]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedKategori) return;
    try {
      await updateBugReport(id, undefined, Number(selectedKategori));
      alert("Kategori berhasil diperbarui!");
      navigate(-1);
    } catch (err) {
      console.error("❌ Error update:", err);
      alert("Gagal update kategori");
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
          Detail Aduan (Admin)
        </h1>

        <form
          onSubmit={handleUpdate}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {/* Kolom kiri */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <p className="font-semibold text-lg">Layanan Terkendala</p>
              <select
                value={selectedKategori}
                onChange={(e) => setSelectedKategori(e.target.value)}
                required
                className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              >
                <option value="" disabled hidden>
                  Pilih Kategori
                </option>
                {kategoriList.map((kategori) => (
                  <option
                    key={kategori.id_kategori}
                    value={kategori.id_kategori}
                  >
                    {kategori.nama_layanan}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="font-semibold text-lg">Pelapor</p>
              <p className="text-lg">
                {laporan.nama_pelapor || laporan.UserUmum?.nama || "-"}
              </p>
            </div>

            <div>
              <p className="font-semibold text-lg">Tanggal Laporan</p>
              <p className="text-lg">
                {new Date(laporan.tanggal_laporan).toLocaleString("id-ID")}
              </p>
            </div>

            <div>
              <p className="font-semibold text-lg">Deskripsi</p>
              <p className="text-lg whitespace-pre-line">{laporan.deskripsi}</p>
            </div>

            {/* Tombol simpan */}
            <button
              type="submit"
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded shadow"
            >
              Simpan Perubahan
            </button>
          </div>

          {/* Kolom kanan */}
          <div className="space-y-6">
            <div>
              <p className="font-semibold text-lg">Status:</p>
              <p className="text-lg">{laporan.status}</p>
            </div>

            {/* Lampiran */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-lg">Lampiran</p>
                <span className="text-gray-500">{">"}</span>
              </div>
              {photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-3">
                  {photos.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`lampiran-${idx}`}
                      className="w-full h-32 object-cover border rounded cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedIndex(idx)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">Tidak ada lampiran</p>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Modal Foto */}
      {selectedIndex !== null && photos.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setSelectedIndex(null)}
          >
            <X size={32} />
          </button>

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

export default DetailLaporanAdmin;

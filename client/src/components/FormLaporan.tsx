import React, { useEffect, useState } from "react";
import { Image as ImageIcon, ArrowLeft, X } from "lucide-react";
import axios from "axios";
import { kirimLaporanBug } from "../services/bugReportService";
import { fetchBugCategories } from "../services/BugCategoryServices";
import { useNavigate } from "react-router-dom";

const FormLaporan = () => {
  const [kategoriList, setKategoriList] = useState<{ id_kategori: number; nama_layanan: string }[]>([]);
  const [selectedKategori, setSelectedKategori] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [files, setFiles] = useState<File[]>([]); // pakai array biar bisa preview & hapus
  const navigate = useNavigate();

  useEffect(() => {
    const loadKategori = async () => {
      try {
        const data = await fetchBugCategories();
        setKategoriList(
          data.map((item) => ({
            id_kategori: item.id,
            nama_layanan: item.nama_layanan,
          }))
        );
      } catch (err) {
        console.error("❌ Gagal ambil kategori:", err);
      }
    };
    loadKategori();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFile = e.target.files[0]; // hanya ambil 1 file tiap kali pilih
      if (!newFile) return;

      // maksimal 5 file
      if (files.length >= 5) {
        alert("Maksimal upload 5 file!");
        e.target.value = "";
        return;
      }

      // batas ukuran 10MB
      if (newFile.size > 10 * 1024 * 1024) {
        alert(`File ${newFile.name} lebih dari 10MB`);
        e.target.value = "";
        return;
      }

      setFiles((prev) => [...prev, newFile]);
      e.target.value = ""; // reset biar bisa pilih file yang sama lagi
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Anda harus login terlebih dahulu.");
      return;
    }

    try {
      await kirimLaporanBug(deskripsi, Number(selectedKategori), files);

      alert("Laporan berhasil dikirim!");
      setDeskripsi("");
      setSelectedKategori("");
      setFiles([]);
      navigate(-1);
    } catch (err: unknown) {
      console.error("❌ Error kirim laporan:", err);

      let errorMessage = "Gagal mengirim laporan.";

      if (axios.isAxiosError(err)) {
        errorMessage =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          errorMessage;
      }

      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 md:px-10 relative">
      {/* Tombol kembali */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-4 left-4 flex items-center gap-2 text-gray-700 hover:text-black"
      >
        <ArrowLeft size={24} />
      </button>

      {/* Form di tengah */}
      <div className="max-w-3xl w-full bg-white p-6 rounded shadow">
        <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">Laporkan Aduan Anda</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            id="kategori"
            value={selectedKategori}
            onChange={(e) => setSelectedKategori(e.target.value)}
            required
            className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
          >
            <option value="" disabled hidden>
              Pilih Kategori
            </option>
            {kategoriList.map((kategori) => (
              <option key={kategori.id_kategori} value={kategori.id_kategori}>
                {kategori.nama_layanan}
              </option>
            ))}
          </select>

          {/* Deskripsi */}
          <div>
            <label htmlFor="deskripsi" className="block text-sm mb-1">
              Deskripsi
            </label>
            <textarea
              id="deskripsi"
              rows={5}
              placeholder="Deskripsikan masalah atau kendala"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
              required
            ></textarea>
          </div>

          {/* File Upload */}
          <div className="relative">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full border border-gray-400 px-3 py-2 pr-10 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
            />
            <ImageIcon className="absolute right-3 top-3 text-gray-500" size={20} />
            <p className="text-xs text-gray-500 mt-1">Upload maksimum 5 file. Max 10 MB per file.</p>
          </div>

          {/* Preview foto */}
          {files.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mt-3">
              {files.map((file, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <p className="text-xs truncate text-center mt-1">{file.name}</p>
                  {/* Tombol hapus */}
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-black font-semibold py-2 rounded-full"
          >
            Kirim
          </button>
        </form>
      </div>
    </div>
  );
};

export default FormLaporan;

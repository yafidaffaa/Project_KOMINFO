import React, { useEffect, useState } from "react";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import axios from "axios";
import { fetchBugCategories } from "../../services/BugCategoryServices";
import { fetchBugReportById, updateBugReport } from "../../services/bugReportService";

const FormEditLaporan: React.FC = () => {
    const { id } = useParams(); // ambil id laporan dari route
    const navigate = useNavigate();

    const [kategoriList, setKategoriList] = useState<
        { id_kategori: number; nama_layanan: string }[]
    >([]);
    const [selectedKategori, setSelectedKategori] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);
    const [status, setStatus] = useState("proses");

    // ambil kategori
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

    // ambil detail laporan untuk pre-fill form
    useEffect(() => {
        const loadDetail = async () => {
            if (!id) return;
            try {
                const laporan = await fetchBugReportById(id);
                if (laporan) {
                    setSelectedKategori(String(laporan.id_bug_category));
                    setDeskripsi(laporan.deskripsi);
                    setStatus(laporan.status.toLowerCase());
                }
            } catch (err) {
                console.error("❌ Gagal ambil detail laporan:", err);
            }
        };
        loadDetail();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            const res = await updateBugReport(
                id,
                deskripsi,
                Number(selectedKategori),
                status,
                undefined, // kalau ada form input khusus validator isi di sini
                files
            );

            alert(res.message || "Update laporan berhasil ✅");
            navigate(-1);
        } catch (err: unknown) {
    console.error("❌ Error update laporan:", err);

    if (axios.isAxiosError(err)) {
        const res = err.response?.data;

        // Jika backend mengirim detail errors (misal error validasi array/object)
        if (res?.errors) {
            const msgList = Object.values(res.errors)
                .flat()
                .join("\n");
            alert(msgList);
            return;
        }

        // Default: ambil message
        alert(res?.message || "Gagal update laporan");
    } else {
        alert("Terjadi kesalahan tak terduga");
    }
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

            {/* Form edit */}
            <div className="max-w-3xl w-full bg-white p-6 rounded shadow">
                <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">
                    Edit Data Aduan
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Layanan Terkendala */}
                    <div>
                        <label className="block mb-1">Layanan Terkendala</label>
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

                    {/* Deskripsi */}
                    <div>
                        <label className="block mb-1">Deskripsi</label>
                        <textarea
                            rows={4}
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                            required
                        />
                    </div>

                    {/* Lampiran */}
                    <div>
                        <label className="block mb-1">Lampiran</label>
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={(e) => setFiles(e.target.files)}
                                className="w-full border border-gray-400 px-3 py-2 pr-10 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                            />
                            <ImageIcon
                                className="absolute right-3 top-3 text-gray-500"
                                size={20}
                            />
                        </div>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block mb-1">Status</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                        >
                            <option value="diajukan">Diajukan</option>
                            <option value="diproses">Proses</option>
                            <option value="revisi_by_admin">Revisi Admin</option>
                            <option value="selesai">Selesai</option>
                            <option value="pendapat_selesai"> Pendapat Selesai</option>

                        </select>
                    </div>

                    {/* Tombol Simpan & Batal */}
                    <div className="flex gap-3 justify-end">
                        <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded"
                        >
                            Simpan
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2 rounded"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FormEditLaporan;

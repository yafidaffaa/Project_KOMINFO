// src/pages/validator/DetailLaporanValidator.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    fetchLaporanDiterimaById,
    updateLaporanDiterima,
    fetchBugPhotos,
    type BugAssign,
} from "../../services/laporanDiterimaService";
import Button from "../../components/Button";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";

const DetailLaporanDiterimaValidator: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [report, setReport] = useState<BugAssign | null>(null);
    const [loading, setLoading] = useState(true);
    const [keterangan, setKeterangan] = useState("");
    const [showTolakForm, setShowTolakForm] = useState(false);

    // modal foto
    const [modalPhotos, setModalPhotos] = useState<string[]>([]);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            const data = await fetchLaporanDiterimaById(id);
            setReport(data);

            if (data?.photo_bug === "ada") {
                const photoRes = await fetchBugPhotos(data.id_bug_report);
                if (photoRes && photoRes.photos.length > 0) {
                    setModalPhotos(photoRes.photos.map((p) => p.photo_url));
                }
            }

            setLoading(false);
        };
        loadData();
    }, [id]);

    const handleUpdate = async (valid: boolean) => {
    if (!id) return;
    try {
        await updateLaporanDiterima(id, {
            ket_validator: keterangan,
            validasi_validator: valid ? "disetujui" : "tidak_disetujui",
        });

        alert(`Perbaikan ${valid ? "diterima" : "ditolak"}!`);
        navigate(-1);

    } catch (err: any) {
        console.error("❌ Error update laporan:", err);

        const res = err.response?.data;

        // Jika backend kirim errors: {...}
        if (res?.errors) {
            const msg = Object.values(res.errors)
                .flat()
                .join("\n");
            alert(msg);
            return;
        }

        // Jika backend kirim message: "..."
        alert(res?.message || "Gagal memperbarui laporan");
    }
};

    const handleShowPhotos = async () => {
        if (!report) return;
        if (report.photo_bug === "ada") {
            const photoRes = await fetchBugPhotos(report.id_bug_report);
            if (photoRes && photoRes.photos.length > 0) {
                setModalPhotos(photoRes.photos.map((p) => p.photo_url));
                setSelectedPhotoIndex(0);
                setModalOpen(true);
            }
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!report) return <p>Data tidak ditemukan</p>;

    return (
        <div className="p-6 bg-gradient-to-br from-green-200 to-green-400 min-h-screen flex flex-col gap-4">
            {/* Tombol kembali */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-black hover:text-gray-700 w-fit"
            >
                <ArrowLeft size={20} className="mr-1" />
            </button>

            {/* Judul */}
            <h2 className="text-xl font-semibold">Laporan Diterima</h2>

            {/* Ringkasan tabel */}
            <div className="overflow-x-auto bg-white rounded-xl shadow p-3">
                <table className="w-full text-sm border-collapse">
                    <thead>
                        <tr className="bg-gray-100 text-left">
                            <th className="p-2 border">No</th>
                            <th className="p-2 border">Layanan Terkendala</th>
                            <th className="p-2 border">Deskripsi</th>
                            <th className="p-2 border">Lampiran</th>
                            <th className="p-2 border">Tanggal Penugasan</th>
                            <th className="p-2 border">Pelapor</th>
                            <th className="p-2 border">Status</th>
                            <th className="p-2 border">Status Validasi</th>
                            <th className="p-2 border">Keterangan Validator</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="p-2 border">1</td>
                            <td className="p-2 border">
                                {report.BugCategory?.nama_layanan || "-"}
                            </td>
                            <td className="p-2 border truncate max-w-xs">
                                {report.deskripsi || "-"}
                            </td>
                            <td className="p-2 border">
                                {report.photo_bug === "ada" ? (
                                    <button
                                        onClick={handleShowPhotos}
                                        className="text-blue-600 underline hover:text-blue-800"
                                    >
                                        Ada
                                    </button>
                                ) : (
                                    <span className="text-gray-500">Tidak ada</span>
                                )}
                            </td>
                            <td className="p-2 border">
                                {new Date(report.tanggal_penugasan).toLocaleString("id-ID", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                })}
                            </td>
                            <td className="p-2 border">{report.nama_pelapor || "-"}</td>
                            <td className="p-2 border font-bold">{report.status || "-"}</td>
                            <td className="p-2 border">{report.validasi_validator || "-"}</td>
                            <td className="p-2 border">{report.ket_validator || "-"}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

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

                    {/* Jika sedang menolak laporan */}
                    {showTolakForm ? (
                        <div className="space-y-4">
                            <div>
                                <p className="font-bold">Keterangan Penolakan</p>
                                <textarea
                                    value={keterangan}
                                    onChange={(e) => setKeterangan(e.target.value)}
                                    placeholder="Tuliskan alasan penolakan disini..."
                                    className="w-full border rounded-lg px-3 py-2"
                                    rows={3}
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button
                                    onClick={() => handleUpdate(false)}
                                    disabled={!keterangan.trim()} // ✅ tombol disable jika kosong
                                    className={`px-6 py-2 rounded-full text-white ${keterangan.trim()
                                            ? "bg-red-600 hover:bg-red-700"
                                            : "bg-gray-300 cursor-not-allowed"
                                        }`}
                                >
                                    Konfirmasi Penolakan
                                </Button>

                                <Button
                                    onClick={() => setShowTolakForm(false)}
                                    className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-full"
                                >
                                    Batal
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4">
                            <Button
                                onClick={() => handleUpdate(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full"
                            >
                                Terima
                            </Button>
                            <Button
                                onClick={() => setShowTolakForm(true)}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-full"
                            >
                                Tolak
                            </Button>
                        </div>
                    )}
                </div>

                {/* KANAN */}
                <div className="flex-1 space-y-6">
                    <div>
                        <p className="font-bold">Pelapor</p>
                        <p>{report.nama_pelapor || "-"}</p>
                    </div>
                    <div>
                        <p className="font-bold">Status</p>
                        <p>{report.status}</p>
                    </div>
                    <div>
                        <p className="font-bold">Catatan Teknisi</p>
                        <p>{report.catatan_teknisi}</p>
                    </div>
                    <div>
                        <p className="font-bold">Lampiran</p>
                        {modalPhotos.length > 0 ? (
                            <div className="flex flex-wrap gap-3">
                                {modalPhotos.map((photo, idx) => (
                                    <img
                                        key={idx}
                                        src={photo}
                                        alt={`lampiran-${idx}`}
                                        className="w-32 h-32 object-cover rounded-lg cursor-pointer border"
                                        onClick={() => {
                                            setSelectedPhotoIndex(idx);
                                            setModalOpen(true);
                                        }}
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

export default DetailLaporanDiterimaValidator;

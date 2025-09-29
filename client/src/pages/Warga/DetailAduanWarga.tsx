import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle,
    Wrench,
    User,
    Clock,
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import {
    fetchBugReportById,
    getBugReportPhotos,
    type BugReport,
} from "../../services/bugReportService";
import {
    fetchBugHistoryById,
    type BugHistoryResponse,
} from "../../services/BugHistoryService";

const DetailAduanWarga: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const [bug, setBug] = useState<BugReport | null>(null);
    const [history, setHistory] = useState<BugHistoryResponse | null>(null);

    // untuk lampiran
    const [photos, setPhotos] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    useEffect(() => {
        if (id) {
            fetchBugReportById(id)
                .then(async (report) => {
                    setBug(report);
                    if (report?.photo_info?.has_photo) {
                        const result = await getBugReportPhotos(report);
                        setPhotos(result || []);
                    }
                })
                .catch(console.error);

            fetchBugHistoryById(id).then(setHistory).catch(console.error);
        }
    }, [id]);

    if (!bug || !history) return <p>Loading...</p>;

    return (
        <div className="flex flex-col md:flex-row min-h-screen bg-gray-200">
            {/* Timeline */}
            <div className="w-full md:w-1/3 bg-gray-100 p-6 overflow-y-auto">
                <h2 className="text-lg font-semibold mb-4">Timeline</h2>
                <div className="relative border-l-2 border-gray-400 ml-4">
                    {history.timeline
                        .slice()
                        .reverse()
                        .map((item) => (
                            <div key={item.id_history} className="mb-6 ml-4">
                                <span
                                    className={`absolute -left-3 w-6 h-6 rounded-full flex items-center justify-center border-2 ${item.status === "selesai"
                                        ? "bg-green-500 border-green-600 text-white"
                                        : item.status.includes("valid")
                                            ? "bg-purple-500 border-purple-600 text-white"
                                            : item.status.includes("teknisi")
                                                ? "bg-yellow-500 border-yellow-600 text-white"
                                                : "bg-gray-400 border-gray-500 text-white"
                                        }`}
                                >
                                    {item.status === "selesai" ? (
                                        <CheckCircle size={14} />
                                    ) : item.status.includes("teknisi") ? (
                                        <Wrench size={14} />
                                    ) : item.status.includes("diajukan") ? (
                                        <User size={14} />
                                    ) : (
                                        <Clock size={14} />
                                    )}
                                </span>

                                <div className="bg-white shadow rounded-lg p-3 ml-4">
                                    <p className="font-semibold">{item.status}</p>
                                    <p className="text-sm text-gray-600">
                                        {new Date(item.tanggal).toLocaleString("id-ID")}
                                    </p>
                                    <p className="mt-1">{item.keterangan || "-"}</p>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Detail Aduan */}
            <div className="w-full md:w-2/3 bg-white p-8 rounded-t-2xl md:rounded-none md:rounded-l-2xl shadow-lg">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center mb-4 text-gray-700 hover:text-black"
                >
                    <ArrowLeft size={20} className="mr-2" />
                </button>

                <h2 className="text-xl font-bold mb-6 text-center">Detail Aduan</h2>

                {/* Grid dua kolom */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Kolom kiri */}
                    <div className="space-y-5">
                        <div>
                            <p className="font-bold">Layanan Terkendala</p>
                            <p>{bug.BugCategory?.nama_layanan || "-"}</p>
                        </div>
                        <div>
                            <p className="font-bold">Tanggal Laporan</p>
                            <p>
                                {new Date(bug.tanggal_laporan).toLocaleString("id-ID", {
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
                            <p>{bug.deskripsi}</p>
                        </div>
                    </div>

                    {/* Kolom kanan */}
                    <div className="space-y-5">
                        <div>
                            <p className="font-bold">
                                Status: <span className="font-normal">{bug.status}</span>
                            </p>
                        </div>
                        <div>
                            <p className="font-bold">Lampiran &gt;</p>
                            {photos && photos.length > 0 ? (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {photos.map((src, index) => (
                                        <img
                                            key={index}
                                            src={src}
                                            alt={`Lampiran ${index + 1}`}
                                            className="w-32 h-32 object-cover border rounded-md cursor-pointer hover:opacity-80"
                                            onClick={() => setSelectedIndex(index)} // buka sesuai index
                                        />
                                    ))}
                                </div>
                            ) : (
                                <p>-</p>
                            )}
                        </div>                   </div>
                </div>
            </div>

            {/* Modal Preview Foto */}
            {selectedIndex !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50">
                    <button
                        className="absolute top-4 left-4 text-white"
                        onClick={() => setSelectedIndex(null)}
                    >
                        <ArrowLeft size={28} />
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
                            <ChevronLeft size={32} />
                        </button>
                        <img
                            src={photos[selectedIndex]}
                            alt={`Lampiran ${selectedIndex + 1}`}
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
                            <ChevronRight size={32} />
                        </button>
                    </div>

                    {/* Thumbnails */}
                    <div className="flex mt-4 space-x-2 overflow-x-auto">
                        {photos.map((src, i) => (
                            <img
                                key={i}
                                src={src}
                                alt={`thumb-${i}`}
                                onClick={() => setSelectedIndex(i)}
                                className={`w-16 h-16 object-cover cursor-pointer border ${i === selectedIndex ? "border-blue-500" : "border-white"
                                    }`}
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailAduanWarga;

import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

import {

    fetchLaporanDiterimaById,
    updateLaporanDiterima,
    type BugAssign,
    type BugAssignUpdateRequest,
} from "../../services/laporanDiterimaService";

const FormEditAssign: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [assign, setAssign] = useState<BugAssign | null>(null);
    const [status, setStatus] = useState("");
    const [ketValidator, setKetValidator] = useState("");
    const [validasiValidator, setValidasiValidator] = useState("");

    // ambil detail assign
    useEffect(() => {
        const loadDetail = async () => {
            if (!id) return;
            try {
                const data = await fetchLaporanDiterimaById(id);
                if (data) {
                    setAssign(data);
                    setStatus(data.status);
                    setKetValidator(data.ket_validator ?? "");
                    setValidasiValidator(data.validasi_validator ?? "");
                }
            } catch (err) {
                console.error("❌ Gagal ambil detail assign:", err);
            }
        };
        loadDetail();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;

        try {
            const payload: BugAssignUpdateRequest = {
                status,
                ket_validator: ketValidator === "" ? null : ketValidator,
                validasi_validator: validasiValidator === "" ? null : validasiValidator,
            };



            const res = await updateLaporanDiterima(id, payload);
            if (res) {
                alert("Bug Assign berhasil diperbarui ✅");
                navigate(-1);
            }
        } catch (err: unknown) {
            console.error("❌ Error update bug-assign:", err);
            if (axios.isAxiosError(err)) {
                alert(err.response?.data?.message || "Gagal update bug assign");
            } else {
                alert("Terjadi kesalahan tak terduga");
            }
        }
    };

    if (!assign) {
        return <p className="text-center py-10">Memuat data...</p>;
    }

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
                    Edit Bug Assign
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Info laporan */}
                    <div className="p-3 border rounded bg-gray-50 text-sm">
                        <p><strong>Layanan:</strong> {assign.BugCategory?.nama_layanan}</p>
                        <p><strong>Deskripsi:</strong> {assign.deskripsi}</p>
                        <p><strong>Status laporan:</strong> {assign.BugReport?.status}</p>
                        <p><strong>Tanggal laporan:</strong> {assign.BugReport?.tanggal_laporan}</p>
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
                            <option value="diproses">Diproses</option>
                            <option value="revisi_by_admin">Revisi Admin</option>
                            <option value="selesai">Selesai</option>
                            <option value="pendapat_selesai">Pendapat Selesai</option>
                        </select>
                    </div>

                    {/* Keterangan Validator */}
                    <div>
                        <label className="block mb-1">Keterangan Validator</label>
                        <textarea
                            rows={3}
                            value={ketValidator}
                            onChange={(e) => setKetValidator(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>

                    {/* Validasi Validator */}
                    <div>
                        <label className="block mb-1">Validasi Validator</label>
                        <select
                            value={validasiValidator ?? ""}
                            onChange={(e) =>
                                setValidasiValidator(e.target.value === "" ? "" : e.target.value)
                            }
                            className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                        >
                            <option value="">-- Pilih --</option>
                            <option value="disetujui">Disetujui</option>
                            <option value="tidak_disetujui">Tidak Disetujui</option>
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

export default FormEditAssign;

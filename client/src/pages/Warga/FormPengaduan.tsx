import React, { useEffect, useState } from "react";
import axios from "axios";
import { Image as ImageIcon } from "lucide-react";
import Header from "../../components/header";
import Footer from "../../components/footer";

const FormPengaduan = () => {


    type Layanan = {
        id: number;
        nama_layanan: string;
    };
    const [layananList, setLayananList] = useState<Layanan[]>([]);
    const [selectedLayanan, setSelectedLayanan] = useState("");
    const [deskripsi, setDeskripsi] = useState("");
    const [files, setFiles] = useState<FileList | null>(null);

    useEffect(() => {
        // Ganti URL di bawah dengan endpoint API layananmu
        axios.get("https://api.example.com/layanan")
            .then((res) => setLayananList(res.data))
            .catch((err) => console.error("Gagal fetch layanan:", err));
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Tambahkan logika pengiriman ke backend di sini
        console.log({ selectedLayanan, deskripsi, files });
    };




    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow px-4 md:px-10 py-10">
                <div className="max-w-3xl mx-auto bg-gray-50 p-6 rounded shadow">
                    <h2 className="text-xl md:text-2xl font-semibold mb-6 text-center">Laporkan Aduan Anda</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Dropdown Layanan */}
                        <select
                            value={selectedLayanan}
                            onChange={(e) => setSelectedLayanan(e.target.value)}
                            required
                            className="w-full border border-gray-400 px-3 py-2 mb-4 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                        >
                            <option value="" disabled hidden>
                                Layanan Terkendala
                            </option>
                            {layananList.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.nama_layanan}
                                </option>
                            ))}
                        </select>

                        {/* Deskripsi */}
                        <textarea
                            rows={5}
                            placeholder="Ketik Deskripsi"
                            value={deskripsi}
                            onChange={(e) => setDeskripsi(e.target.value)}
                            className="w-full border border-gray-400 px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                            required
                        ></textarea>

                        {/* Upload */}
                        <div className="relative">
                            <input
                                type="file"
                                multiple
                                accept="image/*,application/pdf"
                                onChange={(e) => setFiles(e.target.files)}
                                className="w-full border border-gray-400 px-3 py-2 pr-10 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
                            />
                            <ImageIcon className="absolute right-3 top-3 text-gray-500" size={20} />
                            <p className="text-xs text-gray-500 mt-1">Upload maksimum 5 file yang didukung. Max 10 MB per file.</p>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full bg-primary hover:bg-secondary text-black font-semibold py-2 rounded-full">
                            Kirim
                        </button>
                    </form>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default FormPengaduan;

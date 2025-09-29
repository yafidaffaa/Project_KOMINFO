import React from "react";
import { Link } from "react-router-dom";
import Header from "../components/header";
import AduanCard from "../components/aduancard";

const DaftarAduan = () => {
    return (
        <div className="min-h-screen bg-homegreen flex flex-col">
            <Header />

            <main className="flex-grow px-4 md:px-16 py-10">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold">Daftar aduan</h1>
                    <Link to="/formaduan">
                        <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm">
                            + Buat Aduan
                        </button>
                    </Link>
                </div>

                {/* Dropdown Filter */}
                <div className="mb-6">
                    <select className="border border-gray-400 rounded px-2 py-1 text-sm">
                        <option>Menampilkan 9 data</option>
                        <option>Menampilkan 12 data</option>
                    </select>
                </div>

                {/* Grid Daftar Aduan */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Array.from({ length: 9 }).map((_, idx) => (
                        <AduanCard key={idx} />
                    ))}
                </div>

                {/* Paginasi */}
                <div className="flex justify-center items-center mt-10 gap-2 text-sm">
                    <span className="text-gray-700">Sebelumnya</span>
                    {[1, 2, 3, 4, 5].map((n) => (
                        <button key={n} className={`px-3 py-1 border rounded ${n === 1 ? "bg-white text-black font-semibold" : "text-gray-600"}`}>
                            {n}
                        </button>
                    ))}
                    <span className="text-gray-700">Selanjutnya</span>
                </div>
            </main>

            {/* Footer */}
            <footer id="kontak" className="bg-footer py-6 px-4 md:px-12 text-center text-xs text-gray-800">
                <p>
                    Dinas Komunikasi Informatika dan Persandian © 2025 Pemerintah Kota Yogyakarta<br />
                    Jl. Kenari No. 56 Yogyakarta Telp. (0274) 515865, 561270 Fax. (0274) 561270 Email:{" "}
                    <a href="mailto:kominfosandi@jogjakota.go.id" className="text-blue-700 hover:underline">
                        kominfosandi@jogjakota.go.id
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default DaftarAduan;

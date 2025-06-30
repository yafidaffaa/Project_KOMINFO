import React from "react";
import { Link } from "react-router-dom";
import Header from "../../components/header";
import Footer from "../../components/footer";

const DashboadWarga = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header username="warga"/>

            {/* Konten Utama */}
            <main className="flex-grow px-4 md:px-16 py-20 bg-white text-left">
                <h1 className="text-2xl md:text-3xl font-bold mb-4">Daftar Aduan</h1>
                <p className="mb-6 text-gray-700">Anda belum pernah mengirim aduan.</p>
                <Link to="/formaduan">
                    <button className="bg-red-400 hover:bg-red-500 text-white font-semibold px-6 py-2 rounded-xl">
                        Buat Aduan
                    </button>
                </Link>
            </main>

            <Footer />
        </div>
    );
};

export default DashboadWarga;

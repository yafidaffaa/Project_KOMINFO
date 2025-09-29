import React from "react";
import Header from "../components/header";

const TentangKami = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-homegreen to-primary">
      <Header />

      <main className="flex-grow px-6 md:px-24 py-12 text-black">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">TENTANG KAMI</h1>

        <p className="text-justify text-sm md:text-base leading-relaxed mb-6">
          Kami adalah tim yang siap mendengarkan Anda, agar bersama-sama kita dapat membangun sistem yang lebih andal dan bebas dari gangguan. 
          Melalui aplikasi ini, kami mengajak Anda untuk berbagi informasi, menyampaikan laporan bug, error, atau masalah teknis apa pun yang Anda temui. 
          Setiap masukan Anda sangat berarti menjadi bahan evaluasi, perbaikan, dan pengembangan layanan kami ke arah yang lebih baik. 
          Kami memiliki tim yang siap merespons laporan Anda selama 24 jam. Dengan sistem ini, Anda bisa lebih mudah memantau proses tindak lanjut, 
          memberi saran, serta berperan aktif dalam peningkatan kualitas layanan dan aplikasi kami di masa depan. 
          Terima kasih telah menjadi bagian dari upaya menciptakan layanan digital yang lebih baik, transparan, dan responsif untuk semua.
        </p>

        <p className="mb-2 font-bold">
          Alamat Lokasi:{" "}
          <span className="font-normal">
            Jl. Brigjen Katamso, Keparakan, Mergangsang, Kota Yogyakarta, Daerah Istimewa Yogyakarta 55152, Indonesia
          </span>
        </p>

        <p className="font-bold mb-2 mt-4">Lokasi Pada Peta:</p>

        <div className="w-full max-w-5xl mx-auto rounded overflow-hidden border border-gray-400 shadow-md">
          <iframe
            title="Google Maps Dinas Kominfo"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3952.895323018745!2d110.3876209744694!3d-7.800905892219322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e7a5764a3d69075%3A0xb232b7001decd6b!2sDinas%20Komunikasi%20Informatika%20dan%20Persandian%20Kota%20Yogyakarta!5e0!3m2!1sid!2sid!4v1753602005271!5m2!1sid!2sid"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
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

export default TentangKami;

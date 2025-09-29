const Footer = () => {
  return (
    <footer className="bg-accent border-t border-gray-300 text-center py-4 px-2 text-sm text-gray-700">
      <p>
        Dinas Komunikasi Informatika dan Persandian © 2025{' '}
        <a href="https://jogjakota.go.id" className="text-blue-600 hover:underline">
          Pemerintah Kota Yogyakarta
        </a>
      </p>
      <p>
        Jl. Kenari No. 56 Yogyakarta Telp. (0274) 515865, 561270 Fax. (0274) 561270 Email :{' '}
        <a href="mailto:kominforsandi@jogjakota.go.id" className="text-blue-600 hover:underline">
          kominforsandi@jogjakota.go.id
        </a>
      </p>
    </footer>
  );
};

export default Footer;

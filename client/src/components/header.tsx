import logo from '@/assets/logo.png';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <header className="bg-primary p-4 flex items-center justify-between border-b border-black">
            {/* Logo + Judul */}
            <div className="flex items-center space-x-4">
                <img src={logo} alt="Logo" className="w-12" />
                <h1 className="font-bold text-lg md:text-xl text-black">
                    Dinas Komunikasi Informatika Persandian Yogyakarta
                </h1>
            </div>

            {/* Link Login + Register */}
            <div className="flex space-x-4 text-sm">
                <Link to="/login" className="italic hover:underline">Masuk</Link>
                <Link to="/register" className="italic hover:underline">Daftar</Link>
            </div>
        </header>
    );
};

export default Header;

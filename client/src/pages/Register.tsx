import React from "react";
import InputField from "../components/inputfield";
import logo from '@/assets/logo.png';

const Register = () => {
  return (
    <div className="grid md:grid-cols-2 min-h-screen">

      {/* Logo - akan tampil di atas di mobile */}
      <div className="bg-secondary flex items-center justify-center py-6 md:py-0 md:min-h-screen order-1 md:order-2">
        <img src={logo} alt="Logo" className="w-20 sm:w-24 md:w-48" />
      </div>

      {/* Formulir */}
      <div className="bg-white flex flex-col justify-center items-center px-6 md:px-10 py-10 order-2 md:order-1">
        <h2 className="text-3xl md:text-4xl italic mb-8">Daftar</h2>

        <form className="w-full max-w-sm space-y-4">
          <InputField id="nik" label="NIK" />
          <InputField id="nama" label="Nama" />
          <InputField id="email" label="Email" />
          <InputField id="username" label="Username" />
          <InputField id="password" label="Password" type="password" />
          <InputField id="confirmPassword" label="Konfirmasi Password" type="password" />
          
          <button
            type="submit"
            className="w-full bg-primary hover:bg-secondary text-black font-semibold py-2 rounded-full"
          >
            Daftar
          </button>
        </form>
      </div>

    </div>
  );
};

export default Register;

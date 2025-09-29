// src/features/auth/types.ts

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  profil: {
    nik_user: string;
    nama: string;
    email: string;
    alamat: string;
    id_akun: number;
    created_at: string;
    updated_at: string;
  };
  role: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
  nama: string;
  konfirmasiPassword: string;
  nik_user: string;
  email: string;
};

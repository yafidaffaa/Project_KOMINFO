export type UserRole = 'admin_sa' | 'admin_kategori' | 'pencatat' | 'validator' | 'user_umum' | 'teknisi';

export interface Akun {
  id_akun: number;
  username: string;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  nik: string;
  nama: string;
  no_hp?: string;
  email?: string;
  alamat?: string;
  nip?: string;
  nik_validator?: string;
  id_akun: number;
}

export interface User extends Akun {
  profile?: UserProfile;
}

export interface UserFormData {
  username: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
  nik: string;
  nama: string;
  no_hp?: string;
  email?: string;
  alamat?: string;
  nip?: string;
  nik_validator?: string;
}

export interface StatsData {
  masyarakat: number;
  pencatat: number;
  validator: number;
  teknisi: number;
  admin_kategori: number;
}

export interface ApiError {
  message: string;
  status?: number;
}
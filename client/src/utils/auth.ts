// src/utils/auth.ts

import { jwtDecode } from "jwt-decode";


interface JwtPayload {
    id_akun: number;
    username: string;
    role: string;
    nama: string;
    iat: number;
    exp: number;
}

/**
 * Ambil role user dari token JWT yang tersimpan di localStorage
 */
export const getUser = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
        const decoded = jwtDecode<JwtPayload>(token);
        return decoded;
    } catch (err) {
        console.error("Token invalid:", err);
        return null;
    }
};

/**
 * Cek apakah user sudah login & token belum expired
 */
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem("token");
    if (!token) return false;

    try {
        const decoded = jwtDecode<JwtPayload>(token);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
            return false; // token expired
        }
        return true;
    } catch {
        return false;
    }
};

/**
 * Logout: hapus token
 */
export const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
};

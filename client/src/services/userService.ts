// services/userService.ts
import api from "./api";

// --------------------- Role Types ---------------------
export type UserRole = "masyarakat" | "pencatat" | "validator" | "teknisi" | "admin";

const API_ENDPOINTS: Record<UserRole, string> = {
    masyarakat: "/user-umum",
    pencatat: "/pencatat",
    validator: "/validator",
    teknisi: "/teknisi",
    admin: "/admin-kategori",
};




// --------------------- Helpers ---------------------
function getNikKey(role: UserRole): string {
    switch (role) {
        case "masyarakat": return "nik_user";
        case "pencatat": return "nik_pencatat";
        case "validator": return "nik_validator";
        case "teknisi": return "nik_teknisi";
        case "admin": return "nik_admin_kategori";
    }
}

function getUsernameKey(role: UserRole): string {
    switch (role) {
        case "masyarakat": return "username";
        case "pencatat": return "username";
        case "validator": return "username";
        case "teknisi": return "username";
        case "admin": return "username";
    }
}

export interface User {
    nik: string;
    username: string;
    nama: string;
    noHp: string;
    email: string;
}

interface RawUser {
    [key: string]: any;
    nama?: string;
    name?: string;
    no_hp?: string;
    phone?: string;
    email?: string;
    id_akun?: number;
    Akun?: {
        id_akun: number;
        username: string;
        role: UserRole;
        created_at: string;
        updated_at: string;
    };
}

export async function getUsersByRole(role: UserRole): Promise<User[]> {
  try {
    const res = await api.get<RawUser[]>(API_ENDPOINTS[role]);
    console.log("🔎 API Response getUsersByRole:", role, res.data); // debug

    const nikKey = getNikKey(role);

    return res.data.map((u) => ({
      nik: u[nikKey],
      username: u.Akun?.username ?? "-", // ambil username dari Akun
      nama: u.nama ?? u.name ?? "-",
      noHp: u.no_hp ?? u.phone ?? "-",
      email: u.email ?? "-",
    }));
  } catch (error) {
    console.error("❌ Error fetching users:", error);
    return [];
  }
}


export async function getUserByNik(role: UserRole, nik: string): Promise<User | null> {
  try {
    const res = await api.get<RawUser>(`${API_ENDPOINTS[role]}/${nik}`);
    const u = res.data;

    return {
      nik: u[getNikKey(role)],
      username: u.Akun?.username ?? "-",  // ambil dari Akun
      nama: u.nama ?? u.name ?? "-",
      noHp: u.no_hp ?? u.phone ?? "-",
      email: u.email ?? "-",
    };
  } catch (error) {
    console.error(`Error fetching user ${nik}:`, error);
    return null;
  }
}


export async function getValidators(): Promise<User[]> {
  return getUsersByRole("validator");
}


// --------------------- Add User ---------------------
export interface AddUserData {
    username: string;
    password: string;
    confirmPassword?: string; // khusus masyarakat
    nama: string;
    email: string;
    no_hp?: string;
    alamat?: string;
    nik?: string;
    nip?: string;
    nik_validator?: string; // khusus teknisi
}

type Payload =
    | {
        username: string;
        password: string;
        nik_admin_kategori?: string;
        nip_admin_kategori?: string;
        nama: string;
        alamat?: string;
        email: string;
        no_hp?: string;
    }
    | {
        username: string;
        password: string;
        nik_pencatat?: string;
        nip_pencatat?: string;
        nama: string;
        alamat?: string;
        email: string;
        no_hp?: string;
    }
    | {
        username: string;
        password: string;
        konfirmasiPassword?: string;
        nama: string;
        nik_user?: string;
        email: string;
    }
    | {
        username: string;
        password: string;
        nik_teknisi?: string;
        nip_teknisi?: string;
        nama: string;
        alamat?: string;
        email: string;
        no_hp?: string;
        nik_validator?: string;
    }
    | {
        username: string;
        password: string;
        nik_validator?: string;
        nip_validator?: string;
        nama: string;
        alamat?: string;
        email: string;
        no_hp?: string;
    };

export async function addUser(role: UserRole, data: AddUserData) {
    let payload: Payload;

    switch (role) {
        case "admin":
            payload = {
                username: data.username,
                password: data.password,
                nik_admin_kategori: data.nik,
                nip_admin_kategori: data.nip,
                nama: data.nama,
                alamat: data.alamat,
                email: data.email,
                no_hp: data.no_hp,
            };
            break;
        case "pencatat":
            payload = {
                username: data.username,
                password: data.password,
                nik_pencatat: data.nik,
                nip_pencatat: data.nip,
                nama: data.nama,
                alamat: data.alamat,
                email: data.email,
                no_hp: data.no_hp,
            };
            break;
        case "masyarakat":
            payload = {
                username: data.username,
                password: data.password,
                konfirmasiPassword: data.confirmPassword,
                nama: data.nama,
                nik_user: data.nik,
                email: data.email,
            };
            break;
        case "teknisi":
            payload = {
                username: data.username,
                password: data.password,
                nik_teknisi: data.nik,
                nip_teknisi: data.nip,
                nama: data.nama,
                alamat: data.alamat,
                email: data.email,
                no_hp: data.no_hp,
                nik_validator: data.nik_validator,
            };
            break;
        case "validator":
            payload = {
                username: data.username,
                password: data.password,
                nik_validator: data.nik,
                nip_validator: data.nip,
                nama: data.nama,
                alamat: data.alamat,
                email: data.email,
                no_hp: data.no_hp,
            };
            break;
    }

    const res = await api.post(API_ENDPOINTS[role], payload);
    return res.data;
}

// --------------------- Edit User ---------------------
export async function editUser(role: UserRole, nik: string, data: AddUserData) {
    let payload: Payload;

    switch (role) {
        case "admin":
            payload = {
                username: data.username,
                password: data.password,
                nik_admin_kategori: data.nik,
                nip_admin_kategori: data.nip,
                nama: data.nama,
                alamat: data.alamat,
                email: data.email,
                no_hp: data.no_hp,
            };
            break;
        case "pencatat":
            payload = {
                username: data.username,
                password: data.password,
                nik_pencatat: data.nik,
                nip_pencatat: data.nip,
                nama: data.nama,
                alamat: data.alamat,
                email: data.email,
                no_hp: data.no_hp,
            };
            break;
        case "masyarakat":
            payload = {
                username: data.username,
                password: data.password,
                konfirmasiPassword: data.confirmPassword,
                nama: data.nama,
                nik_user: data.nik,
                email: data.email,
            };
            break;
        case "teknisi":
            payload = {
                username: data.username,
                password: data.password,
                nik_teknisi: data.nik,
                nip_teknisi: data.nip,
                nama: data.nama,
                alamat: data.alamat,
                email: data.email,
                no_hp: data.no_hp,
                nik_validator: data.nik_validator,
            };
            break;
        case "validator":
            payload = {
                username: data.username,
                password: data.password,
                nik_validator: data.nik,
                nip_validator: data.nip,
                nama: data.nama,
                alamat: data.alamat,
                email: data.email,
                no_hp: data.no_hp,
            };
            break;
    }

    const res = await api.put(`${API_ENDPOINTS[role]}/${nik}`, payload);
    return res.data;
}

// --------------------- Delete User ---------------------
export async function deleteUser(role: UserRole, nik: string) {
    const res = await api.delete(`${API_ENDPOINTS[role]}/${nik}`);
    return res.data;
}

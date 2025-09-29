import { Routes, Route } from "react-router-dom";

import ForgotPassword from "../pages/ForgotPass";
import ResetPassword from "../pages/ResetPass";
import Home from "../pages/Home";
import DashboadWarga from "../pages/Warga/DashboardWarga";
import FormPengaduan from "../pages/Warga/FormPengaduan";
import Login from "../pages/Auth/Login";
import Register from "../pages/Auth/Register";
import TentangKami from "../pages/TentangKami";
import DaftarAduan from "../pages/DaftarAduan";

// import AddAccountForm from "../pages/superadmin/AddAccountForm";
// import AccountDetail from "../pages/superadmin/AccountDetail";
// import EditAccountForm from "../pages/superadmin/EditAccountForm";

// === Dashboard untuk role lain (sementara dummy) ===
import Dashboardsa from "../pages/superadmin/Dashboardsa";
import UserManagement from "../pages/superadmin/UserManagement";
import KategoriPage from "../pages/superadmin/KategoriPage";
import DashboardTeknisi from "../pages/Teknisi/DashboardTeknisi";
import DashboardValidator from "../pages/Validator/DashboardValidator";
import ReportPageSA from "../pages/superadmin/ReportPageSA";
import FormLaporan from "../components/FormLaporan";
import DetailLaporan from "../pages/DetailLaporan";
import FormEditLaporan from "../pages/superadmin/FormEditLaporan";
import AssignPageSA from "../pages/superadmin/AssignPageSA";
import DetailLaporanValidator from "../pages/Validator/DetailLaporanValidator";
import FormEditAssign from "../pages/superadmin/FormEditAssign";
import DetailLaporanDiterima from "../pages/DetailLaporanDiterima";
import BugAssignPage from "../pages/Validator/BugAssignPage";
import DetailAduanWarga from "../pages/Warga/DetailAduanWarga";
import BugAssignTeknisiPage from "../pages/Teknisi/BugAssignTeknisiPage";
import DetailLaporanTeknisi from "../pages/Teknisi/DetailLaporanTeknisi";
import DetailLaporanDiterimaValidator from "../pages/Validator/DetailLaporanDiterimaValidator";
import DetailLaporanAdmin from "../pages/Admin/DetailLaporanAdmin";
// import DashboardPencatat from "../pages/pencatat/DashboardPencatat";
// import DashboardValidator from "../pages/validator/DashboardValidator";
// import DashboardTeknisi from "../pages/teknisi/DashboardTeknisi";
// import DashboardKategori from "../pages/kategori/DashboardKategori";

const AppRoutes = () => (
  <Routes>
    {/* Public */}
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgotpass" element={<ForgotPassword />} />
    <Route path="/auth/reset-password" element={<ResetPassword />} />
    <Route path="/tentangkami" element={<TentangKami />} />
    <Route path="/detaillaporan/:id" element={<DetailLaporan />} />
    <Route path="/editlaporan/:id" element={<FormEditLaporan />} />


    {/* Validator */}
    <Route path="/validator/dashboard" element={<DashboardValidator />} />
    <Route path="/validator/detaillaporan/:id" element={<DetailLaporanValidator />} />
    <Route path="/validator/laporan/diterima" element={<BugAssignPage />} />
    <Route path="/validator/laporan/detailditerima/:id" element={<DetailLaporanDiterimaValidator />} />

    {/* Teknisi */}
    <Route path="/teknisi/dashboard" element={<DashboardTeknisi />} />
    <Route path="/teknisi/laporan/diterima" element={<BugAssignTeknisiPage />} />
    <Route path="/teknisi/laporan/detailditerima/:id" element={<DetailLaporanTeknisi />} />



    {/* Warga */}
    <Route path="/warga" element={<DashboadWarga />} />
    <Route path="/formaduan" element={<FormPengaduan />} />
    <Route path="/daftaraduan" element={<DaftarAduan />} />
    <Route path="/detailaduan/:id" element={<DetailAduanWarga />} />

    {/* Admin */}
    <Route path="/adminkat/detaillaporan/:id" element={<DetailLaporanAdmin />} />


    {/* Super Admin */}
    <Route path="/admin/dashboard" element={<Dashboardsa />} />
    <Route path="/admin/usermanage" element={<UserManagement />} />
    <Route path="/laporan/masuk" element={<ReportPageSA />} />
    <Route path="/laporan/diterima" element={<AssignPageSA />} />
    <Route path="/kategori" element={<KategoriPage />} />
    <Route path="/formlaporan" element={<FormLaporan />} />
    <Route path="/editlaporanditerima/:id" element={<FormEditAssign />} />
    <Route path="/detaillaporanditerima/:id" element={<DetailLaporanDiterima />} />


    {/* <Route path="/data-master/tambah" element={<AddAccountForm />} />
    <Route path="/data-master/:id" element={<AccountDetail />} />
    <Route path="/data-master/:id/edit" element={<EditAccountForm />} /> */}

    {/* Role lain */}
    {/* <Route path="/pencatat/dashboard" element={<DashboardPencatat />} /> */}


    {/* <Route path="/kategori/dashboard" element={<DashboardKategori />} /> */}
  </Routes>
);

export default AppRoutes;

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { Outlet } from "react-router-dom";
// Pages
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import ArticlePage from "./pages/ArticlePage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticleManagementPage from "./pages/admin/article/ArticleManagementPage";
import NewArticlePage from "./pages/admin/article/NewArticlePage";
import EditArticlePage from "./pages/admin/article/EditArticlePage";
import LoginPage from "./pages/auth/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ProtectedRoute from "./ProtectedRoute";
import AdminCategoriesPage from "./pages/AdminCategoriesPage";
import WebAppPage from "./pages/WebAppPage";
import SejarahPage from "./pages/profile/SejarahPage";
import GuruStafPage from "./pages/profile/GuruStafPage";
import KepalaMadrasahPage from "./pages/profile/KepalaMadrasahPage";
import MitraPage from "./pages/profile/MitraPage";
import ProgramKerjaPage from "./pages/profile/ProgramKerjaPage";
import SaranaPrasaranaPage from "./pages/profile/SaranaPrasaranaPage";
import StrukturOrganisasiPage from "./pages/profile/StrukturOrganisasiPage";
import VisiMisiPage from "./pages/profile/VisiMisiPage";
import SiswaPage from "./pages/profile/SiswaPage";
import AttendanceStudentPage from "./pages/admin/attendance/AttendanceStudentPage";
import ArchiveManagementPage from "./pages/archive/ArchiveManagementPage";
import UploadArchivePage from "./pages/archive/UploadArchivePage";
import EditArchivePage from "./pages/archive/EditArchivePage";
import AttendanceInputPage from "./pages/admin/attendance/AttendanceInputPage";
import AttendanceRecapPage from "./pages/admin/attendance/AttendanceRecapPage";
import AttendanceHolidaysPage from "./pages/admin/attendance/AttendanceHolidaysPage";
import AttendanceArchivePage from "./pages/admin/attendance/AttendanceArchivePage";
import ManajemenStudentPage from "./pages/admin/student-management/ManagementStudentPage";
import EditAlumniPage from "./pages/alumni/EditAlumniPage";
import AlumniPage from "./pages/alumni/AlumniPage";
import UserProfilePage from "./pages/admin/user/UserProfile";
import UserManagementPage from "./pages/admin/user/UserManagementPage";

const AdminLayout = () => (
  <ProtectedRoute>
    <Outlet />{" "}
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ArticleProvider>
            <Router>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/berita" element={<NewsPage />} />
                <Route path="/berita/:slug" element={<ArticlePage />} />
                <Route path="/Profile" element={<ProfilePage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/webApp" element={<WebAppPage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route path="/profile/sejarah" element={<SejarahPage />} />
                <Route
                  path="/profile/struktur-organisasi"
                  element={<StrukturOrganisasiPage />}
                />
                <Route path="/profile/visi-misi" element={<VisiMisiPage />} />
                <Route
                  path="/profile/kepala-madrasah"
                  element={<KepalaMadrasahPage />}
                />
                <Route path="/profile/guru-staf" element={<GuruStafPage />} />
                <Route path="/profile/siswa" element={<SiswaPage />} />
                <Route path="/profile/mitra" element={<MitraPage />} />
                <Route
                  path="/profile/program-kerja"
                  element={<ProgramKerjaPage />}
                />
                <Route
                  path="/profile/sarana-prasarana"
                  element={<SaranaPrasaranaPage />}
                />

                <Route path="/archives" element={<ArchiveManagementPage />} />

                <Route path="/alumni" element={<AlumniPage />} />

                <Route path="/atmin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="userProfile" element={<UserProfilePage />} />

                  {/* Article */}
                  <Route path="articles" element={<ArticleManagementPage />} />
                  <Route path="articles/new" element={<NewArticlePage />} />
                  <Route
                    path="articles/:id/edit"
                    element={<EditArticlePage />}
                  />
                  <Route path="category" element={<AdminCategoriesPage />} />

                  {/*Archive*/}
                  <Route
                    path="archives/:id/edit"
                    element={<EditArchivePage />}
                  />

                  {/* Attendance */}
                  <Route path="presensi" element={<AttendanceStudentPage />} />
                  <Route
                    path="presensi/input"
                    element={<AttendanceInputPage />}
                  />
                  <Route
                    path="presensi/recap"
                    element={<AttendanceRecapPage />}
                  />
                  <Route
                    path="presensi/holidays"
                    element={<AttendanceHolidaysPage />}
                  />
                  <Route
                    path="presensi/archive"
                    element={<AttendanceArchivePage />}
                  />
                  <Route path="uploadArchive" element={<UploadArchivePage />} />

                  {/* Student Management - PINDAH KE SINI */}
                  <Route
                    path="manajemen-siswa"
                    element={<ManajemenStudentPage />}
                  />

                  <Route path="alumni/:id/edit" element={<EditAlumniPage />} />

                  <Route path="users" element={<UserManagementPage />} />
                </Route>

                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </ArticleProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { Outlet } from "react-router-dom";
// import "./i18n";

// Pages
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import ArticlePage from "./pages/ArticlePage";
import ProfilePage from "./pages/ProfilePage";
import ContactPage from "./pages/ContactPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ArticleManagementPage from "./pages/admin/article/ArticleManagementPage";
import NewArticlePage from "./pages/admin/article/NewArticlePage";
import EditArticlePage from "./pages/admin/article/EditArticlePage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
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

const AdminLayout = () => (
  <ProtectedRoute>
    <Outlet />{" "}
  </ProtectedRoute>
);

function App() {
  return (
    <ThemeProvider>
      <ArticleProvider>
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/blog/:slug" element={<ArticlePage />} />
            <Route path="/Profile" element={<ProfilePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/webApp" element={<WebAppPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

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

            <Route path="/atmin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />

              {/* Article */}
              <Route path="articles" element={<ArticleManagementPage />} />
              <Route path="new" element={<NewArticlePage />} />
              <Route path="edit/:id" element={<EditArticlePage />} />
              <Route path="category" element={<AdminCategoriesPage />} />

              {/*Archive*/}
              <Route
                path="/atmin/editArchive/:id"
                element={<EditArchivePage />}
              />

              {/* Attendance */}
              <Route path="presensi" element={<AttendanceStudentPage />} />

              <Route path="uploadArchive" element={<UploadArchivePage />} />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Router>
      </ArticleProvider>
    </ThemeProvider>
  );
}

export default App;

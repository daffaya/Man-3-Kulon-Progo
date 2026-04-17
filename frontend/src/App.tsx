/**
 * @fileoverview Main application component that sets up routing and context providers.
 * This file defines the application's routing structure, including public routes, protected admin routes,
 * and nested routes for various features like articles, galleries, attendance, student management, and staff management.
 */

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { GalleryProvider } from "./contexts/GalleryContext";
import { StudentStatsProvider } from "./contexts/StudentStatsContext";
import { StaffProvider } from "./contexts/StaffContext";
import { Outlet } from "react-router-dom";

// Pages
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/news/NewsPage";
import NewsDetailPage from "./pages/news/NewsDetailPage";
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
import AlumniPage from "./pages/alumni/AlumniPage";
import UserProfilePage from "./pages/admin/user/UserProfile";
import UserManagementPage from "./pages/admin/user/UserManagementPage";
import UnauthorizedHandler from "./components/ui/UnathorizedHandler";
import GalleryPage from "./pages/GalleryPage";
import AlbumPage from "./pages/AlbumPage";
import GalleryManagementPage from "./pages/admin/gallery/GalleryManagementPage";
import NewAlbumPage from "./pages/admin/gallery/NewAlbumPage";
import EditAlbumPage from "./pages/admin/gallery/EditAlbumPage";
import AlbumPhotosPage from "./pages/admin/gallery/AlbumPhotosPage";
import ZonaIntegritasPage from "./pages/layanan/ZonaIntegritasPage";
import SedumPage from "./pages/layanan/SedumPage";
import PtspPage from "./pages/layanan/PtspPage";
import StaffManagementPage from "./pages/admin/staff/StaffManagementPage";
import EditStaffPage from "./pages/admin/staff/EditStaffPage";
import NewStaffPage from "./pages/admin/staff/NewStaffPage";
import AttendanceCalendarPage from "./pages/admin/attendance/AttendanceCalendarPage";
import PmbmDaftarPage from "./pages/layanan/pmbm/PmbmDaftarPage";
import PmbmSuksesPage from "./pages/layanan/pmbm/PmbmSuksesPage";
import PmbmPage from "./pages/layanan/PmbmPage";
import PmbmManagementPage from "./pages/admin/pmbm/PmbmManagementPage";
import PmbmStatusPage from "./pages/layanan/pmbm/PmbmStatusPage";
import MaklumatPelayananPage from "./pages/layanan/MaklumatPelayanan";

/**
 * Layout wrapper component for admin routes that requires authentication.
 * Uses the ProtectedRoute component to ensure only authenticated users can access admin routes.
 */
const AdminLayout = () => (
  <ProtectedRoute>
    <Outlet />
  </ProtectedRoute>
);

/**
 * Root component of the application that sets up all routing and context providers.
 * Configures the application's routing structure including public routes, protected admin routes,
 * and nested routes for various features.
 */
function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            <ArticleProvider>
              <GalleryProvider>
                <StudentStatsProvider>
                  <StaffProvider>
                    {" "}
                    {/* Tambahkan StaffProvider */}
                    <UnauthorizedHandler />
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/berita" element={<NewsPage />} />
                      <Route
                        path="/berita/:slug"
                        element={<NewsDetailPage />}
                      />
                      <Route path="/Profile" element={<ProfilePage />} />
                      <Route path="/contact" element={<ContactPage />} />
                      <Route path="/webApp" element={<WebAppPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/layanan/pmbm" element={<PmbmPage />} />

                      <Route
                        path="/layanan/pmbm/status"
                        element={<PmbmStatusPage />}
                      />
                      <Route
                        path="/layanan/pmbm-daftar"
                        element={<PmbmDaftarPage />}
                      />
                      <Route
                        path="/layanan/pmbm/sukses"
                        element={<PmbmSuksesPage />}
                      />
                      <Route
                        path="/layanan/zona-integritas"
                        element={<ZonaIntegritasPage />}
                      />
                      <Route path="/layanan/sedum" element={<SedumPage />} />
                      <Route path="/layanan/ptsp" element={<PtspPage />} />
                      <Route
                        path="/layanan/maklumat-pelayanan"
                        element={<MaklumatPelayananPage />}
                      />

                      {/* Gallery Routes */}
                      <Route path="/galeri" element={<GalleryPage />} />
                      <Route path="/galeri/:slug" element={<AlbumPage />} />

                      <Route
                        path="/profile/sejarah"
                        element={<SejarahPage />}
                      />
                      <Route
                        path="/profile/struktur-organisasi"
                        element={<StrukturOrganisasiPage />}
                      />
                      <Route
                        path="/profile/visi-misi"
                        element={<VisiMisiPage />}
                      />
                      <Route
                        path="/profile/kepala-madrasah"
                        element={<KepalaMadrasahPage />}
                      />
                      <Route
                        path="/profile/guru-staf"
                        element={<GuruStafPage />}
                      />
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

                      <Route
                        path="/archives"
                        element={<ArchiveManagementPage />}
                      />

                      <Route path="/alumni" element={<AlumniPage />} />

                      <Route
                        path="/rekap-presensi"
                        element={<AttendanceRecapPage />}
                      />

                      <Route path="/atmin" element={<AdminLayout />}>
                        <Route index element={<AdminDashboard />} />
                        <Route
                          path="userProfile"
                          element={<UserProfilePage />}
                        />

                        {/* Article */}
                        <Route
                          path="articles"
                          element={<ArticleManagementPage />}
                        />
                        <Route
                          path="articles/new"
                          element={<NewArticlePage />}
                        />
                        <Route
                          path="articles/:id/edit"
                          element={<EditArticlePage />}
                        />
                        <Route
                          path="category"
                          element={<AdminCategoriesPage />}
                        />

                        {/* Gallery */}
                        <Route
                          path="gallery"
                          element={<GalleryManagementPage />}
                        />
                        <Route path="gallery/new" element={<NewAlbumPage />} />
                        <Route
                          path="gallery/:id/edit"
                          element={<EditAlbumPage />}
                        />
                        <Route
                          path="gallery/:id/photos"
                          element={<AlbumPhotosPage />}
                        />

                        {/* PMBM */}
                        <Route path="pmbm" element={<PmbmManagementPage />} />

                        {/* Staff Management */}
                        <Route path="staff" element={<StaffManagementPage />} />
                        <Route path="staff/new" element={<NewStaffPage />} />
                        <Route
                          path="staff/:id/edit"
                          element={<EditStaffPage />}
                        />

                        {/*Archive*/}
                        <Route
                          path="archives/:id/edit"
                          element={<EditArchivePage />}
                        />

                        {/* Attendance */}
                        <Route
                          path="presensi"
                          element={<AttendanceStudentPage />}
                        />
                        <Route
                          path="presensi/input"
                          element={<AttendanceInputPage />}
                        />

                        <Route
                          path="presensi/recap"
                          element={<AttendanceRecapPage />}
                        />
                        <Route
                          path="/atmin/presensi/calendar"
                          element={<AttendanceCalendarPage />}
                        />
                        <Route
                          path="presensi/holidays"
                          element={<AttendanceHolidaysPage />}
                        />
                        <Route
                          path="presensi/archive"
                          element={<AttendanceArchivePage />}
                        />
                        <Route
                          path="uploadArchive"
                          element={<UploadArchivePage />}
                        />

                        {/* Student Management */}
                        <Route
                          path="manajemen-siswa"
                          element={<ManajemenStudentPage />}
                        />

                        <Route path="users" element={<UserManagementPage />} />
                      </Route>

                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                  </StaffProvider>{" "}
                </StudentStatsProvider>
              </GalleryProvider>
            </ArticleProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;

/**
 * @fileoverview Main application component that sets up routing and context providers.
 * This file defines the application's routing structure, including public routes, protected admin routes,
 * and nested routes for various features like articles, galleries, attendance, student management, and staff management.
 */

import { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ArticleProvider } from "./contexts/ArticleContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { GalleryProvider } from "./contexts/GalleryContext";
import { StudentStatsProvider } from "./contexts/StudentStatsContext";
import { StaffProvider } from "./contexts/StaffContext";
import { Outlet } from "react-router-dom";
import { lazyWithRetry } from "./lib/lazyWithRetry";

// Eager: HomePage (first paint) + pieces needed by every route
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./ProtectedRoute";
import UnauthorizedHandler from "./components/ui/UnathorizedHandler";

// Code-split: tiap halaman jadi chunk sendiri
const NewsPage = lazyWithRetry(() => import("./pages/news/NewsPage"));
const NewsDetailPage = lazyWithRetry(() => import("./pages/news/NewsDetailPage"));
const ProfilePage = lazyWithRetry(() => import("./pages/ProfilePage"));
const ContactPage = lazyWithRetry(() => import("./pages/ContactPage"));
const AdminDashboard = lazyWithRetry(() => import("./pages/admin/AdminDashboard"));
const ArticleManagementPage = lazyWithRetry(() => import("./pages/admin/article/ArticleManagementPage"));
const NewArticlePage = lazyWithRetry(() => import("./pages/admin/article/NewArticlePage"));
const EditArticlePage = lazyWithRetry(() => import("./pages/admin/article/EditArticlePage"));
const LoginPage = lazyWithRetry(() => import("./pages/auth/LoginPage"));
const NotFoundPage = lazyWithRetry(() => import("./pages/NotFoundPage"));
const AdminCategoriesPage = lazyWithRetry(() => import("./pages/AdminCategoriesPage"));
const WebAppPage = lazyWithRetry(() => import("./pages/WebAppPage"));
const SejarahPage = lazyWithRetry(() => import("./pages/profile/SejarahPage"));
const GuruStafPage = lazyWithRetry(() => import("./pages/profile/GuruStafPage"));
const KepalaMadrasahPage = lazyWithRetry(() => import("./pages/profile/KepalaMadrasahPage"));
const MitraPage = lazyWithRetry(() => import("./pages/profile/MitraPage"));
const ProgramKerjaPage = lazyWithRetry(() => import("./pages/profile/ProgramKerjaPage"));
const SaranaPrasaranaPage = lazyWithRetry(() => import("./pages/profile/SaranaPrasaranaPage"));
const StrukturOrganisasiPage = lazyWithRetry(() => import("./pages/profile/StrukturOrganisasiPage"));
const VisiMisiPage = lazyWithRetry(() => import("./pages/profile/VisiMisiPage"));
const SiswaPage = lazyWithRetry(() => import("./pages/profile/SiswaPage"));
const AttendanceStudentPage = lazyWithRetry(() => import("./pages/admin/attendance/AttendanceStudentPage"));
const ArchiveManagementPage = lazyWithRetry(() => import("./pages/archive/ArchiveManagementPage"));
const UploadArchivePage = lazyWithRetry(() => import("./pages/archive/UploadArchivePage"));
const EditArchivePage = lazyWithRetry(() => import("./pages/archive/EditArchivePage"));
const YearTransitionPage = lazyWithRetry(() => import("./pages/admin/YearTransitionPage"));
const AttendanceInputPage = lazyWithRetry(() => import("./pages/admin/attendance/AttendanceInputPage"));
const AttendanceRecapPage = lazyWithRetry(() => import("./pages/admin/attendance/AttendanceRecapPage"));
const AttendanceHolidaysPage = lazyWithRetry(() => import("./pages/admin/attendance/AttendanceHolidaysPage"));
const AttendanceArchivePage = lazyWithRetry(() => import("./pages/admin/attendance/AttendanceArchivePage"));
const ManajemenStudentPage = lazyWithRetry(() => import("./pages/admin/student-management/ManagementStudentPage"));
const AlumniPage = lazyWithRetry(() => import("./pages/alumni/AlumniPage"));
const UserProfilePage = lazyWithRetry(() => import("./pages/admin/user/UserProfile"));
const UserManagementPage = lazyWithRetry(() => import("./pages/admin/user/UserManagementPage"));
const GalleryPage = lazyWithRetry(() => import("./pages/GalleryPage"));
const AlbumPage = lazyWithRetry(() => import("./pages/AlbumPage"));
const GalleryManagementPage = lazyWithRetry(() => import("./pages/admin/gallery/GalleryManagementPage"));
const NewAlbumPage = lazyWithRetry(() => import("./pages/admin/gallery/NewAlbumPage"));
const EditAlbumPage = lazyWithRetry(() => import("./pages/admin/gallery/EditAlbumPage"));
const AlbumPhotosPage = lazyWithRetry(() => import("./pages/admin/gallery/AlbumPhotosPage"));
const ZonaIntegritasPage = lazyWithRetry(() => import("./pages/layanan/ZonaIntegritasPage"));
const SedumPage = lazyWithRetry(() => import("./pages/layanan/SedumPage"));
const PtspPage = lazyWithRetry(() => import("./pages/layanan/PtspPage"));
const StaffManagementPage = lazyWithRetry(() => import("./pages/admin/staff/StaffManagementPage"));
const EditStaffPage = lazyWithRetry(() => import("./pages/admin/staff/EditStaffPage"));
const NewStaffPage = lazyWithRetry(() => import("./pages/admin/staff/NewStaffPage"));
const AttendanceCalendarPage = lazyWithRetry(() => import("./pages/admin/attendance/AttendanceCalendarPage"));
const PmbmDaftarPage = lazyWithRetry(() => import("./pages/layanan/pmbm/PmbmDaftarPage"));
const PmbmSuksesPage = lazyWithRetry(() => import("./pages/layanan/pmbm/PmbmSuksesPage"));
const PmbmPage = lazyWithRetry(() => import("./pages/layanan/PmbmPage"));
const PmbmManagementPage = lazyWithRetry(() => import("./pages/admin/pmbm/PmbmManagementPage"));
const PmbmStatusPage = lazyWithRetry(() => import("./pages/layanan/pmbm/PmbmStatusPage"));
const MaklumatPelayananPage = lazyWithRetry(() => import("./pages/layanan/MaklumatPelayanan"));
const CekKelulusanPage = lazyWithRetry(() => import("./pages/kelulusan/CekKelulusanPage"));
const KelulusanManagementPage = lazyWithRetry(() => import("./pages/admin/kelulusan/KelulusanManagementPage"));
const CmsOverviewPage = lazyWithRetry(() => import("./pages/admin/cms/CmsOverviewPage"));
const CmsPmbmForm = lazyWithRetry(() => import("./pages/admin/cms/CmsPmbmForm"));
const CmsHomeForm = lazyWithRetry(() => import("./pages/admin/cms/CmsHomeForm"));
const CmsKontakForm = lazyWithRetry(() => import("./pages/admin/cms/CmsKontakForm"));
const CmsMaklumatForm = lazyWithRetry(() => import("./pages/admin/cms/CmsMaklumatForm"));
const CmsWebAppForm = lazyWithRetry(() => import("./pages/admin/cms/CmsWebAppForm"));
const CmsSejarahForm = lazyWithRetry(() => import("./pages/admin/cms/CmsSejarahForm"));
const CmsVisiMisiForm = lazyWithRetry(() => import("./pages/admin/cms/CmsVisiMisiForm"));
const CmsKepalaMadrasahForm = lazyWithRetry(() => import("./pages/admin/cms/CmsKepalaMadrasahForm"));
const CmsStrukturForm = lazyWithRetry(() => import("./pages/admin/cms/CmsStrukturForm"));
const CmsProgramKerjaForm = lazyWithRetry(() => import("./pages/admin/cms/CmsProgramKerjaForm"));
const CmsSedumForm = lazyWithRetry(() => import("./pages/admin/cms/CmsSedumForm"));
const CmsPtspForm = lazyWithRetry(() => import("./pages/admin/cms/CmsPtspForm"));
const CmsZonaIntegritasForm = lazyWithRetry(() => import("./pages/admin/cms/CmsZonaIntegritasForm"));
const CmsMitraForm = lazyWithRetry(() => import("./pages/admin/cms/CmsMitraForm"));
const CmsSarprasForm = lazyWithRetry(() => import("./pages/admin/cms/CmsSarprasForm"));
const CmsSiswaForm = lazyWithRetry(() => import("./pages/admin/cms/CmsSiswaForm"));
const AdminShell = lazyWithRetry(() =>
  import("./components/layout/AdminLayout").then((m) => ({
    default: m.AdminShell,
  })),
);

/** Fallback ringan saat chunk halaman sedang diunduh. */
const PageFallback = () => (
  <div
    className="flex items-center justify-center text-secondary"
    style={{ minHeight: "50vh" }}
    role="status"
    aria-live="polite"
  >
    Memuat...
  </div>
);

/**
 * Layout wrapper component for admin routes that requires authentication.
 * Uses the ProtectedRoute component to ensure only authenticated users can access admin routes.
 */
const AdminLayout = () => (
  <ProtectedRoute>
    <Suspense fallback={<PageFallback />}>
      <AdminShell>
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </AdminShell>
    </Suspense>
  </ProtectedRoute>
);

/**
 * Layout wrapper for sections restricted to super_admin only.
 * Mirrors backend restrictTo(["super_admin"]) on adminCmsRoutes.js and
 * the /api/users POST|PUT routes. (AUDIT-022)
 */
const SuperAdminOnlyLayout = () => (
  <ProtectedRoute requiredRoles={["super_admin"]}>
    <Outlet />
  </ProtectedRoute>
);

/**
 * Layout wrapper for the kelulusan (graduation) admin section.
 * Mirrors backend restrictTo(["guru_bk", "super_admin"]) on
 * kelulusanRoutes.js. (AUDIT-022, mirrors AUDIT-004)
 */
const KelulusanLayout = () => (
  <ProtectedRoute requiredRoles={["guru_bk", "super_admin"]}>
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
                    <Suspense fallback={<PageFallback />}>
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
                      <Route path="/kelulusan" element={<CekKelulusanPage />} />
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

                        {/* Academic year wizard (super_admin only, enforced in the page and API) */}
                        <Route
                          path="tahun-ajaran"
                          element={<YearTransitionPage />}
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

                        {/* CMS — super_admin only, mirrors adminCmsRoutes.js (AUDIT-022) */}
                        <Route path="cms" element={<SuperAdminOnlyLayout />}>
                          <Route index element={<CmsOverviewPage />} />
                          <Route path="pmbm" element={<CmsPmbmForm />} />
                          <Route path="home" element={<CmsHomeForm />} />
                          <Route path="kontak" element={<CmsKontakForm />} />
                          <Route
                            path="maklumat-pelayanan"
                            element={<CmsMaklumatForm />}
                          />
                          <Route path="web-app" element={<CmsWebAppForm />} />
                          <Route path="sejarah" element={<CmsSejarahForm />} />
                          <Route
                            path="visi-misi"
                            element={<CmsVisiMisiForm />}
                          />
                          <Route
                            path="kepala-madrasah"
                            element={<CmsKepalaMadrasahForm />}
                          />
                          <Route
                            path="struktur-organisasi"
                            element={<CmsStrukturForm />}
                          />
                          <Route
                            path="program-kerja"
                            element={<CmsProgramKerjaForm />}
                          />
                          <Route path="sedum" element={<CmsSedumForm />} />
                          <Route path="ptsp" element={<CmsPtspForm />} />
                          <Route
                            path="zona-integritas"
                            element={<CmsZonaIntegritasForm />}
                          />
                          <Route path="mitra" element={<CmsMitraForm />} />
                          <Route
                            path="sarana-prasarana"
                            element={<CmsSarprasForm />}
                          />
                          <Route path="siswa" element={<CmsSiswaForm />} />
                        </Route>

                        <Route
                          path="kelulusan"
                          element={<KelulusanLayout />}
                        >
                          <Route
                            index
                            element={<KelulusanManagementPage />}
                          />
                        </Route>

                        <Route path="users" element={<SuperAdminOnlyLayout />}>
                          <Route index element={<UserManagementPage />} />
                        </Route>
                      </Route>

                      <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                    </Suspense>
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

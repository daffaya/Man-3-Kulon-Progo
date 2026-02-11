import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../contexts/AuthContext";
import AdminLayout from "../../../components/layout/AdminLayout";
import { ChevronLeft } from "lucide-react";
import AttendanceCalendarTab from "../../../components/attendance/AttendanceCalendarTab";

/**
 * Dedicated page for the attendance calendar feature
 * Displays a calendar view showing which classes have missing attendance
 */
const AttendanceCalendarPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const username =
    typeof user?.username === "string" && user.username
      ? user.username
      : "Guru BK";

  return (
    <AdminLayout>
      <div className="container mx-auto px-4 sm:px-6 py-12 fade-in">
        <div className="mb-8">
          <button
            onClick={() => navigate("/atmin/presensi")}
            className="text-sm text-secondary hover:text-accent flex items-center mb-4 transition-colors"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Kembali ke Dashboard Presensi
          </button>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            Kalender Presensi
          </h1>
          <p className="text-secondary">
            Pantau kelengkapan data absensi harian untuk semua kelas
          </p>
        </div>

        <div className="h-max">
          <AttendanceCalendarTab />
        </div>
      </div>
    </AdminLayout>
  );
};

export default AttendanceCalendarPage;

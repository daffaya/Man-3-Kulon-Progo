/**
 * @fileoverview Component for analyzing absence patterns in the attendance system.
 * This component provides functionality to view absence data by day of the week,
 * calendar heat map, and monthly trends with interactive visualizations.
 */
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  fetchClasses,
  fetchAbsenceByDayOfWeek,
  fetchAbsenceByDate,
  fetchStudentAbsencesByDate,
  fetchMonthlyAbsenceTrends,
  fetchStudentAbsencesByDayOfWeek, // MODIFIED: Added new import
} from "../../api/attendanceApi";
import { useAuth } from "../../contexts/AuthContext";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { Calendar, BarChart3, TrendingUp, X } from "lucide-react";

// --- Interfaces (no changes) ---
interface AbsenceDayData {
  day_name: string;
  day_number: number;
  total_alpa: number;
  percentage: number;
}

interface AbsenceDateData {
  date: string;
  total_alpa: number;
  percentage: number;
}

interface StudentData {
  id: number;
  nisn: string;
  name: string;
  notes: string;
  recorded_at: string;
  class_name: string;
}

interface MonthlyTrendData {
  month: number;
  month_name: string;
  total_alpa: number;
  percentage: number;
}

interface ClassData {
  id: number;
  name: string;
  academic_year: string;
  semester: string;
  total_siswa: number;
}

interface CalendarDay {
  date: string;
  day: number;
  month: number;
  year: number;
  total_alpa: number;
  percentage: number;
  isWeekend: boolean;
  isEmpty?: boolean;
}

const AbsenceAnalysisTabs = () => {
  const { token } = useAuth();
  const [classId, setClassId] = useState("all");
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1)
      .toISOString()
      .split("T")[0],
  );
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [activeTab, setActiveTab] = useState("dayOfWeek");
  const [loading, setLoading] = useState(false);
  const [classes, setClasses] = useState<ClassData[]>([]);

  // Data states for different tabs
  const [dayOfWeekData, setDayOfWeekData] = useState<AbsenceDayData[]>([]);
  const [dateData, setDateData] = useState<AbsenceDateData[]>([]);
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<MonthlyTrendData[]>([]);

  // MODIFIED & NEW: Added states for modal management
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [modalTitle, setModalTitle] = useState(""); // NEW: For dynamic modal title
  const [isModalLoading, setIsModalLoading] = useState(false); // NEW: For loading state inside modal

  useEffect(() => {
    const loadClasses = async () => {
      if (!token) return;
      try {
        const data = await fetchClasses(token);
        setClasses(data);
      } catch (error) {
        // Error fetching classes
      }
    };
    if (token) loadClasses();
  }, [token]);

  // Fetch data when parameters change
  useEffect(() => {
    if (!token) return;
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "dayOfWeek") {
          const data = await fetchAbsenceByDayOfWeek(
            {
              classId: classId === "all" ? undefined : Number(classId),
              startDate,
              endDate,
            },
            token,
          );
          setDayOfWeekData(data.data);
        } else if (activeTab === "byDate") {
          const data = await fetchAbsenceByDate(
            {
              classId: classId === "all" ? undefined : Number(classId),
              startDate,
              endDate,
            },
            token,
          );
          setDateData(data.data);
        } else if (activeTab === "monthly") {
          const data = await fetchMonthlyAbsenceTrends(
            {
              classId: classId === "all" ? undefined : Number(classId),
            },
            token,
          );
          setMonthlyTrends(data.data);
        }
      } catch (error) {
        // Error fetching data
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, classId, startDate, endDate, activeTab]);

  // Close modal when filters change to avoid showing stale data
  useEffect(() => {
    if (showStudentModal) {
      setShowStudentModal(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, startDate, endDate, activeTab]);

  // MODIFIED: Updated to set modal title
  const handleDateClick = async (date: string) => {
    if (!token) return;
    setSelectedDate(date);
    setIsModalLoading(true);

    // Set the title for the modal
    const formattedDate = new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    setModalTitle(`Detail Siswa Alpa - ${formattedDate}`);

    try {
      const data = await fetchStudentAbsencesByDate(
        {
          classId: classId === "all" ? undefined : Number(classId),
          date,
        },
        token,
      );
      setStudentData(data.data);
      setShowStudentModal(true);
    } catch (error) {
      // Error fetching student data
    } finally {
      setIsModalLoading(false);
    }
  };

  // NEW: Handler for clicking a row in the "Analisis per Hari" table
  const handleDayOfWeekClick = async (dayNumber: number, dayName: string) => {
    if (!token) return;
    setIsModalLoading(true);
    setModalTitle(`Detail Siswa Alpa - Hari ${dayName}`);
    setStudentData([]); // Clear previous data immediately

    try {
      const data = await fetchStudentAbsencesByDayOfWeek(
        {
          classId: classId === "all" ? undefined : Number(classId),
          startDate,
          endDate,
          dayOfWeek: dayNumber,
        },
        token,
      );
      setStudentData(data.data);
      setShowStudentModal(true);
    } catch (error) {
      // Error fetching student data
    } finally {
      setIsModalLoading(false);
    }
  };

  // Prepare data for charts (no changes)
  const dayOfWeekChartData = dayOfWeekData.map((item) => ({
    day: item.day_name,
    alpa: item.total_alpa,
    percentage: item.percentage,
  }));

  const dateChartData = dateData.map((item) => ({
    date: new Date(item.date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    }),
    fullDate: item.date,
    alpa: item.total_alpa,
    percentage: item.percentage,
  }));

  const monthlyChartData = monthlyTrends.map((item) => ({
    month: item.month_name,
    alpa: item.total_alpa,
    percentage: item.percentage,
  }));

  // Color scale for heat map (no changes)
  const getHeatMapColor = (percentage: number) => {
    if (percentage >= 20) return "rgba(220, 38, 38, 0.8)";
    if (percentage >= 15) return "rgba(249, 115, 22, 0.8)";
    if (percentage >= 10) return "rgba(245, 158, 11, 0.8)";
    if (percentage >= 5) return "rgba(234, 179, 8, 0.8)";
    if (percentage > 0) return "rgba(34, 197, 94, 0.8)";
    return "transparent";
  };

  // Generate calendar data (no changes)
  const generateCalendarData = (): CalendarDay[] => {
    if (!startDate || !endDate) {
      return [];
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const calendar: CalendarDay[] = [];
    const firstDayOfMonth = new Date(start.getFullYear(), start.getMonth(), 1);
    const startDayOfWeek = firstDayOfMonth.getDay();

    for (let i = 0; i < startDayOfWeek; i++) {
      calendar.push({
        date: "",
        day: 0,
        month: start.getMonth(),
        year: start.getFullYear(),
        total_alpa: 0,
        percentage: 0,
        isWeekend: false,
        isEmpty: true,
      });
    }

    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const dayData = dateData.find((item) => item.date === dateStr);

      const calendarDay: CalendarDay = {
        date: dateStr,
        day: currentDate.getDate(),
        month: currentDate.getMonth(),
        year: currentDate.getFullYear(),
        total_alpa: dayData?.total_alpa || 0,
        percentage: dayData?.percentage || 0,
        isWeekend: currentDate.getDay() === 0 || currentDate.getDay() === 6,
        isEmpty: false,
      };
      calendar.push(calendarDay);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return calendar;
  };

  const calendarData = generateCalendarData();

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 fade-in">
      <h1 className="text-3xl font-serif font-bold mb-6 text-foreground flex items-center">
        <BarChart3 className="mr-3 h-8 w-8" />
        Analisis Hari Sering Alpa
      </h1>

      {/* Filter Controls */}
      <div className="card p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Kelas
            </label>
            <select
              value={classId}
              onChange={(e) => setClassId(e.target.value)}
              className="form-input"
            >
              <option value="all">Semua Kelas</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="form-input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-foreground">
              Tanggal Selesai
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card p-6 mb-6">
        <div className="flex space-x-1 border-b border-zinc-800 mb-6">
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "dayOfWeek"
                ? "border-b-2 border-accent text-accent"
                : "text-secondary hover:text-foreground"
            }`}
            onClick={() => setActiveTab("dayOfWeek")}
          >
            <div className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analisis per Hari
            </div>
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "byDate"
                ? "border-b-2 border-accent text-accent"
                : "text-secondary hover:text-foreground"
            }`}
            onClick={() => setActiveTab("byDate")}
          >
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              Kalender Alpa
            </div>
          </button>
          <button
            className={`py-2 px-4 text-sm font-medium ${
              activeTab === "monthly"
                ? "border-b-2 border-accent text-accent"
                : "text-secondary hover:text-foreground"
            }`}
            onClick={() => setActiveTab("monthly")}
          >
            <div className="flex items-center">
              <TrendingUp className="mr-2 h-4 w-4" />
              Tren Bulanan
            </div>
          </button>
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
          </div>
        ) : (
          <>
            {/* Day of Week Analysis Tab */}
            {activeTab === "dayOfWeek" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Grafik Alpa Berdasarkan Hari
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dayOfWeekChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="alpa" fill="#ef4444" name="Jumlah Alpa" />
                  </BarChart>
                </ResponsiveContainer>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-semibackground">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Hari
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Jumlah Alpa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Persentase
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {dayOfWeekData.map((day) => (
                        <tr
                          key={day.day_number}
                          className="hover:bg-semibackground transition-colors cursor-pointer" // MODIFIED: Added cursor-pointer
                          onClick={() =>
                            handleDayOfWeekClick(day.day_number, day.day_name)
                          } // MODIFIED: Added onClick
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {day.day_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {day.total_alpa}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {day.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Calendar Heat Map Tab */}
            {activeTab === "byDate" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Kalender Alpa
                </h2>
                <p className="text-sm text-secondary mb-4">
                  Klik pada tanggal dengan warna untuk melihat detail siswa yang
                  alpa
                </p>
                {/* ... (rest of the calendar view is unchanged) ... */}
                <div className="mb-6 flex items-center flex-wrap gap-4">
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded mr-2 border border-gray-300"
                      style={{ backgroundColor: "rgba(34, 197, 94, 0.8)" }}
                    ></div>
                    <span className="text-sm text-secondary">
                      Rendah (&lt;5%)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded mr-2 border border-gray-300"
                      style={{ backgroundColor: "rgba(234, 179, 8, 0.8)" }}
                    ></div>
                    <span className="text-sm text-secondary">
                      Sedang (5-10%)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded mr-2 border border-gray-300"
                      style={{ backgroundColor: "rgba(245, 158, 11, 0.8)" }}
                    ></div>
                    <span className="text-sm text-secondary">
                      Tinggi (10-15%)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded mr-2 border border-gray-300"
                      style={{ backgroundColor: "rgba(249, 115, 22, 0.8)" }}
                    ></div>
                    <span className="text-sm text-secondary">
                      Sangat Tinggi (15-20%)
                    </span>
                  </div>
                  <div className="flex items-center">
                    <div
                      className="w-6 h-6 rounded mr-2 border border-gray-300"
                      style={{ backgroundColor: "rgba(220, 38, 38, 0.8)" }}
                    ></div>
                    <span className="text-sm text-secondary">
                      Ekstrem (&gt;20%)
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 mb-6">
                  {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center text-sm font-medium text-secondary py-2"
                      >
                        {day}
                      </div>
                    ),
                  )}
                  {calendarData.map((day, index) => {
                    if (day.isEmpty) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="aspect-square flex flex-col items-center justify-center rounded bg-semibackground opacity-30"
                        ></div>
                      );
                    }

                    const bgColor = getHeatMapColor(day.percentage);
                    return (
                      <div
                        key={index}
                        className={`aspect-square flex flex-col items-center justify-center rounded cursor-pointer transition-all ${
                          day.isWeekend ? "bg-semibackground" : "bg-background"
                        } ${
                          day.total_alpa > 0
                            ? "hover:ring-2 hover:ring-accent hover:ring-offset-2"
                            : "hover:bg-semibackground"
                        }`}
                        style={{
                          backgroundColor:
                            bgColor !== "transparent" ? bgColor : undefined,
                          border:
                            day.total_alpa > 0
                              ? "1px solid rgba(255,255,255,0.2)"
                              : "none",
                        }}
                        onClick={() =>
                          day.total_alpa > 0 && handleDateClick(day.date)
                        }
                      >
                        <div
                          className={`text-sm font-medium ${
                            day.total_alpa > 0
                              ? "text-foreground"
                              : "text-secondary"
                          }`}
                        >
                          {day.day}
                        </div>
                        {day.total_alpa > 0 && (
                          <div className="text-xs text-foreground font-medium">
                            {day.total_alpa}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dateChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="alpa"
                        stroke="#ef4444"
                        name="Jumlah Alpa"
                        strokeWidth={2}
                        dot={{ fill: "#ef4444" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </>
            )}

            {/* Monthly Trends Tab */}
            {activeTab === "monthly" && (
              <>
                <h2 className="text-xl font-semibold mb-4 text-foreground">
                  Tren Alpa Bulanan
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={monthlyChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="alpa"
                      stroke="#ef4444"
                      name="Jumlah Alpa"
                      strokeWidth={2}
                      dot={{ fill: "#ef4444" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#3b82f6"
                      name="Persentase (%)"
                      strokeWidth={2}
                      dot={{ fill: "#3b82f6" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-semibackground">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Bulan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Jumlah Alpa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Persentase
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {monthlyTrends.map((trend) => (
                        <tr
                          key={trend.month}
                          className="hover:bg-semibackground transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {trend.month_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {trend.total_alpa}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {trend.percentage}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* MODIFIED: Student Details Modal with dynamic title and loading state */}
      {showStudentModal &&
        createPortal(
          <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={() => setShowStudentModal(false)}
          >
            <div
              className="bg-background rounded-lg p-6 max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                {/* MODIFIED: Use dynamic modal title */}
                <h3 className="text-lg font-semibold text-foreground">
                  {modalTitle}
                </h3>
                <button
                  onClick={() => setShowStudentModal(false)}
                  className="text-secondary hover:text-foreground"
                >
                  <X size={20} />
                </button>
              </div>

              {isModalLoading ? ( // NEW: Show loading spinner inside modal
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                </div>
              ) : studentData.length === 0 ? (
                <p className="text-center text-secondary py-8">
                  Tidak ada siswa yang alpa pada periode ini.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-800">
                    <thead className="bg-semibackground">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          NISN
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Nama
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Kelas
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-secondary uppercase tracking-wider">
                          Keterangan
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800">
                      {studentData.map((student, index) => (
                        <tr key={student.id}>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-secondary">
                            {index + 1}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-secondary">
                            {student.nisn}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-foreground">
                            {student.name}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-secondary">
                            {student.class_name || "-"}
                          </td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-secondary">
                            {student.notes || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AbsenceAnalysisTabs;

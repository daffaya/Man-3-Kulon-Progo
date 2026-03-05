import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { createPortal } from "react-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  getDay,
  subMonths,
  addMonths,
} from "date-fns";
import { id } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { fetchMissingAttendance, fetchHolidays } from "../../api/attendanceApi";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Calendar as CalendarIcon,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface MissingAttendanceData {
  [date: string]: Array<{ id: number; name: string }>;
}

const AttendanceCalendarTab: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // State management
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [missingAttendance, setMissingAttendance] =
    useState<MissingAttendanceData>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cachedData, setCachedData] = useState<
    Record<string, MissingAttendanceData>
  >({});
  const [focusedDate, setFocusedDate] = useState<Date | null>(null);
  const [holidayDates, setHolidayDates] = useState<Set<string>>(new Set());

  const fetchingRef = useRef(false);

  const monthKey = useMemo(
    () => format(currentMonth, "yyyy-MM"),
    [currentMonth],
  );

  // Fetch Holidays
  useEffect(() => {
    const loadHolidays = async () => {
      if (!token) return;
      try {
        const data = await fetchHolidays(token);
        const dates = new Set<string>(
          data.map((h: any) => format(new Date(h.date), "yyyy-MM-dd")),
        );
        setHolidayDates(dates);
      } catch (error) {
        console.error("Failed to fetch holidays", error);
      }
    };

    loadHolidays();
  }, [token]);

  const fetchData = useCallback(async () => {
    if (!token || fetchingRef.current) return;

    if (cachedData[monthKey]) {
      setMissingAttendance(cachedData[monthKey]);
      return;
    }

    fetchingRef.current = true;
    setLoading(true);

    try {
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const data = await fetchMissingAttendance(
        {
          startDate: format(monthStart, "yyyy-MM-dd"),
          endDate: format(monthEnd, "yyyy-MM-dd"),
        },
        token,
      );

      setMissingAttendance(data);

      setCachedData((prev) => ({
        ...prev,
        [monthKey]: data,
      }));
    } catch (error) {
      console.error(error);
      showToast("Gagal memuat data kalender presensi", "error");
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [token, monthKey, currentMonth, cachedData, showToast]);

  useEffect(() => {
    fetchData();
  }, [monthKey, token]);

  const handlePrevMonth = useCallback(() => {
    const prevMonth = subMonths(currentMonth, 1);
    setCurrentMonth(prevMonth);
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    const nextMonth = addMonths(currentMonth, 1);
    setCurrentMonth(nextMonth);
  }, [currentMonth]);

  /**
   * Handle date click.
   * UPDATED: Strictly prevent opening modal if the date is a Holiday.
   */
  const handleDateClick = useCallback(
    (date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");

      // 1. Check if it's a holiday first
      if (holidayDates.has(dateStr)) {
        return; // Do nothing
      }

      // 2. Check if there is missing data
      if (missingAttendance[dateStr]) {
        setSelectedDate(date);
        setShowModal(true);
      }
    },
    [missingAttendance, holidayDates], // Added holidayDates dependency
  );

  const handleDateKeyDown = useCallback(
    (e: React.KeyboardEvent, date: Date) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleDateClick(date);
      } else if (
        e.key === "ArrowRight" ||
        e.key === "ArrowLeft" ||
        e.key === "ArrowUp" ||
        e.key === "ArrowDown"
      ) {
        e.preventDefault();
        const newDate = new Date(date);
        switch (e.key) {
          case "ArrowRight":
            newDate.setDate(newDate.getDate() + 1);
            break;
          case "ArrowLeft":
            newDate.setDate(newDate.getDate() - 1);
            break;
          case "ArrowUp":
            newDate.setDate(newDate.getDate() - 7);
            break;
          case "ArrowDown":
            newDate.setDate(newDate.getDate() + 7);
            break;
        }
        setFocusedDate(newDate);
      }
    },
    [handleDateClick],
  );

  const handleClassClick = useCallback(
    (classId: number, date: Date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      navigate(`/atmin/presensi/input?classId=${classId}&date=${dateStr}`);
      setShowModal(false);
    },
    [navigate],
  );

  const handleRefresh = useCallback(() => {
    setCachedData((prev) => {
      const newCache = { ...prev };
      delete newCache[monthKey];
      return newCache;
    });
    fetchData();
  }, [monthKey, fetchData]);

  const renderCalendar = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    const startDate = new Date(monthStart);
    startDate.setDate(startDate.getDate() - getDay(monthStart));

    const endDate = new Date(monthEnd);
    endDate.setDate(endDate.getDate() + (6 - getDay(monthEnd)));

    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const weekDays = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

    return (
      <div className="w-full h-full flex flex-col">
        <div className="grid grid-cols-7 gap-x-1 gap-y-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-[10px] font-bold text-secondary dark:text-gray-400 py-1"
            >
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 flex-grow">
          {days.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const isCurrentMonth = isSameMonth(date, currentMonth);
            const isToday = isSameDay(date, new Date());
            const isWeekend = getDay(date) === 0 || getDay(date) === 6;
            const isHoliday = holidayDates.has(dateStr);

            const hasMissingAttendance =
              missingAttendance[dateStr] && !isWeekend && !isHoliday;

            const missingCount = missingAttendance[dateStr]?.length || 0;
            const isFocused = isSameDay(date, focusedDate || new Date());

            const baseClass =
              "relative aspect-square rounded-xl flex flex-col items-center justify-center border transition-all duration-200 ease-out select-none";

            // If it's a holiday, we want it to look clickable=false visually,
            // so we remove hover effects for holidays
            const interactionClass = !isCurrentMonth
              ? "opacity-30 pointer-events-none"
              : isHoliday
                ? "cursor-default" // No pointer cursor for holidays
                : "cursor-pointer hover:scale-[1.05] active:scale-95";

            let variantClass = "";

            if (!isCurrentMonth) {
              variantClass =
                "bg-white border-white/5 dark:bg-gray-900 dark:border-gray-700";
            } else if (isWeekend) {
              variantClass =
                "bg-gray-100 text-gray-400 border-transparent dark:bg-gray-800 dark:text-gray-500";
            } else if (isHoliday) {
              variantClass =
                "bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-600";
            } else if (hasMissingAttendance) {
              variantClass =
                "bg-rose-100 text-rose-700 border border-rose-300 hover:bg-rose-200 dark:bg-rose-800/30 dark:text-rose-300 dark:border-rose-500 dark:hover:bg-rose-700/50";
            } else if (isToday) {
              variantClass =
                "bg-background text-primary border-2 border-emerald-500 shadow-md z-10 dark:bg-background dark:text-primary dark:border-emerald-400";
            } else {
              variantClass =
                "bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-500 dark:hover:bg-emerald-800/50";
            }

            const focusClass = isFocused
              ? "ring-2 ring-accent ring-offset-2 ring-offset-background"
              : "";

            return (
              <div
                key={dateStr}
                onClick={() => handleDateClick(date)}
                onKeyDown={(e) => handleDateKeyDown(e, date)}
                onFocus={() => setFocusedDate(date)}
                className={`${baseClass} ${variantClass} ${interactionClass} ${focusClass}`}
                tabIndex={isCurrentMonth && !isWeekend ? 0 : -1}
                role="button"
                aria-label={`Tanggal ${format(date, "d MMMM yyyy", { locale: id })}${hasMissingAttendance ? `, ${missingCount} kelas belum absen` : ""}${isHoliday ? ", Hari Libur" : ""}`}
                aria-pressed={hasMissingAttendance}
              >
                <span className="text-xs font-semibold">
                  {format(date, "d")}
                </span>

                {isHoliday && isCurrentMonth && (
                  <span
                    className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-yellow-600 dark:bg-yellow-400"
                    aria-hidden="true"
                  />
                )}

                {hasMissingAttendance && (
                  <div
                    className="absolute bottom-2 px-2 py-0.5 rounded-full text-[9px] font-bold
                  bg-rose-200 text-rose-700 border border-rose-300 dark:bg-rose-800/30 dark:text-rose-300 dark:border-rose-500"
                    aria-hidden="true"
                  >
                    {missingCount} kelas
                  </div>
                )}

                {!isWeekend &&
                  isCurrentMonth &&
                  !hasMissingAttendance &&
                  !isToday &&
                  !isHoliday && (
                    <span
                      className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400"
                      aria-hidden="true"
                    />
                  )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [
    currentMonth,
    missingAttendance,
    holidayDates,
    focusedDate,
    handleDateClick,
    handleDateKeyDown,
  ]);

  return (
    <div className="card h-full flex flex-col p-0 overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 bg-secondary/20">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-accent/10 text-accent shadow-sm shrink-0">
            <CalendarIcon size={18} strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
              Kalender Presensi
            </h2>
            <p className="text-[10px] sm:text-xs text-secondary hidden sm:block">
              Pantau kelengkapan data absensi harian
            </p>
          </div>
        </div>

        <div className="flex items-center bg-background rounded-lg p-1 border border-white/5 shadow-sm w-full sm:w-auto justify-between sm:justify-start">
          <button
            onClick={handlePrevMonth}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-md transition-all text-foreground disabled:opacity-50 disabled:hover:bg-transparent"
            aria-label="Bulan Sebelumnya"
            disabled={loading}
          >
            <ChevronLeft size={16} className="sm:w-[18px]" />
          </button>
          <h3 className="text-xs sm:text-sm font-semibold min-w-[80px] sm:min-w-[140px] text-center select-none text-foreground px-1 truncate">
            {format(currentMonth, "MMMM yyyy", { locale: id })}
          </h3>
          <button
            onClick={handleNextMonth}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-md transition-all text-foreground disabled:opacity-50 disabled:hover:bg-transparent"
            aria-label="Bulan Selanjutnya"
            disabled={loading}
          >
            <ChevronRight size={16} className="sm:w-[18px]" />
          </button>
          <button
            onClick={handleRefresh}
            className="p-1.5 sm:p-2 hover:bg-white/10 rounded-md transition-all text-foreground"
            aria-label="Perbarui Data"
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={`sm:w-[18px] ${loading ? "animate-spin" : ""}`}
            />
          </button>
        </div>
      </div>

      <div className="px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center gap-3 sm:gap-6 text-xs sm:text-sm border-b border-white/5">
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-full w-full bg-emerald-500"></span>
          </div>
          <span className="text-secondary">Lengkap</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="flex h-2.5 w-2.5 sm:h-3 sm:w-3 items-center justify-center rounded-full bg-rose-500/10 text-[8px] sm:text-[8px] font-bold text-rose-500 ring-1 ring-rose-500/20">
            !
          </div>
          <span className="text-secondary">Belum Lengkap</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-yellow-400 border border-yellow-500"></div>
          <span className="text-secondary">Hari Libur</span>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-secondary/30 border border-white/5"></div>
          <span className="text-secondary">Akhir Pekan</span>
        </div>
      </div>

      <div className="p-3 sm:p-6 flex-grow flex flex-col relative">
        {loading && !cachedData[monthKey] ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-accent"></div>
              <span className="text-[10px] sm:text-xs text-secondary animate-pulse">
                Memuat data...
              </span>
            </div>
          </div>
        ) : (
          <div className="flex-grow h-full">{renderCalendar}</div>
        )}
      </div>

      {showModal &&
        selectedDate &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 sm:bg-black/70 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
            onClick={() => setShowModal(false)}
          >
            <div
              className="bg-semibackground border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md h-[70vh] sm:max-h-[85vh] overflow-hidden flex flex-col animate-in slide-in-from-bottom-10 sm:zoom-in-95 sm:duration-200 ring-1 ring-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-5 border-b border-white/5 flex justify-between items-center bg-secondary/20 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="p-1.5 sm:p-2 bg-rose-500/10 rounded-lg text-rose-500">
                    <AlertCircle size={18} className="sm:w-5 sm:h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-foreground leading-tight">
                      Kelas Belum Absen
                    </h3>
                    <p className="text-[10px] sm:text-xs text-secondary mt-0.5">
                      {format(selectedDate, "EEEE, dd MMMM yyyy", {
                        locale: id,
                      })}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 sm:p-1.5 rounded-full hover:bg-white/10 text-secondary hover:text-white transition-colors"
                  aria-label="Tutup Modal"
                >
                  <X size={16} className="sm:w-[18px]" strokeWidth={2.5} />
                </button>
              </div>

              <div className="p-2 sm:p-2 overflow-y-auto flex-grow custom-scrollbar">
                <div className="space-y-1">
                  {missingAttendance[format(selectedDate, "yyyy-MM-dd")]?.map(
                    (cls) => (
                      <div
                        key={cls.id}
                        className="group flex items-center justify-between p-2.5 sm:p-3 rounded-xl border border-transparent hover:bg-white/5 hover:border-white/5 cursor-pointer transition-all duration-200 active:bg-white/10"
                        onClick={() => handleClassClick(cls.id, selectedDate)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleClassClick(cls.id, selectedDate);
                          }
                        }}
                      >
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-accent/10 text-accent flex items-center justify-center text-[10px] sm:text-xs font-bold border border-accent/5 group-hover:bg-accent group-hover:text-white transition-colors shrink-0">
                            {cls.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <span className="block font-medium text-foreground text-xs sm:text-sm group-hover:text-accent transition-colors truncate">
                              {cls.name}
                            </span>
                            <span className="text-[9px] sm:text-[10px] text-secondary font-mono">
                              ID: {cls.id}
                            </span>
                          </div>
                        </div>
                        <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border border-white/10 flex items-center justify-center bg-secondary/30 group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all shrink-0 ml-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="sm:w-4 sm:h-4"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              </div>

              <div className="p-3 sm:p-4 border-t border-white/5 bg-secondary/20 flex justify-center shrink-0">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn btn-danger hover:scale-105 active:scale-95 text-xs sm:text-sm text-white transition-colors px-6 py-2 rounded-lg w-full sm:w-auto"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default AttendanceCalendarTab;

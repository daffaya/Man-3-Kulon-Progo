const API_URL = import.meta.env.VITE_BACKEND_API_URL;

// Get students by class
export const fetchStudentsByClass = async (classId: number, token: string) => {
  const response = await fetch(
    `${API_URL}/api/attendance/students?classId=${classId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch students");
  }

  return response.json();
};

// Get attendance by date and class
export const fetchAttendanceByDateAndClass = async (
  classId: number,
  date: string,
  token: string
) => {
  const response = await fetch(
    `${API_URL}/api/attendance?classId=${classId}&date=${date}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to fetch attendance");
  }

  return response.json();
};

// Save attendance
export const saveAttendance = async (
  data: {
    classId: number;
    date: string;
    attendances: {
      studentId: number;
      status: "hadir" | "izin" | "sakit" | "alpa";
      notes?: string;
    }[];
  },
  token: string
) => {
  const response = await fetch(`${API_URL}/api/attendance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to save attendance");
  }

  return response.json();
};

// Get attendance recap
export const fetchAttendanceRecap = async (
  params: {
    classId: number;
    period: "daily" | "monthly" | "semester";
    startDate: string;
    endDate?: string;
  },
  token: string
) => {
  let url = `${API_URL}/api/attendance/recap?classId=${params.classId}&period=${params.period}&startDate=${params.startDate}`;

  if (params.endDate) {
    url += `&endDate=${params.endDate}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch attendance recap");
  }

  return response.json();
};

// Get classes
export const fetchClasses = async (token: string) => {
  const response = await fetch(`${API_URL}/api/attendance/classes`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch classes");
  }

  return response.json();
};

// Get holidays
export const fetchHolidays = async (token: string) => {
  const response = await fetch(`${API_URL}/api/attendance/holidays`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch holidays");
  }

  return response.json();
};

// Add holiday
export const addHoliday = async (
  data: {
    date: string;
    description: string;
    academicYear: string;
  },
  token: string
) => {
  const response = await fetch(`${API_URL}/api/attendance/holidays`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to add holiday");
  }

  return response.json();
};

// Delete holiday
export const deleteHoliday = async (id: number, token: string) => {
  const response = await fetch(`${API_URL}/api/attendance/holidays/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to delete holiday");
  }

  return response.json();
};

// Export attendance data
export const exportAttendanceData = async (
  params: {
    classId: number;
    period: "daily" | "monthly" | "semester";
    startDate: string;
    endDate?: string;
    format: "excel" | "pdf";
  },
  token: string
) => {
  let url = `${API_URL}/api/attendance/export?classId=${params.classId}&period=${params.period}&startDate=${params.startDate}&format=${params.format}`;

  if (params.endDate) {
    url += `&endDate=${params.endDate}`;
  }

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to export attendance data");
  }

  return response.blob();
};

// src/services/attendanceService.js
import { AttendanceModel } from "../models/attendanceModel.js";

export const AttendanceService = (dependencies) => {
  const model = AttendanceModel(dependencies);

  const createAttendance = async (data) => {
    // Validasi input
    if (!data.classId || !data.date) {
      throw new Error("Class ID and date are required");
    }

    // Cek hari libur
    const isHoliday = await model.checkHoliday(data.date);
    if (isHoliday) {
      throw new Error("Cannot create attendance for holiday");
    }

    // Simpan ke database
    return await model.create(data);
  };

  // ... method lainnya

  return { createAttendance };
};

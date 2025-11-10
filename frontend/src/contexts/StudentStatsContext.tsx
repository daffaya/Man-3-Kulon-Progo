// frontend/src/contexts/StudentStatsContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from "react";
import studentApi from "../api/studentApi";

interface StudentStatsState {
  totalStudents: number | null;
  loading: boolean;
  error: string | null;
}

type StudentStatsAction =
  | { type: "FETCH_STATS_REQUEST" }
  | { type: "FETCH_STATS_SUCCESS"; payload: number }
  | { type: "FETCH_STATS_FAILURE"; payload: string };

const initialState: StudentStatsState = {
  totalStudents: null,
  loading: true,
  error: null,
};

const studentStatsReducer = (
  state: StudentStatsState,
  action: StudentStatsAction
): StudentStatsState => {
  switch (action.type) {
    case "FETCH_STATS_REQUEST":
      return { ...state, loading: true, error: null };
    case "FETCH_STATS_SUCCESS":
      return { ...state, loading: false, totalStudents: action.payload };
    case "FETCH_STATS_FAILURE":
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

interface StudentStatsContextType {
  state: StudentStatsState;
  fetchStudentStats: () => Promise<void>;
}

const StudentStatsContext = createContext<StudentStatsContextType | undefined>(
  undefined
);

export const StudentStatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(studentStatsReducer, initialState);

  const fetchStudentStats = async () => {
    dispatch({ type: "FETCH_STATS_REQUEST" });
    try {
      const data = await studentApi.getStudentStats();
      dispatch({ type: "FETCH_STATS_SUCCESS", payload: data.totalStudents });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Gagal memuat statistik siswa";
      dispatch({ type: "FETCH_STATS_FAILURE", payload: errorMessage });
    }
  };

  useEffect(() => {
    fetchStudentStats();
  }, []);

  return (
    <StudentStatsContext.Provider value={{ state, fetchStudentStats }}>
      {children}
    </StudentStatsContext.Provider>
  );
};

export const useStudentStats = () => {
  const context = useContext(StudentStatsContext);
  if (context === undefined) {
    throw new Error(
      "useStudentStats must be used within a StudentStatsProvider"
    );
  }
  return context;
};

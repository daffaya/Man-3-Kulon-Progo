/**
 * @fileoverview StudentStatsContext for managing student statistics data.
 * This context provides state management for student statistics, including
 * the total number of students, loading states, and error handling.
 */

import React, { createContext, useContext, useReducer, useEffect } from "react";
import studentApi from "../api/studentApi";

/**
 * Represents the state structure for student statistics.
 */
interface StudentStatsState {
  totalStudents: number | null;
  loading: boolean;
  error: string | null;
}

/**
 * Defines all possible actions that can be dispatched to the studentStatsReducer.
 */
type StudentStatsAction =
  | { type: "FETCH_STATS_REQUEST" }
  | { type: "FETCH_STATS_SUCCESS"; payload: number }
  | { type: "FETCH_STATS_FAILURE"; payload: string };

const initialState: StudentStatsState = {
  totalStudents: null,
  loading: true,
  error: null,
};

/**
 * Reducer function to manage student statistics state based on dispatched actions.
 * @param state - The current state.
 * @param action - The action to be performed.
 * @returns The new state after applying the action.
 */
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

/**
 * Defines the shape of the context value, including the state and fetch function.
 */
interface StudentStatsContextType {
  state: StudentStatsState;
  fetchStudentStats: () => Promise<void>;
}

const StudentStatsContext = createContext<StudentStatsContextType | undefined>(
  undefined
);

/**
 * Provider component that manages the student statistics state and provides functions to interact with it.
 * @param children - The child components that will have access to the context.
 */
export const StudentStatsProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(studentStatsReducer, initialState);

  /**
   * Fetches student statistics from the API.
   * Updates the state with the total number of students or an error message if the request fails.
   */
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

/**
 * Custom hook to easily access the StudentStatsContext.
 * @throws An error if used outside of a StudentStatsProvider.
 * @returns The StudentStatsContext value.
 */
export const useStudentStats = () => {
  const context = useContext(StudentStatsContext);
  if (context === undefined) {
    throw new Error(
      "useStudentStats must be used within a StudentStatsProvider"
    );
  }
  return context;
};

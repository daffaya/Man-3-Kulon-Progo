/**
 * @fileoverview StaffContext for centralized staff data management.
 * Provides state management, reducers, and API interaction functions for staff-related data
 * across the application, including list, single record, and public recap data.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
} from "react";
import { staffApi } from "../api/staffApi";
import {
  Staff,
  StaffFormData,
  StaffFilters,
  StaffPaginationData,
  StaffRecap,
  Tendik,
} from "../types/staffTypes";

/** Application state for staff-related data */
interface StaffState {
  staffList: Staff[];
  currentStaff: Staff | null;
  teacherRecap: StaffRecap[];
  staffRecap: StaffRecap[];
  allTendik: Tendik[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    totalPages: number;
    currentPage: number;
  };
}

/** All possible actions for the staff reducer */
type StaffAction =
  | { type: "FETCH_STAFF_REQUEST" }
  | { type: "FETCH_STAFF_SUCCESS"; payload: { data: Staff[]; pagination: any } }
  | { type: "FETCH_STAFF_FAILURE"; payload: string }
  | { type: "FETCH_STAFF_BY_ID_SUCCESS"; payload: Staff }
  | { type: "CREATE_STAFF_SUCCESS"; payload: Staff }
  | { type: "UPDATE_STAFF_SUCCESS"; payload: Staff }
  | { type: "DELETE_STAFF_SUCCESS"; payload: number }
  | { type: "FETCH_TEACHER_RECAP_SUCCESS"; payload: StaffRecap[] }
  | { type: "FETCH_STAFF_RECAP_SUCCESS"; payload: StaffRecap[] }
  | { type: "FETCH_ALL_TENDIK_SUCCESS"; payload: Tendik[] };

const initialState: StaffState = {
  staffList: [],
  currentStaff: null,
  teacherRecap: [],
  staffRecap: [],
  allTendik: [],
  loading: false,
  error: null,
  pagination: {
    total: 0,
    totalPages: 0,
    currentPage: 1,
  },
};

/**
 * Reducer handling all staff-related state transitions.
 */
const staffReducer = (state: StaffState, action: StaffAction): StaffState => {
  switch (action.type) {
    case "FETCH_STAFF_REQUEST":
      return { ...state, loading: true, error: null };

    case "FETCH_STAFF_SUCCESS":
      return {
        ...state,
        loading: false,
        staffList: action.payload.data,
        pagination: action.payload.pagination,
      };

    case "FETCH_STAFF_FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "FETCH_STAFF_BY_ID_SUCCESS":
      return { ...state, currentStaff: action.payload };

    case "CREATE_STAFF_SUCCESS":
      return {
        ...state,
        staffList: [action.payload, ...state.staffList],
      };

    case "UPDATE_STAFF_SUCCESS":
      return {
        ...state,
        staffList: state.staffList.map((staff) =>
          staff.id === action.payload.id ? action.payload : staff
        ),
        currentStaff: action.payload,
      };

    case "DELETE_STAFF_SUCCESS":
      return {
        ...state,
        staffList: state.staffList.filter(
          (staff) => staff.id !== action.payload
        ),
      };

    case "FETCH_TEACHER_RECAP_SUCCESS":
      return { ...state, teacherRecap: action.payload };

    case "FETCH_STAFF_RECAP_SUCCESS":
      return { ...state, staffRecap: action.payload };

    case "FETCH_ALL_TENDIK_SUCCESS":
      return { ...state, allTendik: action.payload };

    default:
      return state;
  }
};

/** Shape of the StaffContext value */
interface StaffContextType {
  state: StaffState;
  fetchStaffList: (filters?: StaffFilters) => Promise<void>;
  fetchStaffById: (id: number) => Promise<Staff>;
  createStaff: (formData: StaffFormData) => Promise<void>;
  updateStaff: (id: number, formData: StaffFormData) => Promise<void>;
  deleteStaff: (id: number) => Promise<void>;
  fetchTeacherRecap: () => Promise<void>;
  fetchStaffRecap: () => Promise<void>;
  fetchAllTendik: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

/**
 * Provider component that wraps the app and supplies staff state and actions.
 */
export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(staffReducer, initialState);

  const fetchStaffList = useCallback(async (filters: StaffFilters = {}) => {
    dispatch({ type: "FETCH_STAFF_REQUEST" });
    try {
      const response = await staffApi.getStaffList(filters);
      dispatch({
        type: "FETCH_STAFF_SUCCESS",
        payload: {
          data: response.data,
          pagination: {
            total: response.total,
            totalPages: response.totalPages,
            currentPage: response.currentPage,
          },
        },
      });
    } catch (error) {
      dispatch({
        type: "FETCH_STAFF_FAILURE",
        payload:
          error instanceof Error ? error.message : "An unknown error occurred",
      });
    }
  }, []);

  const fetchStaffById = useCallback(async (id: number): Promise<Staff> => {
    try {
      const data = await staffApi.getStaffById(id);
      dispatch({ type: "FETCH_STAFF_BY_ID_SUCCESS", payload: data });
      return data;
    } catch (error) {
      throw error;
    }
  }, []);

  const createStaff = useCallback(async (formData: StaffFormData) => {
    try {
      const newStaff = await staffApi.createStaff(formData);
      dispatch({ type: "CREATE_STAFF_SUCCESS", payload: newStaff });
    } catch (error) {
      throw error;
    }
  }, []);

  const updateStaff = useCallback(
    async (id: number, formData: StaffFormData) => {
      try {
        const updatedStaff = await staffApi.updateStaff(id, formData);
        dispatch({ type: "UPDATE_STAFF_SUCCESS", payload: updatedStaff });
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const deleteStaff = useCallback(async (id: number) => {
    try {
      await staffApi.deleteStaff(id);
      dispatch({ type: "DELETE_STAFF_SUCCESS", payload: id });
    } catch (error) {
      throw error;
    }
  }, []);

  const fetchTeacherRecap = useCallback(async () => {
    try {
      const response = await staffApi.getTeacherRecap();
      dispatch({ type: "FETCH_TEACHER_RECAP_SUCCESS", payload: response.data });
    } catch {
      // Silent failure – recap data is non-critical
    }
  }, []);

  const fetchStaffRecap = useCallback(async () => {
    try {
      const response = await staffApi.getStaffRecap();
      dispatch({ type: "FETCH_STAFF_RECAP_SUCCESS", payload: response.data });
    } catch {
      // Silent failure
    }
  }, []);

  const fetchAllTendik = useCallback(async () => {
    try {
      const response = await staffApi.getAllTendik();
      dispatch({ type: "FETCH_ALL_TENDIK_SUCCESS", payload: response.data });
    } catch {
      // Silent failure
    }
  }, []);

  return (
    <StaffContext.Provider
      value={{
        state,
        fetchStaffList,
        fetchStaffById,
        createStaff,
        updateStaff,
        deleteStaff,
        fetchTeacherRecap,
        fetchStaffRecap,
        fetchAllTendik,
      }}
    >
      {children}
    </StaffContext.Provider>
  );
};

/**
 * Hook to access the StaffContext.
 * Must be used within a StaffProvider.
 */
export const useStaff = (): StaffContextType => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within a StaffProvider");
  }
  return context;
};

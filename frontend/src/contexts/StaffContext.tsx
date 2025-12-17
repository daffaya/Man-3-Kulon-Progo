/**
 * @fileoverview StaffContext for managing staff data.
 * This context provides state management and API interactions for staff data throughout the application.
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
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

/**
 * Represents the state structure for staff data.
 */
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

/**
 * Defines all possible actions that can be dispatched to the staffReducer.
 */
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
 * Reducer function to manage staff-related state based on dispatched actions.
 * @param state - The current state.
 * @param action - The action to be performed.
 * @returns The new state after applying the action.
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

/**
 * Defines the shape of the context value, including the state and all action functions.
 */
interface StaffContextType {
  state: StaffState;
  fetchStaffList: (filters?: StaffFilters) => Promise<void>;
  fetchStaffById: (id: number) => Promise<void>;
  createStaff: (formData: StaffFormData) => Promise<void>;
  updateStaff: (id: number, formData: StaffFormData) => Promise<void>;
  deleteStaff: (id: number) => Promise<void>;
  fetchTeacherRecap: () => Promise<void>;
  fetchStaffRecap: () => Promise<void>;
  fetchAllTendik: () => Promise<void>;
}

const StaffContext = createContext<StaffContextType | undefined>(undefined);

/**
 * Provider component that manages the staff state and provides functions to interact with it.
 * @param children - The child components that will have access to the context.
 */
export const StaffProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(staffReducer, initialState);

  /**
   * Fetches staff list from the API with optional filters.
   * @param filters - Optional filters to apply to the query.
   */
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

  /**
   * Fetches a single staff by ID.
   * @param id - The ID of the staff to fetch.
   */
  const fetchStaffById = useCallback(async (id: number) => {
    try {
      const data = await staffApi.getStaffById(id);
      dispatch({ type: "FETCH_STAFF_BY_ID_SUCCESS", payload: data });
    } catch (error) {
      console.error("Error fetching staff by ID:", error);
    }
  }, []);

  /**
   * Creates a new staff.
   * @param formData - The data for the new staff.
   */
  const createStaff = useCallback(async (formData: StaffFormData) => {
    try {
      const newStaff = await staffApi.createStaff(formData);
      dispatch({ type: "CREATE_STAFF_SUCCESS", payload: newStaff });
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Updates an existing staff.
   * @param id - The ID of the staff to update.
   * @param formData - The updated data for the staff.
   */
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

  /**
   * Deletes a staff by ID.
   * @param id - The ID of the staff to delete.
   */
  const deleteStaff = useCallback(async (id: number) => {
    try {
      await staffApi.deleteStaff(id);
      dispatch({ type: "DELETE_STAFF_SUCCESS", payload: id });
    } catch (error) {
      throw error;
    }
  }, []);

  /**
   * Fetches teacher recap data.
   */
  const fetchTeacherRecap = useCallback(async () => {
    try {
      const response = await staffApi.getTeacherRecap();
      // Ekstrak hanya bagian data dari response
      dispatch({ type: "FETCH_TEACHER_RECAP_SUCCESS", payload: response.data });
    } catch (error) {
      console.error("Error fetching teacher recap:", error);
    }
  }, []);

  /**
   * Fetches staff recap data.
   */
  const fetchStaffRecap = useCallback(async () => {
    try {
      const response = await staffApi.getStaffRecap();
      // Ekstrak hanya bagian data dari response
      dispatch({ type: "FETCH_STAFF_RECAP_SUCCESS", payload: response.data });
    } catch (error) {
      console.error("Error fetching staff recap:", error);
    }
  }, []);

  /**
   * Fetches all tendik data.
   */
  const fetchAllTendik = useCallback(async () => {
    try {
      const response = await staffApi.getAllTendik();
      // Ekstrak hanya bagian data dari response
      dispatch({ type: "FETCH_ALL_TENDIK_SUCCESS", payload: response.data });
    } catch (error) {
      console.error("Error fetching all tendik:", error);
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
 * Custom hook to easily access the StaffContext.
 * @throws An error if used outside of an StaffProvider.
 * @returns The StaffContext value.
 */
export const useStaff = () => {
  const context = useContext(StaffContext);
  if (!context) {
    throw new Error("useStaff must be used within an StaffProvider");
  }
  return context;
};

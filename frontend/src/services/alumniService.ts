/**
 * @fileoverview Service layer for managing alumni-related business logic.
 * This module acts as an intermediary between the UI components and the alumni API,
 * handling data transformation and API calls for alumni operations.
 */

// frontend/src/services/alumniService.ts
import { alumniApi } from "../api/alumniApi";
import { Alumni, AlumniFilter, AlumniResponse } from "../types/alumniTypes";

export const alumniService = {
  /**
   * Fetches a list of alumni based on the provided filter criteria.
   * @param params - The filter parameters for the query.
   * @param token - Optional authentication token.
   * @returns A promise resolving to the paginated alumni response.
   */
  getAlumni: async (
    params: AlumniFilter,
    token?: string | null,
  ): Promise<AlumniResponse> => {
    return alumniApi.getAlumni(params, token);
  },

  /**
   * Updates the details of a specific alumni record.
   * @param id - The ID of the alumni to update.
   * @param data - The data fields to update.
   * @param token - Authentication token.
   * @returns A promise resolving to the update result.
   */
  updateAlumni: async (
    id: number,
    data: {
      status?: string;
      workplace?: string;
      business?: string;
      university?: string;
    },
    token: string,
  ): Promise<any> => {
    return alumniApi.updateAlumni(id, data, token);
  },

  /**
   * Retrieves a specific alumni record by their ID.
   * @param id - The ID of the alumni to retrieve.
   * @param token - Authentication token.
   * @returns A promise resolving to the alumni data.
   */
  getAlumniById: async (id: number, token: string): Promise<Alumni> => {
    return alumniApi.getAlumniById(id, token);
  },
};

// src/lib/api.ts

/**
 * @fileoverview A utility module for making API requests to the backend.
 * It provides a centralized `apiFetch` function that handles base URL construction,
 * default headers, cookie-based authentication, timeouts, and comprehensive error handling.
 */

const API_BASE = "https://backend.man3kulonprogo.sch.id/api";

/**
 * A wrapper function around the native `fetch` API to simplify communication with the backend.
 * It automatically prepends the base API URL, includes credentials for cookie-based authentication,
 * sets the 'Content-Type' header to 'application/json', and has a 15-second timeout.
 *
 * This function uses generics to ensure type safety for the returned data.
 *
 * @template T The expected type of the response JSON data. Defaults to `any`.
 *
 * @param {string} endpoint - The API endpoint to request (e.g., 'users' or '/posts/123').
 * The leading slash is optional.
 * @param {RequestInit} [options={}] - Optional. The configuration options for the request,
 * such as `method`, `body`, and additional `headers`. Defaults to an empty object.
 *
 * @returns {Promise<T>} A Promise that resolves to the parsed JSON data from the response,
 * cast to type `T`, on a successful request.
 *
 * @throws {Error} Throws an `Error` in several conditions:
 * 1. **Timeout**: If the request does not complete within 15 seconds.
 * 2. **Offline**: If there is no internet connection (`navigator.onLine` is `false`).
 * 3. **HTTP Error**: If the server responds with a status code outside the 200-299 range.
 *    The thrown error will be enhanced with `status` (the HTTP status code) and `data`
 *    (the parsed error response from the server) properties.
 *
 * @example
 * // GET request to fetch all users
 * const users = await apiFetch<User[]>('/users');
 *
 * @example
 * // POST request to create a new user
 * const newUser = await apiFetch<User>('users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John Doe', email: 'john.doe@example.com' }),
 * });
 */
export const apiFetch = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${API_BASE}${cleanEndpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds

  try {
    const response = await fetch(url, {
      ...options,
      credentials: "include", // to include cookies for authentication
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    // Try to parse JSON, if it fails (e.g., server returns an HTML error page)
    let data: any;
    try {
      data = await response.json();
    } catch {
      data = { error: "Server returned an invalid response" };
    }

    if (!response.ok) {
      const message =
        data?.error ||
        data?.message ||
        response.statusText ||
        `HTTP ${response.status}`;

      // Friendly message for the user
      const friendly =
        {
          400: "The data sent is invalid",
          401: "Your session has expired — please log in again",
          403: "Access denied",
          404: "Data not found",
          500: "The server is having problems, please try again later",
          502: "The server is under maintenance",
          503: "The server is busy",
        }[response.status] || message;

      const error = new Error(friendly) as any;
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      throw new Error("Connection timed out, please try again");
    }

    if (!navigator.onLine) {
      throw new Error("No internet connection");
    }

    throw err?.message ? err : new Error("An unexpected error occurred");
  }
};

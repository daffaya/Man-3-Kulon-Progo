/**
 * @fileoverview Shared helper for sending safe 500 error responses.
 * Logs full error detail server-side only; the client only ever sees a
 * generic (or explicitly-chosen) public message — never raw error.message,
 * which can leak DB column/table names or query fragments. (AUDIT-012)
 */

/**
 * Sends a 500 response without leaking internal error detail to the client.
 * @param {import('express').Response} res - Express response object.
 * @param {Error} error - The caught error (logged server-side only).
 * @param {string} [publicMessage] - Safe message to return to the client.
 * @returns {import('express').Response}
 */
export const sendServerError = (
  res,
  error,
  publicMessage = "Terjadi kesalahan pada server",
) => {
  console.error(error);
  return res.status(500).json({ error: publicMessage });
};

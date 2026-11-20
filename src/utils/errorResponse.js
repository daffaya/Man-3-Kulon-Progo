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

/**
 * Error with an HTTP status, thrown by services for expected (business-rule)
 * failures: 400 validation, 403 access, 404 not found, 409 conflict,
 * 422 business-rule violation. Anything else is treated as a 500.
 */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.name = "HttpError";
    this.status = status;
  }
}

/**
 * Sends the right response for a caught error: HttpError -> its status and
 * message; anything else -> logged server-side and a generic 500.
 * @param {import('express').Response} res
 * @param {Error} error
 * @param {string} [publicMessage] - Safe message for unexpected errors.
 */
export const sendError = (res, error, publicMessage) => {
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }
  return sendServerError(res, error, publicMessage);
};

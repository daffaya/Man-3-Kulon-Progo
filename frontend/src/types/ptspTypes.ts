/**
 * @fileoverview Type definitions for PTSP (Pelayanan Terpadu Satu Pintu) services.
 * This file defines the TypeScript interface for a single PTSP service item,
 * ensuring type safety across components that handle PTSP data.
 */

/**
 * Represents a single service available in the PTSP system.
 * Each service has a name, description, category, and a link to its corresponding Google Form.
 */
export interface PtspService {
  /** The unique identifier for the service. */
  id: string;
  /** The display name of the service. */
  name: string;
  /** A brief description of what the service is for. */
  description: string;
  /** The category to which the service belongs (e.g., 'Akademik', 'Layanan Umum'). */
  category: string;
  /** The URL to the Google Form for this service. */
  googleFormUrl: string;
  /** The name of the icon from the icon library (e.g., lucide-react). */
  icon: string;
}

/**
 * @fileoverview PtspServiceCard component for displaying a single PTSP service.
 * This component renders a clickable card with an icon, service name, and description.
 * Clicking anywhere on the card will navigate to the corresponding Google Form.
 * It uses a predefined icon map for safe and type-safe dynamic icon rendering.
 */

import React from "react";
import { PtspService } from "../../types/ptspTypes";
// Import only the icons we need from lucide-react
import {
  FileCheck,
  ShieldCheck,
  UserCheck,
  Wrench,
  CalendarDays,
  GraduationCap,
  FileText,
  Users,
  FileQuestion, // A good fallback icon for "not found"
} from "lucide-react";

/**
 * Props for the PtspServiceCard component.
 */
interface PtspServiceCardProps {
  /** The service data to display. */
  service: PtspService;
}

/**
 * A predefined map of icon names to their corresponding lucide-react components.
 * This provides type safety and prevents errors from typos in the icon name.
 */
const iconMap: Record<string, React.ComponentType<any>> = {
  FileCheck,
  ShieldCheck,
  UserCheck,
  Wrench,
  CalendarDays,
  GraduationCap,
  FileText,
  Users,
};

/**
 * Helper component to render an icon from our predefined iconMap.
 * It takes the icon name as a string and renders the corresponding icon component.
 * If the icon name is not found in the map, it defaults to the 'FileQuestion' icon.
 */
const DynamicIcon: React.FC<{ name: string; className?: string }> = ({
  name,
  className,
}) => {
  const IconComponent = iconMap[name];

  if (IconComponent) {
    return <IconComponent className={className} />;
  }

  // Fallback to a default icon if the name is not found in the map
  return <FileQuestion className={className} />;
};

/**
 * A fully clickable card component that displays information about a single PTSP service.
 * It includes the service's icon, name, and description. Clicking anywhere on the card
 * opens the service's Google Form in a new tab.
 *
 * @param {PtspServiceCardProps} props - The props for the component.
 * @returns {JSX.Element} The rendered service card.
 */
const PtspServiceCard: React.FC<PtspServiceCardProps> = ({ service }) => {
  return (
    // PERUBAHAN UTAMA: Membungkus seluruh kartu dengan tag <a>
    <a
      href={service.googleFormUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden card p-6 transition-all duration-300 ease-in-out hover:-translate-y-1 hover:border-[rgb(var(--color-accent))] cursor-pointer"
    >
      {/* Icon Container */}
      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-[rgb(var(--color-accent)),0.1] text-[rgb(var(--color-accent))] mb-4 group-hover:bg-[rgb(var(--color-accent)),0.2] transition-colors">
        <DynamicIcon name={service.icon} className="w-6 h-6" />
      </div>

      {/* Service Title */}
      <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-[rgb(var(--color-accent))] transition-colors">
        {service.name}
      </h3>

      {/* Service Description */}
      <p className="text-secondary text-sm leading-relaxed mb-4">
        {service.description}
      </p>

      {/* Call to Action Text - Bukan link lagi */}
      <span className="inline-flex items-center text-sm font-medium text-[rgb(var(--color-accent))]">
        Ajukan Permohonan
      </span>

      {/* Hover Accent Border */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[rgb(var(--color-accent))] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
    </a>
  );
};

export default PtspServiceCard;

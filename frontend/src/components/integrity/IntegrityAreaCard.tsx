/**
 * @fileoverview IntegrityAreaCard component for displaying a clickable card with an icon, title, and description.
 */

import React from "react";
import { ChevronRight } from "lucide-react";

/**
 * Props for the IntegrityAreaCard component
 */
interface Props {
  /** The unique identifier for the card. */
  id: number;
  /** The main title displayed on the card. */
  title: string;
  /** The descriptive text displayed below the title. */
  description: string;
  /** The React element (icon) to be displayed on the card. */
  icon: React.ReactNode;
  /** The function to call when the card is clicked. */
  onClick: () => void;
}

/**
 * IntegrityAreaCard component that renders a clickable card.
 * It displays an icon, a title, a description, and a chevron icon.
 *
 * @param {Props} props - The component props.
 * @returns {JSX.Element} The rendered card component.
 */
const IntegrityAreaCard: React.FC<Props> = ({
  id,
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <div
      className="bg-background border border-border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer hover:border-accent/50"
      onClick={onClick}
    >
      <div className="flex items-start">
        <div className="bg-accent/10 p-3 rounded-lg mr-4 flex-shrink-0">
          <div className="text-accent">{icon}</div>
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2 text-foreground">{title}</h3>
          <p className="text-secondary text-sm">{description}</p>
        </div>
        <ChevronRight className="text-accent mt-1 flex-shrink-0" />
      </div>
    </div>
  );
};

export default IntegrityAreaCard;
